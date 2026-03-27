
from fastapi import Request
import jwt
from db.database import db_connection
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
from datetime import datetime, timedelta, timezone
from core.security import hash_string, pwd_hasher
from .schemas import RefreshTokenRequest



def check_user_credentials(username: str, password: str) -> bool:
    with db_connection() as cursor:
        cursor.execute("SELECT * FROM users WHERE username = %s or email = %s", (username, username))
        result = cursor.fetchone()
        if result is None:
            return False
        stored_password = result["password"]
        return pwd_hasher.verify(password, stored_password)
    
def get_user_data(identifier:str):
    with db_connection() as cursor:
        cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (identifier, identifier))
        result = cursor.fetchone()
        return result
    
def create_user(username: str, password: str, email: str)-> bool:
    hashed_password = pwd_hasher.hash(password)
    with db_connection() as cursor:
        try:
            cursor.execute("INSERT INTO users (username, password, email) VALUES (%s, %s, %s)", (username, hashed_password, email))
            return cursor.lastrowid
        except Exception as e:
            print(e)
            return False
    
def create_tokens(user_id: str):
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    return access_token, refresh_token

def create_access_token(user_id: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(user_id: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    token_hash = hash_string(encoded_jwt)
    with db_connection() as cursor:
        cursor.execute("INSERT INTO refresh_tokens (user_id, token) VALUES (%s, %s)", (user_id, token_hash))
    return encoded_jwt

def revoke_refresh_token(token: str):
    token_hash = hash_string(token)
    with db_connection() as cursor:
        cursor.execute("UPDATE refresh_tokens SET is_revoked = 1 WHERE token = %s", (token_hash,))
        
def verify_refresh_token(request: Request, refresh_token: RefreshTokenRequest):
    token = request.cookies.get("refresh_token")
    if token is None:
        token = refresh_token.refresh_token
    if token is None:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        token_hash = hash_string(token)
        with db_connection() as cursor:
            cursor.execute("SELECT * FROM refresh_tokens WHERE token = %s", (token_hash,))
            result = cursor.fetchone()
            if result is None or result.get("is_revoked") == 1:
                return None
        payload["token"] = token
        return payload
    except jwt.PyJWTError as e:
        print(e)    
        return None