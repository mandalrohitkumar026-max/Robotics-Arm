"""
NEUROARM Configuration & Environment Settings
"""
import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "NEUROARM"
    API_V1_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "neuroarm-super-secret-scientific-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # EEG Signal Processing Defaults
    EEG_CHANNELS: list[str] = ["Fp1", "Fp2", "C3", "C4", "P3", "P4", "O1", "O2"]
    SAMPLING_RATE_HZ: int = 250
    NOTCH_FREQ_HZ: float = 50.0  # 50 Hz powerline (configurable to 60Hz)
    BANDPASS_LOW_HZ: float = 0.5
    BANDPASS_HIGH_HZ: float = 45.0
    
    # Safety Limits
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.80  # 80% minimum confidence
    MAX_ANGULAR_VELOCITY_DEG_S: float = 45.0    # 45 deg/sec maximum slew
    COMMAND_TIMEOUT_MS: int = 600               # Auto-stop after 600ms without refresh
    
    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = "neuroarm_db"
    
    # Hardware Defaults
    ESP32_PORT: str = os.getenv("ESP32_PORT", "COM3")
    ESP32_BAUDRATE: int = 115200

settings = Settings()
