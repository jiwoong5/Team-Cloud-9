from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel


class CourseRead(BaseModel):
    id: int
    course_code: str
    name: str
    description: Optional[str] = None
    professor_id: int
    location: Optional[str] = None
    days_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    department_id: int
    credits: Optional[int] = None
    capacity: Optional[int] = None
    enrolled: Optional[int] = None
    prerequisite: Optional[str] = None
    semester: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    course_code: str
    name: str
    description: Optional[str] = None
    professor_id: int
    location: Optional[str] = None
    days_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    department_id: int
    credits: Optional[int] = None
    capacity: Optional[int] = None
    enrolled: Optional[int] = None
    prerequisite: Optional[str] = None
    semester: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    days_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    credits: Optional[int] = None
    capacity: Optional[int] = None
    prerequisite: Optional[str] = None
    semester: Optional[str] = None
    enrolled: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
