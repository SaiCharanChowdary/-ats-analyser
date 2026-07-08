from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User
from auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterInput(BaseModel):
    email: EmailStr
    password: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(body: RegisterInput, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == body.email).first()
    if existing_user:
        raise HTTPException(400, "An account with this email already exists")

    new_user = User(
        email=body.email,
        password_hash=hash_password(body.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id, new_user.email)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login")
def login(body: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")

    token = create_access_token(user.id, user.email)
    return {"access_token": token, "token_type": "bearer"}