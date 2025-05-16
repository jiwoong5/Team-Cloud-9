from datetime import datetime
from pydantic import BaseModel


class RegisterCreate(BaseModel):
    student_id: int
    course_id: int
    professor_id: int


class RegisterRead(BaseModel):
    id: int
    student_id: int
    course_id: int
    professor_id: int
    enrolled_at: datetime

    class Config:
        from_attributes = True
