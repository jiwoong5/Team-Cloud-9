from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class Register(SQLModel, table=True):
    __tablename__ = "registrations"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    course_id: int = Field(foreign_key="courses.id", nullable=False)
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
