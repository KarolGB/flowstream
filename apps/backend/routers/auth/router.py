from fastapi import APIRouter, Depends, HTTPException, Response
from .schemas import LoginRequest, RegisterRequest
from core.security import verify_access_token, verify_refresh_token
from .services import check_user_credentials, create_tokens, create_user, get_user_data, revoke_refresh_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(response : Response,login_request: LoginRequest):
    identifier = login_request.identifier
    password = login_request.password
    if not check_user_credentials(identifier, password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = get_user_data(identifier)
    access_token , refresh_token = create_tokens(user["id"])
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True)
    return {"access_token": access_token, "refresh_token": refresh_token}

@router.post("/register")
async def register(response: Response,register_request: RegisterRequest, payload = Depends(verify_access_token)):
    if payload is None or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    if get_user_data(register_request.identifier) or get_user_data(register_request.email):
        raise HTTPException(status_code=400, detail="User with this username or email already exists")
    new_user_id = create_user(register_request.identifier, register_request.password, register_request.email)
    if not new_user_id:
        raise HTTPException(status_code=500, detail="User creation failed")
    access_token , refresh_token = create_tokens(new_user_id)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True)
    return {"access_token": access_token, "refresh_token": refresh_token}

@router.post("/refresh")
async def refresh(response: Response, payload = Depends(verify_refresh_token)):
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    access_token , refresh_token = create_tokens(user_id)
    revoke_refresh_token(payload["token"])
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True)
    return {"access_token": access_token, "refresh_token": refresh_token}

@router.post("/logout")
async def logout(response: Response, payload = Depends(verify_refresh_token)):
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    revoke_refresh_token(payload["token"])
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully"}

@router.get("/me")
async def me(payload = Depends(verify_access_token)):
    return {"user_id": payload["sub"]}