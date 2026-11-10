"""
NEUROARM Machine Learning Configuration:
Constants, channel montage definitions, feature parameters, and class vocabulary.
"""
from typing import Dict, List, Tuple
from dataclasses import dataclass, field

# 8-Class Motor Imagery Intent Vocabulary
CLASSES: List[str] = [
    "REST",       # Baseline resting state (No robotic actuation)
    "LEFT",       # Contralateral C4 ERD desynchronization (Rotate Base Left)
    "RIGHT",      # Contralateral C3 ERD desynchronization (Rotate Base Right)
    "FORWARD",    # Frontocentral beta synchrony (Extend Manipulator Forward)
    "BACKWARD",   # Parietocentral theta modulation (Retract Arm Backward)
    "GRIP",       # Bilateral sensorimotor mu burst (Clamp End-Effector)
    "RELEASE",    # Sensorimotor post-movement beta rebound (Open Gripper)
    "STOP"        # Frontal cognitive abort trigger (Immediate Safety Halt)
]

# Standard 10-20 Electrode Montage (8 Channels)
CHANNELS: List[str] = ["Fp1", "Fp2", "C3", "C4", "P3", "P4", "O1", "O2"]

# Canonical Electrophysiological Frequency Bands
CANONICAL_BANDS: Dict[str, Tuple[float, float]] = {
    "Delta": (0.5, 4.0),
    "Theta": (4.0, 8.0),
    "Alpha": (8.0, 13.0),
    "Beta":  (13.0, 30.0),
    "Gamma": (30.0, 45.0)
}

@dataclass
class MLConfig:
    sampling_rate_hz: int = 250
    epoch_window_sec: float = 1.5
    epoch_samples: int = 375        # 1.5s * 250 Hz
    step_samples: int = 62          # 0.25s slide for streaming feature extraction
    confidence_threshold: float = 80.0
    random_state: int = 42
    n_splits_cv: int = 5
    models_dir: str = "models"
    recordings_dir: str = "../backend/recordings"
    
    # Class mapping dictionaries
    class_to_idx: Dict[str, int] = field(default_factory=lambda: {c: i for i, c in enumerate(CLASSES)})
    idx_to_class: Dict[int, str] = field(default_factory=lambda: {i: c for i, c in enumerate(CLASSES)})

default_config = MLConfig()
