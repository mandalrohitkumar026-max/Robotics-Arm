"""
Analytics and Performance Metrics Endpoints.
"""
from fastapi import APIRouter
import time

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def get_analytics_summary():
    return {
        "command_frequency": [
            {"name": "LEFT", "count": 142, "color": "#00F0FF"},
            {"name": "RIGHT", "count": 128, "color": "#3B82F6"},
            {"name": "FORWARD", "count": 94, "color": "#10B981"},
            {"name": "BACKWARD", "count": 68, "color": "#8B5CF6"},
            {"name": "GRIP", "count": 115, "color": "#F59E0B"},
            {"name": "RELEASE", "count": 102, "color": "#EC4899"},
            {"name": "STOP", "count": 31, "color": "#EF4444"}
        ],
        "confidence_over_time": [
            {"time": "14:00", "confidence": 91.2, "quality": 98.0},
            {"time": "14:10", "confidence": 88.4, "quality": 96.5},
            {"time": "14:20", "confidence": 94.1, "quality": 97.8},
            {"time": "14:30", "confidence": 93.6, "quality": 95.9},
            {"time": "14:40", "confidence": 89.8, "quality": 94.2},
            {"time": "14:50", "confidence": 95.4, "quality": 98.4},
            {"time": "15:00", "confidence": 94.7, "quality": 97.9}
        ],
        "kpi": {
            "avg_latency_ms": 18.4,
            "mean_confidence": 93.2,
            "safety_interventions": 3,
            "total_commands_executed": 680,
            "session_time_hours": 4.2
        }
    }
