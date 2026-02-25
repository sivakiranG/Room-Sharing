import uuid
import secrets
from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    invite_code: Mapped[str] = mapped_column(
        String(12), unique=True, nullable=False, default=lambda: secrets.token_urlsafe(8)
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    members = relationship("RoomMember", back_populates="room", cascade="all, delete-orphan")
    items = relationship("Item", back_populates="room", cascade="all, delete-orphan")
    chores = relationship("Chore", back_populates="room", cascade="all, delete-orphan")
