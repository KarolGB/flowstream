from ..session import Base
from sqlalchemy import Column, Integer, String

class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    youtube_id = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(100), nullable=False)
    artist = Column(String(100), nullable=False)
    thumbnail = Column(String(255), nullable=True)
    duration_seconds = Column(Integer, nullable=False)