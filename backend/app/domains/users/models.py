from datetime import datetime
from enum import Enum
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field

if TYPE_CHECKING:
    pass

class UserRole(str, Enum):
    STUDENT = "student"
    PROFESSOR = "professor"
    ADMIN = "admin"


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(nullable=False, max_length=100)
    email: str = Field(nullable=False, unique=True, max_length=255)
    hashed_password: str
    role: str = Field(default="student")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
