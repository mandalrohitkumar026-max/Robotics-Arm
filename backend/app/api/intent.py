"""
Intent Classification & Machine Learning Prediction Endpoints.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time
from app.eeg.simulator import simulator
from app.ml.features import extract_eeg_features
from app.ml.classifier import intent_classifier
from app.safety.safety_guard import safety_guard

router = APIRouter(prefix="/intent", tags=["Intent"])

# Keep rolling history of intent classifications
prediction_history: List[Dict[str, Any]] = [
    {"timestamp": time.time() - 40, "intent": "REST", "confidence": 94.2, "status": "NOMINAL"},
    {"timestamp": time.time() - 30, "intent": "LEFT", "confidence": 92.5, "status": "EXECUTED"},
    {"timestamp": time.time() - 20, "intent": "FORWARD", "confidence": 88.7, "status": "EXECUTED"},
    {"timestamp": time.time() - 10, "intent": "GRIP", "confidence": 91.3, "status": "EXECUTED"}
]

@router.get("/current")
def get_current_intent():
    chunk = simulator.generate_sample_chunk(n_samples=128)
    feat = extract_eeg_features(chunk["signals"])
    pred = intent_classifier.predict(feat)
    
    # Check safety threshold
    is_safe, msg = safety_guard.validate_intent(pred["intent"], pred["confidence"])
    
    result = {
        **pred,
        "is_safe": is_safe,
        "safety_message": msg,
        "threshold": safety_guard.confidence_threshold,
        "timestamp": time.time()
    }
    
    # Append to rolling history if not duplicate resting sample
    if pred["intent"] != "REST" or len(prediction_history) < 1:
        if not prediction_history or (prediction_history[-1]["intent"] != pred["intent"]):
            prediction_history.append({
                "timestamp": time.time(),
                "intent": pred["intent"],
                "confidence": pred["confidence"],
                "status": "EXECUTED" if is_safe else "REJECTED_LOW_CONFIDENCE"
            })
            if len(prediction_history) > 25:
                prediction_history.pop(0)
                
    return result

@router.get("/history")
def get_intent_history():
    return prediction_history[-20:]
