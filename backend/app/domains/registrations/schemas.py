from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RegisterCreate(BaseModel):
    course_id: int
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "course_id": 1
            }
        }
    )


class RegisterRead(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime

    class Config:
        from_attributes = True


class SummarizedRegisterRead(BaseModel):
    user_name: str
    credits: int
