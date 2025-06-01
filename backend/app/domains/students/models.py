from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field

if TYPE_CHECKING:
    pass


class Student(SQLModel, table=True):
    __tablename__ = "students"
    id: Optional[int] = Field(default=None, primary_key=True)
    # student_number: str = Field(unique=True, max_length=20)
    name: str = Field(nullable=False, max_length=100)
    email: str = Field(nullable=False, unique=True, max_length=255)
    # department: str = Field(max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

