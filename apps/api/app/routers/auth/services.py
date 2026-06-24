from fastapi import Depends, HTTPException

from sqlalchemy.orm import Session
from hashlib import sha256
from pwdlib import PasswordHash
import jwt
from datetime import datetime, timedelta, timezone

from database.session import get_db
from routers.auth.schemas import RefreshTokenRequest
from database.models.user import User
from database.models.refresh_tokens import RefreshToken
from core.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES, ALGORITHM


password_hash = PasswordHash.recommended()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def hash_string(input_string: str) -> str:
    return sha256(input_string.encode()).hexdigest()

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def verify_refresh_token(refresh_token: RefreshTokenRequest, db: Session = Depends(get_db)) -> dict:
    refresh_token = refresh_token.refresh_token
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    if payload.get("sub") is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    hashed_token = hash_string(refresh_token)
    token_entry = db.query(RefreshToken).filter(RefreshToken.token == hashed_token).first()
    if not token_entry or token_entry.is_revoked:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    payload["refresh_token"] = refresh_token
    return payload

def create_token(data: dict, expires_delta: int) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
    payload.update({"exp": expire})
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=[ALGORITHM])
    return encoded_jwt

def create_access_token(data: dict):
    return create_token(data, ACCESS_TOKEN_EXPIRE_MINUTES)


def create_refresh_token(data: dict):
    return create_token(data, REFRESH_TOKEN_EXPIRE_MINUTES)

def insert_refresh_token(db: Session, user_id: int, refresh_token: str):
    hashed_token = hash_string(refresh_token)
    new_token = RefreshToken(token=hashed_token, user_id=user_id)
    db.add(new_token)
    db.commit()
    db.refresh(new_token)
    return new_token

def login_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    insert_refresh_token(db, user.id, refresh_token)
    return {"access_token": access_token, "refresh_token": refresh_token}

def create_user(db: Session, username: str, email: str, password: str) -> User:
    hashed_password = hash_password(password)
    user = get_user_by_email(db, email)
    if user:
        return None
    new_user = User(name=username, email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"sub": new_user.email})
    refresh_token = create_refresh_token(data={"sub": new_user.email})
    insert_refresh_token(db, new_user.id, refresh_token)
    return {"access_token": access_token, "refresh_token": refresh_token}

def revoke_refresh_token(db: Session, refresh_token: str):
    hashed_token = hash_string(refresh_token)
    token_entry = db.query(RefreshToken).filter(RefreshToken.token == hashed_token).first()
    if token_entry:
        token_entry.is_revoked = True
        db.commit()

def refresh_tokens(db: Session, payload: dict) -> dict:
    email = payload.get("sub")
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    revoke_refresh_token(db, payload.get("refresh_token"))
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    return {"access_token": access_token, "refresh_token": refresh_token}

def logout_user(db: Session, payload: dict):
    revoke_refresh_token(db, payload.get("refresh_token"))