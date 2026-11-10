"""
Safety Center API Endpoints.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.safety.safety_guard import safety_guard

router = APIRouter(prefix="/safety", tags=["Safety"])

class SafetyConfigUpdate(BaseModel):
    confidence_threshold: Optional[float] = None
    max_velocity: Optional[float] = None
    timeout_ms: Optional[int] = None

@router.get("/status")
def get_safety_status():
    return safety_guard.get_status()

@router.post("/config")
def update_safety_config(req: SafetyConfigUpdate):
    safety_guard.update_parameters(
        confidence_threshold=req.confidence_threshold,
        max_velocity=req.max_velocity,
        timeout_ms=req.timeout_ms
    )
    return {"status": "SUCCESS", "current_safety": safety_guard.get_status()}

@router.post("/emergency-stop")
def trigger_e_stop():
    return safety_guard.trigger_emergency_stop("Safety Center Manual Button")

@router.post("/reset-emergency-stop")
def reset_e_stop():
    return safety_guard.reset_emergency_stop()
