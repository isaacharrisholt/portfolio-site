import uuid
from datetime import datetime, date
from typing import List, Optional

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
    description: str
    start_date: date
    end_date: date = None


class WorkExperience(WorkExperienceCreate):
    id: uuid.UUID | str

    class Config:
        orm_mode = True


class PersonalProjectCreate(BaseModel):
    name: str
    description: str
    skills: List[str]
    url: Optional[str] = None


class PersonalProject(PersonalProjectCreate):
    id: uuid.UUID | str

    class Config:
        orm_mode = True
