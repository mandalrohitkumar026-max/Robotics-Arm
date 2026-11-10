"""
Authentication and User Management Endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.core.database import db
from app.core.security import verify_password, hash_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "researcher"

@router.post("/login")
def login(req: LoginRequest):
    user = db.find_one("users", {"username": req.username})
    if not user or not verify_password(req.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid username or credentials")
    
    token = create_access_token({"sub": user["id"], "username": user["username"], "role": user.get("role", "researcher")})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user.get("email"),
            "role": user.get("role", "researcher")
        }
    }

@router.post("/register")
def register(req: RegisterRequest):
    existing = db.find_one("users", {"username": req.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = {
        "username": req.username,
        "email": req.email,
        "role": req.role,
        "hashed_password": hash_password(req.password)
    }
    user = db.insert("users", new_user)
    token = create_access_token({"sub": user["id"], "username": user["username"], "role": user.get("role")})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user.get("email"),
            "role": user.get("role")
        }
    }

@router.get("/me")
def get_current_user():
    # Return lead researcher profile for default lab session
    researcher = db.find_one("users", {"username": "researcher"})
    if researcher:
        return {
            "id": researcher["id"],
            "username": researcher["username"],
            "email": researcher.get("email"),
            "role": researcher.get("role")
        }
    return {"id": "guest-01", "username": "researcher", "role": "lead_researcher"}
