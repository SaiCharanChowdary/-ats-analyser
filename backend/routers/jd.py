from fastapi import APIRouter
from pydantic import BaseModel
from pipelines.jd_parser import parse_jd

router = APIRouter(prefix="/jd", tags=["Job Description"])

class JDInput(BaseModel):
    text: str

@router.post("/parse")
def parse_job_description(body: JDInput):
    if len(body.text.strip()) < 50:
        return {"error": "Job description too short"}
    result = parse_jd(body.text)
    return {"status": "success", "data": result}