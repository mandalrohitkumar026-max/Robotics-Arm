"""
6-DOF Robotic Arm Kinematics & Joint Definitions:
Joint limits, angle normalization, and preset poses.
"""
import math
from typing import Dict, Any

JOINT_LIMITS = {
    "J1": {"min": -170.0, "max": 170.0, "name": "Base Yaw", "home": 0.0},
    "J2": {"min": -60.0, "max": 120.0, "name": "Shoulder Pitch", "home": 30.0},
    "J3": {"min": -150.0, "max": 150.0, "name": "Elbow Pitch", "home": 60.0},
    "J4": {"min": -90.0, "max": 90.0, "name": "Wrist Pitch", "home": -20.0},
    "J5": {"min": -180.0, "max": 180.0, "name": "Wrist Roll", "home": 0.0},
    "J6": {"min": 0.0, "max": 100.0, "name": "Gripper", "home": 60.0}  # 0=closed, 100=open
}

PRESET_POSES = {
    "HOME": {"J1": 0.0, "J2": 30.0, "J3": 60.0, "J4": -20.0, "J5": 0.0, "J6": 50.0},
    "REACH": {"J1": 0.0, "J2": 65.0, "J3": 25.0, "J4": -10.0, "J5": 0.0, "J6": 80.0},
    "PICK": {"J1": 25.0, "J2": 75.0, "J3": 45.0, "J4": -30.0, "J5": 15.0, "J6": 10.0},
    "REST": {"J1": 0.0, "J2": 0.0, "J3": 110.0, "J4": -40.0, "J5": 0.0, "J6": 0.0}
}

class ArmKinematics:
    @staticmethod
    def clamp_joints(joints: Dict[str, float]) -> Dict[str, float]:
        """Enforce strict physical joint limits."""
        clamped = {}
        for j, val in joints.items():
            if j in JOINT_LIMITS:
                limits = JOINT_LIMITS[j]
                clamped[j] = round(max(limits["min"], min(limits["max"], float(val))), 1)
            else:
                clamped[j] = val
        return clamped

    @staticmethod
    def compute_forward_kinematics(joints: Dict[str, float]) -> Dict[str, float]:
        """Simple geometric FK approximation to compute end-effector (X, Y, Z) in mm."""
        # Arm segment lengths (mm)
        L1 = 120.0  # Base to Shoulder
        L2 = 140.0  # Upper arm
        L3 = 130.0  # Forearm
        L4 = 80.0   # End effector

        j1_rad = math.radians(joints.get("J1", 0.0))
        j2_rad = math.radians(joints.get("J2", 30.0))
        j3_rad = math.radians(joints.get("J3", 60.0))
        j4_rad = math.radians(joints.get("J4", -20.0))

        # 2D sagittal plane extension
        theta23 = j2_rad + j3_rad
        theta234 = theta23 + j4_rad

        r = L2 * math.cos(j2_rad) + L3 * math.cos(theta23) + L4 * math.cos(theta234)
        z = L1 + L2 * math.sin(j2_rad) + L3 * math.sin(theta23) + L4 * math.sin(theta234)

        x = r * math.cos(j1_rad)
        y = r * math.sin(j1_rad)

        return {
            "x": round(x, 1),
            "y": round(y, 1),
            "z": round(z, 1)
        }
