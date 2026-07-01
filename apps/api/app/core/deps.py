import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from core.config import SECRET_KEY, ALGORITHM

oauth_scheme = HTTPBearer()

def verify_access_token(token = Depends(oauth_scheme)) -> dict:
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") is None:
            raise HTTPException(status_code=401, detail="Invalid access token")
        payload["access_token"] = token.credentials
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid access token")
