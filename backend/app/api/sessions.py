"""
EEG Session Management & Recording Endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.ml.dataset import dataset_manager

router = APIRouter(prefix="/sessions", tags=["Sessions"])

class StartRecordingRequest(BaseModel):
    user_id: Optional[str] = "researcher"
    label: Optional[str] = "REST"
    channels: Optional[List[str]] = None

@router.get("/")
def list_sessions():
    return dataset_manager.get_all_sessions()

@router.post("/start")
def start_recording(req: StartRecordingRequest):
    return dataset_manager.start_recording(user_id=req.user_id, label=req.label, channels=req.channels)

@router.post("/stop")
def stop_recording():
    session = dataset_manager.stop_recording()
    if not session:
        raise HTTPException(status_code=400, detail="No active recording session to stop.")
    return session
