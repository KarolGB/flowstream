
from fastapi import APIRouter, Depends, HTTPException
from core.security import verify_access_token

from infraestructure.youtube.client import get_audio_stream_url

router = APIRouter(prefix="/stream",tags=["stream"])

@router.get("/{youtube_id}")
def stream(youtube_id: str, user_id = Depends(verify_access_token)):
    stream_url = get_audio_stream_url(youtube_id)
    if not stream_url:
        raise HTTPException(status_code=403, detail="Stream URL not found")
    return {"stream_url": stream_url}