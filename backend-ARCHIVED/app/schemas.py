from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    title: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    title: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProjectCreate(BaseModel):
    name: str
    category: Optional[str] = None
    status: str = "Planejado"
    technologies: list[str] = []
    description: Optional[str] = None


class ProjectOut(ProjectCreate):
    id: str

    class Config:
        from_attributes = True


class ExperienceCreate(BaseModel):
    title: str
    description: str
    project: Optional[str] = None
    category: str
    technologies: list[str] = []
    date: date
    result: Optional[str] = None
    competencies: list[str] = []


class ExperienceOut(ExperienceCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
