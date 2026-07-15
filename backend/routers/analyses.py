from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any
from datetime import datetime
from database import get_db
from models import User, SavedAnalysis
from auth_utils import get_current_user
from cloud_storage import get_resume_signed_url, delete_resume

router = APIRouter(prefix="/analyses", tags=["Saved Analyses"])


class SaveAnalysisInput(BaseModel):
    job_title: str | None = None
    company_name: str | None = None
    role_name: str | None = None
    location: str | None = None
    ats_score: int
    jd_text: str | None = None
    resume_file_id: str | None = None
    full_result: dict[str, Any]


class SavedAnalysisOut(BaseModel):
    id: int
    job_title: str | None
    company_name: str | None
    role_name: str | None
    location: str | None
    ats_score: int
    jd_text: str | None
    resume_file_id: str | None
    full_result: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/save")
def save_analysis(
    body: SaveAnalysisInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_record = SavedAnalysis(
        user_id=current_user.id,
        job_title=body.job_title,
        company_name=body.company_name,
        role_name=body.role_name,
        location=body.location,
        ats_score=body.ats_score,
        jd_text=body.jd_text,
        resume_file_id=body.resume_file_id,
        full_result=body.full_result
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {"status": "saved", "id": new_record.id}


@router.get("/mine", response_model=list[SavedAnalysisOut])
def get_my_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = (
        db.query(SavedAnalysis)
        .filter(SavedAnalysis.user_id == current_user.id)
        .order_by(SavedAnalysis.created_at.desc())
        .all()
    )
    return records


@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = (
        db.query(SavedAnalysis)
        .filter(
            SavedAnalysis.id == analysis_id,
            SavedAnalysis.user_id == current_user.id
        )
        .first()
    )
    if record is None:
        raise HTTPException(404, "Analysis not found")

    if record.resume_file_id:
        try:
            delete_resume(record.resume_file_id)
        except Exception:
            # If Cloudinary deletion fails for any reason, don't block
            # deleting the database record — an orphaned file in storage
            # is a minor cleanup issue, not a user-facing one.
            pass

    db.delete(record)
    db.commit()

    return {"status": "deleted", "id": analysis_id}


@router.get("/{analysis_id}/resume")
def get_resume_url(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = (
        db.query(SavedAnalysis)
        .filter(
            SavedAnalysis.id == analysis_id,
            SavedAnalysis.user_id == current_user.id
        )
        .first()
    )
    if record is None or not record.resume_file_id:
        raise HTTPException(404, "Resume not found for this analysis")

    signed_url = get_resume_signed_url(record.resume_file_id)
    return {"url": signed_url}