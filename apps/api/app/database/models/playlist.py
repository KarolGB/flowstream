from ..session import Base
from sqlalchemy import Column, Integer, Null, String, Boolean, DateTime, ForeignKey
from datetime import datetime

class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True, default=Null)
    is_public = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
