# app/domains/professors/models.py
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class Professor(SQLModel, table=True):
    __tablename__ = "professors"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=100)
    email: str = Field(nullable=False, unique=True, max_length=255)
    office: Optional[str] = Field(default=None, max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)