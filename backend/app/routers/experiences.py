from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/experiences", tags=["experiences"])


@router.get("", response_model=list[schemas.ExperienceOut])
def list_experiences(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return (
        db.query(models.Experience)
        .filter(models.Experience.user_id == current_user.id)
        .order_by(models.Experience.date.desc())
        .all()
    )


@router.post("", response_model=schemas.ExperienceOut, status_code=201)
def create_experience(payload: schemas.ExperienceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    exp = models.Experience(**payload.model_dump(), user_id=current_user.id)
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.put("/{experience_id}", response_model=schemas.ExperienceOut)
def update_experience(experience_id: str, payload: schemas.ExperienceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    exp = db.query(models.Experience).filter(models.Experience.id == experience_id, models.Experience.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiência não encontrada.")
    for field, value in payload.model_dump().items():
        setattr(exp, field, value)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/{experience_id}", status_code=204)
def delete_experience(experience_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    exp = db.query(models.Experience).filter(models.Experience.id == experience_id, models.Experience.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiência não encontrada.")
    db.delete(exp)
    db.commit()
