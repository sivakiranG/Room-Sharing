# Import all models here so Alembic can detect them
from app.db.session import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.room import Room  # noqa: F401
from app.models.room_member import RoomMember  # noqa: F401
from app.models.item import Item  # noqa: F401
from app.models.consumption import Consumption  # noqa: F401
