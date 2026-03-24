from pydantic import BaseModel

class PlaylistCreateRequest(BaseModel):
    name: str
    description: str | None = None
    
class PlaylistImportRequest(BaseModel):
    name: str = "Mi Playlist importada"
    description: str | None = None
    
class PlaylistAddTrack(BaseModel):
    youtube_id: str
    name:str
    artist:str
    thumbnail:str
    duration_seconds:str