from ..session import Base
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from datetime import datetime



class PlaylistTrack(Base):
    __tablename__ = "playlist_tracks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    playlist_id = Column(ForeignKey("playlists.id"), nullable=False, ondelete="CASCADE")
    track_id = Column(ForeignKey("tracks.id"), nullable=False)
    position = Column(Integer, nullable=False)
    added_at = Column(DateTime, nullable=False, default=datetime.utcnow)