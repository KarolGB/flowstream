from pydantic import BaseModel

class LoginRequest(BaseModel):
    identifier: str
    password: str
    
class RegisterRequest(LoginRequest):
    email:str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    
class RefreshTokenRequest(BaseModel):
    refresh_token: str