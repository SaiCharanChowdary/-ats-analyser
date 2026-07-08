from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import resume as resume_router
from routers import jd as jd_router
from routers import analyse as analyse_router
from routers import auth as auth_router
from routers import analyses as analyses_router

from dotenv import load_dotenv
import os
import anthropic

load_dotenv()

client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

app = FastAPI(title="ATS Analyser API")

app.include_router(resume_router.router)
app.include_router(jd_router.router)
app.include_router(analyse_router.router)
app.include_router(auth_router.router)
app.include_router(analyses_router.router) 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ATS Analyser API is running"}
    
@app.get("/test-ai")
def test_ai():
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=128,
        messages=[
            {
                "role": "user",
                "content": "In one sentence, confirm you can analyse resumes."
            }
        ]
    )
    return {"message": message.content[0].text}