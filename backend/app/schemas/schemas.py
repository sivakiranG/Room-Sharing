import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Room Schemas ──────────────────────────────────────────────────────────────

class RoomCreate(BaseModel):
    name: str


class RoomJoin(BaseModel):
    invite_code: str


class RoomMemberOut(BaseModel):
    id: uuid.UUID
    user: UserOut
    joined_at: datetime

    model_config = {"from_attributes": True}


class RoomOut(BaseModel):
    id: uuid.UUID
    name: str
    invite_code: str
    created_at: datetime
    members: list[RoomMemberOut] = []

    model_config = {"from_attributes": True}


# ── Item Schemas ──────────────────────────────────────────────────────────────

class ItemCreate(BaseModel):
    name: str
    total_quantity: float
    unit: str = "pieces"

    @field_validator("total_quantity")
    @classmethod
    def must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v


class ItemOut(BaseModel):
    id: uuid.UUID
    room_id: uuid.UUID
    name: str
    total_quantity: float
    remaining_quantity: float
    unit: str
    created_by: uuid.UUID
    created_at: datetime
    creator: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class ConsumeRequest(BaseModel):
    quantity: float
    user_id: Optional[uuid.UUID] = None

    @field_validator("quantity")
    @classmethod
    def must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v


# ── Consumption / Activity Schemas ────────────────────────────────────────────

class ConsumptionOut(BaseModel):
    id: uuid.UUID
    item_id: uuid.UUID
    user_id: uuid.UUID
    quantity_consumed: float
    created_at: datetime

    model_config = {"from_attributes": True}


class ActivityEntry(BaseModel):
    id: uuid.UUID
    activity_type: str = "consumption"  # "consumption" or "refill"
    user_name: str  # The person who consumed (for consumption) or added (for refill)
    recorded_by_name: Optional[str] = None # The person who actually performed the action
    item_name: str
    quantity: float # Unified name for quantity_consumed or total_quantity
    unit: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UsageSummaryEntry(BaseModel):
    user_id: uuid.UUID
    user_name: str
    item_name: str
    unit: str
    total_consumed: float
