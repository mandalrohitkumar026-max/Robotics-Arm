"""
EEG Control, Waveform Ingestion, and Artifact Trigger Endpoints.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.eeg.simulator import simulator
from app.eeg.blink import blink_detector
from app.config import settings

router = APIRouter(prefix="/eeg", tags=["EEG"])

class TriggerIntentRequest(BaseModel):
    intent: str
    duration: Optional[float] = 2.5

class BlinkConfigRequest(BaseModel):
    threshold_uv: Optional[float] = None
    min_duration_ms: Optional[float] = None
    max_duration_ms: Optional[float] = None
    cooldown_ms: Optional[float] = None

@router.get("/channels")
def get_channels():
    return {
        "channels": settings.EEG_CHANNELS,
        "sampling_rate_hz": settings.SAMPLING_RATE_HZ,
        "notch_freq_hz": settings.NOTCH_FREQ_HZ,
        "bandpass": [settings.BANDPASS_LOW_HZ, settings.BANDPASS_HIGH_HZ]
    }

@router.post("/trigger-intent")
def trigger_intent(req: TriggerIntentRequest):
    simulator.trigger_intent(req.intent, req.duration)
    return {"status": "SUCCESS", "active_intent": req.intent, "duration": req.duration}

@router.post("/trigger-blink")
def trigger_blink():
    simulator.trigger_blink()
    return {"status": "SUCCESS", "message": "Ocular blink artifact injected."}

@router.get("/blink-status")
def get_blink_status():
    return {
        "total_blinks": blink_detector.total_blinks,
        "blink_rate_bpm": blink_detector.blink_rate_bpm,
        "last_blink_timestamp": blink_detector.last_blink_time,
        "last_blink_duration_ms": blink_detector.last_blink_duration_ms,
        "threshold_uv": blink_detector.threshold_uv,
        "cooldown_ms": blink_detector.cooldown_ms
    }

@router.post("/blink-config")
def update_blink_config(req: BlinkConfigRequest):
    blink_detector.update_settings(
        threshold=req.threshold_uv,
        min_dur=req.min_duration_ms,
        max_dur=req.max_duration_ms,
        cooldown=req.cooldown_ms
    )
    return {"status": "SUCCESS", "config": get_blink_status()}

class FilterConfigRequest(BaseModel):
    lowcut: Optional[float] = None
    highcut: Optional[float] = None
    notch_freq: Optional[float] = None

@router.get("/filter-config")
def get_filter_config():
    from app.eeg.filters import eeg_filter
    return {
        "lowcut": eeg_filter.lowcut,
        "highcut": eeg_filter.highcut,
        "notch_freq": eeg_filter.notch_freq,
        "sampling_rate_hz": eeg_filter.fs
    }

@router.post("/filter-config")
def update_filter_config(req: FilterConfigRequest):
    from app.eeg.filters import eeg_filter
    eeg_filter.update_settings(
        lowcut=req.lowcut,
        highcut=req.highcut,
        notch_freq=req.notch_freq
    )
    return {"status": "SUCCESS", "config": get_filter_config()}
