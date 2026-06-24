from ..session import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    is_revoked = Column(Boolean, default=False)