from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SavedAnalysis(Base):
    __tablename__ = "saved_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    job_title = Column(String, nullable=True)        # AI-detected role title
    company_name = Column(String, nullable=True)      # user-entered at save time
    role_name = Column(String, nullable=True)         # user-entered at save time
    location = Column(String, nullable=True)          # user-entered at save time

    ats_score = Column(Integer, nullable=False)
    jd_text = Column(Text, nullable=True)              # full pasted job description
    resume_file_id = Column(String, nullable=True)     # points to uploads/{id}.pdf

    full_result = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())