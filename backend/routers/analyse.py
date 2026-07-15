from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil, os, uuid
from pipelines.resume_parser import parse_resume
from pipelines.jd_parser import parse_jd
from pipelines.claude_analyser import analyse_resume_with_claude
from cloud_storage import upload_resume


router = APIRouter(prefix="/analyse", tags=["Analyse"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def analyse(
    resume: UploadFile = File(...),
    jd_text: str = Form(...)
):
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF resumes accepted")

    file_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_DIR}/{file_id}.pdf"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    try:
        resume_data = parse_resume(file_path)
        jd_data = parse_jd(jd_text)

        claude_result = analyse_resume_with_claude(
            resume_text=resume_data["raw_text"],
            jd_text=jd_data["raw_text"]
        )

        # Upload to persistent cloud storage so the resume survives even
        # on hosts with an ephemeral filesystem (like Render's free tier).
        # This is a private/authenticated upload — not publicly viewable.
        cloud_public_id = upload_resume(file_path, file_id)
    finally:
        # The local copy was only ever needed for parsing + the upload
        # above — safe to remove it now regardless of what happened.
        if os.path.exists(file_path):
            os.remove(file_path)

    return {
        "status": "success",
        "analysis": claude_result,
        "resume_file_id": cloud_public_id
    }