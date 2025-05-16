from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Student(SQLModel, table=True):
    __tablename__ = "students"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str         = Field(nullable=False, max_length=100)
    email: str        = Field(nullable=False, unique=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)