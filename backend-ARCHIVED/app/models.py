# NOTA DE ARQUITETURA: Experience.project é texto livre (não FK), pra bater
# exatamente com o types.ts do frontend (Experience.project: string). Projects
# continua com CRUD próprio, mas sem relação obrigatória com Experience por
# enquanto — dívida técnica registrada, resolver quando o fluxo estiver estável.
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base


def gen_id() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiences = relationship("Experience", back_populates="owner", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    status = Column(String, default="Planejado")
    technologies = Column(JSON, default=list)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="projects")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    project = Column(String, nullable=True)  # texto livre, igual ao types.ts
    category = Column(String, nullable=False)
    technologies = Column(JSON, default=list)
    date = Column(Date, default=date.today)
    result = Column(String, nullable=True)
    competencies = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="experiences")
