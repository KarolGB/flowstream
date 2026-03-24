from fastapi import APIRouter, Depends, HTTPException
from infraestructure.youtube.client import search_tracks,get_track_info
from core.security import verify_access_token
from db.database import db_connection

router = APIRouter(prefix="/catalog",tags=["catalog"])

@router.get("/search")
async def search(query: str, user_id = Depends(verify_access_token)):
    results = search_tracks(query)
    return {"results": results}

@router.get("/track/{youtube_id}")
async def get_track(youtube_id: str, user_id = Depends(verify_access_token)):
    with db_connection() as cursor:
        cursor.execute("SELECT * FROM tracks WHERE youtube_id = %s", (youtube_id,))
        track_info = cursor.fetchone()
        if not track_info:
            track_info = get_track_info(youtube_id)
    return track_info