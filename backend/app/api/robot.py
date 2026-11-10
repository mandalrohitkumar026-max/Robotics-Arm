"""
Robotics Control, Joint State & Kinematics Endpoints.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional
from app.robotics.controller import robot_controller
from app.safety.safety_guard import safety_guard

router = APIRouter(prefix="/robot", tags=["Robotics"])

class ManualJointsRequest(BaseModel):
    joints: Dict[str, float]

class PoseRequest(BaseModel):
    pose: str

class IntentExecRequest(BaseModel):
    intent: str
    confidence: float

@router.get("/state")
def get_robot_state():
    return robot_controller.get_state()

@router.post("/joints")
def set_manual_joints(req: ManualJointsRequest):
    new_targets = robot_controller.set_manual_joints(req.joints)
    return {"status": "SUCCESS", "target_joints": new_targets}

@router.post("/pose")
def set_preset_pose(req: PoseRequest):
    success = robot_controller.set_preset_pose(req.pose.upper())
    if not success:
        return {"status": "ERROR", "message": f"Unknown pose '{req.pose}'. Options: HOME, REACH, PICK, REST"}
    return {"status": "SUCCESS", "pose": req.pose.upper()}

@router.post("/execute-intent")
def execute_intent(req: IntentExecRequest):
    result = robot_controller.execute_eeg_intent(req.intent, req.confidence)
    return result

@router.post("/emergency-stop")
def trigger_emergency_stop():
    safety_guard.trigger_emergency_stop("Manual software trigger")
    robot_controller.stop_movement()
    return {"status": "STOPPED", "message": "Emergency stop latched. All motors locked."}

@router.post("/reset-emergency-stop")
def reset_emergency_stop():
    safety_guard.reset_emergency_stop()
    return {"status": "RESUMED", "message": "Emergency stop disengaged. Motion unlocked."}
