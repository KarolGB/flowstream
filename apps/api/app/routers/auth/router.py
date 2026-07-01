from fastapi import APIRouter, Depends, HTTPException, Depends
from sqlalchemy.orm import Session
from routers.auth.services import login_user, create_user, logout_user, refresh_tokens, verify_refresh_token
from database.session import get_db
from .schemas import UserCreate, UserLogin, UserResponse

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)) -> UserResponse:
    return login_user(db, user.email, user.password)

@router.post("/register")
def register(user: UserCreate,db: Session = Depends(get_db)) -> UserResponse:
    return create_user(db, user.username, user.email, user.password)

@router.post("/refresh")
def refresh_token(db: Session = Depends(get_db), payload: dict = Depends(verify_refresh_token)) -> UserResponse:
    return refresh_tokens(db, payload)

@router.post("/logout")
def logout(db: Session = Depends(get_db), payload: dict = Depends(verify_refresh_token)) :
    logout_user(db, payload)