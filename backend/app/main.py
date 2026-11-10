"""
NEUROARM: EEG-Powered Intelligent Robotic Arm Platform Backend Application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Import API routers
from app.api.auth import router as auth_router
from app.api.eeg import router as eeg_router
from app.api.signals import router as signals_router
from app.api.intent import router as intent_router
from app.api.robot import router as robot_router
from app.api.hardware import router as hardware_router
from app.api.sessions import router as sessions_router
from app.api.ml_lab import router as ml_lab_router
from app.api.safety import router as safety_router
from app.api.command_mapping import router as mappings_router
from app.api.analytics import router as analytics_router
from app.api.websocket import router as ws_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Research-Oriented Platform for EEG-Based Intent Recognition & 6-DOF Robotic Arm Control",
    version="1.0.0"
)

# Enable CORS for frontend Vite development server & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(eeg_router, prefix=settings.API_V1_PREFIX)
app.include_router(signals_router, prefix=settings.API_V1_PREFIX)
app.include_router(intent_router, prefix=settings.API_V1_PREFIX)
app.include_router(robot_router, prefix=settings.API_V1_PREFIX)
app.include_router(hardware_router, prefix=settings.API_V1_PREFIX)
app.include_router(sessions_router, prefix=settings.API_V1_PREFIX)
app.include_router(ml_lab_router, prefix=settings.API_V1_PREFIX)
app.include_router(safety_router, prefix=settings.API_V1_PREFIX)
app.include_router(mappings_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)

# Mount WebSockets router
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "OPERATIONAL",
        "description": "EEG-Based Intent Recognition & Robotic Arm Control Platform",
        "mode": "DEMO_SIMULATION_READY",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "subsystems": {
            "eeg_pipeline": "OK",
            "dsp_filters": "OK",
            "ml_classifier": "OK",
            "kinematics": "OK",
            "safety_guard": "OK",
            "hardware_bridge": "OK"
        }
    }
