# app/domains/departments/models.py

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class Department(SQLModel, table=True):
    __tablename__ = "departments"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=100)
    code: str = Field(nullable=False, unique=True, max_length=10)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)