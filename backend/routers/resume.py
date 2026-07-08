from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil, os, uuid
from pipelines.resume_parser import parse_resume

router = APIRouter(prefix="/resume", tags=["Resume"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")

    file_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_DIR}/{file_id}.pdf"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = parse_resume(file_path)

    os.remove(file_path)

    return {
        "status": "success",
        "file_name": file.filename,
        "data": result
    }