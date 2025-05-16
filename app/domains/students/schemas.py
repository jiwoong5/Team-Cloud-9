from datetime import datetime

from pydantic import BaseModel, EmailStr


class StudentRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
