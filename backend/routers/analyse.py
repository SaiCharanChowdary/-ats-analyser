from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil, os, uuid
from pipelines.resume_parser import parse_resume
from pipelines.jd_parser import parse_jd
from pipelines.claude_analyser import analyse_resume_with_claude


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

    resume_data = parse_resume(file_path)
    jd_data = parse_jd(jd_text)

    claude_result = analyse_resume_with_claude(
        resume_text=resume_data["raw_text"],
        jd_text=jd_data["raw_text"]
    )

    # The resume PDF is intentionally kept on disk (not deleted) so it
    # can be viewed later from History if this analysis gets saved.
    # If it's never saved, the file just sits unused — acceptable at
    # this project's scale; a cleanup job would be the production fix.

    return {
        "status": "success",
        "analysis": claude_result,
        "resume_file_id": file_id
    }