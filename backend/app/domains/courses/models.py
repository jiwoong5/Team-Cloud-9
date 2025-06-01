from datetime import datetime, time
from typing import Optional

from sqlmodel import Field
from sqlmodel import SQLModel


class Course(SQLModel, table=True):
    __tablename__ = "courses"
    id: Optional[int] = Field(default=None, primary_key=True)
    course_code: str = Field(index=True, nullable=False, max_length=10)
    name: str = Field(nullable=False, max_length=100)
    description: Optional[str] = Field(default=None)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    location: Optional[str] = Field(default=None, max_length=100)
    days_of_week: Optional[str] = Field(default=None, max_length=20)
    start_time: Optional[time] = Field(default=None)
    end_time: Optional[time] = Field(default=None)
    department_id: int = Field(foreign_key="departments.id", nullable=False)
    credits: Optional[int] = Field(default=3)
    capacity: Optional[int] = Field(default=30)
    enrolled: Optional[int] = Field(default=0)
    prerequisite: Optional[str] = Field(default=None, max_length=100)
    semester: Optional[str] = Field(default=None, max_length=10)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
