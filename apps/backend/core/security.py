
from fastapi import Depends, Request
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
            return None
        payload["token"] = token.credentials
        return payload
    except jwt.PyJWTError:
        return None
    
def verify_refresh_token(request: Request):
    token = request.cookies.get("refresh_token")
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
            if result is None:
                return None
        payload["token"] = token
        return payload
    except jwt.PyJWTError as e:
        print(e)    
        return None