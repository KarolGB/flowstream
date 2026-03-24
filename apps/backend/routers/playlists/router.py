from fastapi import APIRouter, Depends, UploadFile, HTTPException
from core.security import verify_access_token
from db.database import db_connection
from .schemas import PlaylistCreateRequest, PlaylistAddTrack
from .services import get_csv_tracks, create_playlist_db
from infraestructure.youtube.client import search_tracks


router = APIRouter(prefix="/playlists",tags=["playlists"])

@router.get("/")
def get_playlists(payload = Depends(verify_access_token)):
    user_id = payload["sub"]
    with db_connection() as cursor:
        cursor.execute("SELECT * FROM playlists WHERE user_id = %s", (user_id,))
        playlists = cursor.fetchall()
    return playlists

@router.post("/")
def create_playlist(playlist_data: PlaylistCreateRequest, payload = Depends(verify_access_token)):
    user_id = payload["sub"]
    playlist_id = create_playlist_db(user_id,playlist_data.name,playlist_data.description)
    if not playlist_id:
        raise HTTPException(status_code=400, detail="Error al crear la playlist")
    return {"message": "Playlist created successfully"}

@router.get("/{playlist_id}")
def get_playlist(playlist_id: str, payload = Depends(verify_access_token)):
    user_id = payload["sub"]
    with db_connection() as cursor:
        cursor.execute("SELECT * FROM playlists WHERE id = %s", (playlist_id,))
        playlist = cursor.fetchone()
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist no encontrada")
        if playlist["is_public"] == 1 or playlist["user_id"] == user_id:
            tracks_query = "SELECT t.id,t.youtube_id,t.title,t.artist,t.thumbnail,t.duration_seconds,pt.position from playlists_tracks as pt inner join tracks as t on pt.track_id = t.id where pt.playlist_id = %s ORDER BY pt.position ASC"
            cursor.execute(tracks_query, (playlist_id,))
            tracks = cursor.fetchall()
            return {
                "id": playlist["id"],
                "name": playlist["name"],
                "description": playlist["description"],
                "total_tracks": len(tracks),
                "tracks": tracks
            }
        raise HTTPException(status_code=403, detail="No tienes acceso a esta playlist")


@router.delete("/{playlist_id}")
def delete_playlist(playlist_id: str, payload = Depends(verify_access_token)):
    user_id = payload["sub"]
    with db_connection() as cursor:
        cursor.execute("DELETE FROM playlists where id = %s AND user_id = %s", (playlist_id, user_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=403,detail="No tienes acceso a esta playlist")
        return {"message": "Playlist deleted successfully"}

@router.post("/{playlist_id}/tracks")
def add_track_to_playlist(playlist_id: str, track_data : PlaylistAddTrack, payload = Depends(verify_access_token)):
    user_id = payload["sub"]
    with db_connection() as cursor:
        cursor.execute("SELECT id FROM playlists WHERE id = %s AND user_id = %s", (playlist_id, user_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Playlist no encontrada o sin acceso")
        cursor.execute("SELECT id FROM tracks WHERE youtube_id = %s", (track_data.youtube_id,))
        result = cursor.fetchone()
        if not result:
            cursor.execute("INSERT INTO tracks (youtube_id,title,artist,thumbnail,duration_seconds) VALUES (%s, %s,%s,%s,%s)",(track_data.youtube_id,track_data.name,track_data.artist,track_data.thumbnail,track_data.duration_seconds))
            track_id = cursor.lastrowid
        else:
            track_id = result["id"]
        cursor.execute("SELECT MAX(position) as pos FROM playlists_tracks WHERE playlist_id = %s", (playlist_id,))
        max_position = cursor.fetchone()["pos"]
        if max_position is None:
            max_position = 0
        max_position += 1
        cursor.execute("INSERT INTO playlists_tracks (playlist_id, track_id,position) VALUES (%s, %s,%s)", (playlist_id, track_id,max_position))
    return {"message": "Track added to playlist successfully"}

@router.delete("/{playlist_id}/tracks/{track_id}")
def delete_track_from_playlist(playlist_id: str, track_id: str, payload = Depends(verify_access_token)):
    user_id = payload["sub"]
    with db_connection() as cursor:
        cursor.execute("SELECT id from playlists WHERE id = %s AND user_id = %s", (playlist_id, user_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="No tienes acceso a esta playlist")
        cursor.execute("DELETE FROM playlists_tracks WHERE playlist_id = %s AND track_id = %s", (playlist_id, track_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Track not found in playlist")
    return {"message": "Track deleted from playlist successfully"}

@router.post("/import-csv")
def import_playlists_from_csv(file: UploadFile, payload = Depends(verify_access_token)):
    content =  file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="No se pudo leer el archivo")
    user_id = payload["sub"]
    playlist_id = create_playlist_db(user_id,"Mi playlist importada")
    tracks = get_csv_tracks(content)
    position = 1
    with db_connection() as cursor:
        for track in tracks:
            title_search = f"%{track['title']}%"
            artist_search = f"%{track['artist']}%"
            cursor.execute("SELECT id from tracks WHERE title LIKE %s AND artist LIKE %s", (title_search, artist_search))
            result = cursor.fetchone()
            if result:
                track_id = result["id"]
            else:
                search_resut = search_tracks(f"{track['title']} {track['artist']}")
                if not search_resut:
                    continue
                track_data = search_resut[0]
                cursor.execute("INSERT INTO tracks (youtube_id, title,artist,thumbnail,duration_seconds) VALUES (%s, %s,%s,%s,%s)",(track_data["youtube_id"],track_data["title"],track_data["artist"],track_data["thumbnail_url"],track_data["duration_seconds"]))
                track_id = cursor.lastrowid
            cursor.execute("INSERT INTO playlists_tracks (playlist_id, track_id,position) VALUES (%s, %s,%s)", (playlist_id, track_id,position))
            position += 1
    return {"message": "Playlists imported successfully"}