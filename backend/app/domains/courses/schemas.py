from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CourseRead(BaseModel):
    id: int
    course_code: str
    name: str
    description: Optional[str] = None
    user_id: int
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
    user_id: int
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

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "course_code": "CB2001568-059",
                "name": "클라우드컴퓨팅",
                "description": "null",
                "professor_id": 7,
                "location": "제 6공학관 6514호실",
                "days_of_week": "null",
                "start_time": "13:30:00",
                "end_time": "14:45:00",
                "department_id": 3,
                "credits": 3,
                "capacity": "null",
                "enrolled": "null",
                "prerequisite": "null",
                "semester": "1학기",
                "created_at": "null",
                "updated_at": "null"
            }
        }
    )


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
