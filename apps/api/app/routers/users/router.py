from fastapi import APIRouter, Depends
from core.deps import verify_access_token

router = APIRouter(
    prefix="/user",
    tags=["user"],
)

@router.get("/me")
def me(payload: dict = Depends(verify_access_token)):
    return {"email": payload.get("sub")}