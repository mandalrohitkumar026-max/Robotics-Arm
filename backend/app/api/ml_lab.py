"""
Machine Learning Lab Endpoints:
Model Training, Performance Evaluation, Confusion Matrix generation, and Feature Importance telemetry.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.ml.classifier import intent_classifier
from app.ml.features import get_feature_names

router = APIRouter(prefix="/models", tags=["ML Lab"])

class TrainModelRequest(BaseModel):
    model_type: str = "Random Forest"
    samples_per_class: Optional[int] = 50

@router.get("/")
def get_available_models():
    return {
        "active_model": intent_classifier.model_type,
        "available_architectures": ["Random Forest", "SVM", "1D CNN", "CNN-LSTM"],
        "classes": intent_classifier.classes,
        "is_trained": intent_classifier.is_trained
    }

@router.post("/train")
def train_model(req: TrainModelRequest):
    results = intent_classifier.train_and_evaluate(
        model_type=req.model_type,
        samples_per_class=req.samples_per_class or 50
    )
    return results

@router.get("/metrics")
def get_metrics():
    if not intent_classifier.last_metrics:
        intent_classifier.train_and_evaluate(model_type=intent_classifier.model_type, samples_per_class=45)
    return intent_classifier.last_metrics

@router.get("/features")
def get_feature_importances():
    metrics = get_metrics()
    return {
        "top_features": metrics.get("top_features", []),
        "total_features_count": len(get_feature_names()),
        "feature_names": get_feature_names()
    }

@router.get("/dataset-summary")
def get_dataset_summary():
    metrics = get_metrics()
    return {
        "total_samples": metrics.get("sample_count", 360),
        "train_samples": metrics.get("train_samples", 288),
        "test_samples": metrics.get("test_samples", 72),
        "class_distribution": metrics.get("class_distribution", {}),
        "epoch_duration_sec": 1.5,
        "sampling_rate_hz": 250
    }
