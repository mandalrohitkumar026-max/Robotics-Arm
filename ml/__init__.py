"""
NEUROARM Machine Learning Package:
Brain-Computer Interface Motor Imagery Classification Pipeline.
"""

from .config import MLConfig, CLASSES, CANONICAL_BANDS
from .features import extract_features, get_feature_names
from .inference import BCIInferenceEngine

__version__ = "1.0.0"
__all__ = ["MLConfig", "CLASSES", "CANONICAL_BANDS", "extract_features", "get_feature_names", "BCIInferenceEngine"]
