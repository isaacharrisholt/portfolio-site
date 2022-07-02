import uuid
from datetime import datetime

from pydantic import BaseModel


class FormMessageCreate(BaseModel):
    name: str
    email: str
    message: str


class FormMessage(FormMessageCreate):
    created_at: datetime
    id: uuid.UUID | str

    class Config:
        orm_mode = True


class WorkExperienceCreate(BaseModel):
    company: str
    position: str
    start_date: datetime
    end_date: datetime = None
    description: str = None


class WorkExperience(WorkExperienceCreate):
    id: uuid.UUID | str

    class Config:
        orm_mode = True
