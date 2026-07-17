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

# Exact-match origins (local dev, plus anything explicitly set via env)
cors_origins_env = os.getenv("CORS_ORIGINS")
if cors_origins_env:
    allowed_origins = [origin.strip() for origin in cors_origins_env.split(",")]
else:
    allowed_origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Vercel gives every single deployment its own unique URL
    # (e.g. ats-analyser-sage.vercel.app, ats-analyser-bdu4xmjbm-ats23.vercel.app).
    # Rather than chasing a new exact URL after every deploy, this regex
    # trusts ANY deployment URL belonging to this specific project —
    # anchored so it can only match "...vercel.app" at the very end,
    # not some lookalike domain that merely contains that text.
    allow_origin_regex=r"^https://ats-analyser.*\.vercel\.app$",
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ATS Analyser API is running"}