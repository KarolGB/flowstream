from pydantic import BaseModel, EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    access_token: str
    refresh_token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str