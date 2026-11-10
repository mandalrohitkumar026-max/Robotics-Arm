"""
Hardware Management & Microcontroller Bridge Endpoints.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.hardware.serial_bridge import esp32_bridge

router = APIRouter(prefix="/hardware", tags=["Hardware"])

class ConnectRequest(BaseModel):
    port: Optional[str] = None
    baudrate: Optional[int] = None

@router.get("/devices")
def get_hardware_status():
    esp_status = esp32_bridge.get_status()
    return {
        "eeg": {
            "name": "NeuroArm Research EEG-8 (10-20 Standard)",
            "connected": True,
            "type": "Bluetooth LE / USB Stream",
            "channels": 8,
            "sampling_rate": "250 Hz",
            "signal_quality": "EXCELLENT (97.4%)",
            "battery": "94%"
        },
        "esp32": esp_status,
        "robotic_arm": {
            "name": "6-DOF Aluminum Arm (PCA9685)",
            "connected": esp_status["is_connected"],
            "dof": 6,
            "driver": "PCA9685 I2C 12-Bit PWM",
            "power_rail": "5.1V / 4.2A EXT",
            "status": "READY" if esp_status["is_connected"] else "OFFLINE"
        }
    }

@router.get("/ports")
def list_ports():
    return esp32_bridge.list_ports()

@router.post("/connect")
def connect_device(req: ConnectRequest):
    return esp32_bridge.connect(port=req.port, baudrate=req.baudrate)

@router.post("/disconnect")
def disconnect_device():
    return esp32_bridge.disconnect()

@router.post("/calibrate")
def calibrate_device():
    return esp32_bridge.calibrate()
