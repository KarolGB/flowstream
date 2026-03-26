
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from pwdlib import PasswordHash
from hashlib import sha256
from db.database import db_connection
from core.config import SECRET_KEY, ALGORITHM
import jwt


oauth2_scheme = HTTPBearer()


pwd_hasher = PasswordHash.recommended()

def hash_string(input_string: str) -> str:
    return sha256(input_string.encode()).hexdigest()

def verify_access_token(token = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid access token")
        payload["token"] = token.credentials
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    
