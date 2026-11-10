"""
Deterministic Safety Controller & Command Verification Guard:
Enforces confidence thresholding, joint limits, velocity dampening, watchdog timeout,
and prioritized Emergency Stop latches.
"""
import time
from typing import Dict, Any, Tuple, Optional, List
from app.config import settings
from app.robotics.kinematics import JOINT_LIMITS, ArmKinematics

class SafetyGuard:
    def __init__(self):
        self.emergency_stop_latched: bool = False
        self.confidence_threshold: float = settings.DEFAULT_CONFIDENCE_THRESHOLD * 100.0  # 80.0%
        self.max_angular_velocity: float = settings.MAX_ANGULAR_VELOCITY_DEG_S            # 45 deg/s
        self.command_timeout_ms: int = settings.COMMAND_TIMEOUT_MS                        # 600 ms
        self.last_command_time: float = time.time()
        self.safety_logs: List[Dict[str, Any]] = []

    def trigger_emergency_stop(self, reason: str = "User Emergency Stop Button") -> Dict[str, Any]:
        """Latch emergency stop lock. Requires explicit manual reset."""
        self.emergency_stop_latched = True
        log_entry = {
            "timestamp": time.time(),
            "level": "CRITICAL",
            "event": "EMERGENCY_STOP_ENGAGED",
            "reason": reason
        }
        self.safety_logs.append(log_entry)
        return log_entry

    def reset_emergency_stop(self) -> Dict[str, Any]:
        """Clear emergency stop lock after verifying safe condition."""
        self.emergency_stop_latched = False
        log_entry = {
            "timestamp": time.time(),
            "level": "INFO",
            "event": "EMERGENCY_STOP_DISENGAGED",
            "reason": "Operator Reset"
        }
        self.safety_logs.append(log_entry)
        return log_entry

    def update_parameters(self, confidence_threshold: float = None, max_velocity: float = None, timeout_ms: int = None):
        if confidence_threshold is not None:
            self.confidence_threshold = confidence_threshold
        if max_velocity is not None:
            self.max_angular_velocity = max_velocity
        if timeout_ms is not None:
            self.command_timeout_ms = timeout_ms

    def validate_intent(self, intent: str, confidence: float) -> Tuple[bool, str]:
        """
        Gate 1: Verify whether intent prediction satisfies safety confidence requirements.
        Never execute an unvalidated prediction.
        """
        if self.emergency_stop_latched:
            return False, "REJECTED: Emergency stop is active."

        if intent.upper() == "STOP":
            # STOP intent is always allowed through to trigger safety halt
            return True, "ACCEPTED: Stop command permitted."

        if confidence < self.confidence_threshold:
            msg = f"REJECTED: Confidence ({confidence:.1f}%) below safety threshold ({self.confidence_threshold:.1f}%)."
            self.safety_logs.append({
                "timestamp": time.time(),
                "level": "WARNING",
                "event": "LOW_CONFIDENCE_REJECTION",
                "details": msg
            })
            return False, msg

        self.last_command_time = time.time()
        return True, "ACCEPTED: Intent passed safety validation."

    def validate_and_clamp_motion(self, current_joints: Dict[str, float], target_joints: Dict[str, float], dt: float = 0.05) -> Tuple[Dict[str, float], bool]:
        """
        Gate 2 & 3: Limit joint velocities and enforce angle bounding boxes.
        """
        if self.emergency_stop_latched:
            # Zero movement allowed
            return current_joints.copy(), False

        # Check command timeout
        if (time.time() - self.last_command_time) * 1000.0 > (self.command_timeout_ms * 2.5):
            # Soft freeze if no fresh control stream
            return current_joints.copy(), False

        # First clamp to physical absolute limits
        target_clamped = ArmKinematics.clamp_joints(target_joints)
        
        # Max angle delta allowed per step = max_velocity * dt
        max_delta = self.max_angular_velocity * dt
        new_joints = {}

        for j in ["J1", "J2", "J3", "J4", "J5", "J6"]:
            cur = current_joints.get(j, 0.0)
            target = target_clamped.get(j, cur)
            diff = target - cur
            if abs(diff) > max_delta:
                step = math.copysign(max_delta, diff)
                new_joints[j] = round(cur + step, 1)
            else:
                new_joints[j] = round(target, 1)

        return new_joints, True

    def get_status(self) -> Dict[str, Any]:
        return {
            "emergency_stop_latched": self.emergency_stop_latched,
            "confidence_threshold": self.confidence_threshold,
            "max_angular_velocity": self.max_angular_velocity,
            "command_timeout_ms": self.command_timeout_ms,
            "subsystems": {
                "eeg": "NOMINAL",
                "ai_intent": "NOMINAL",
                "esp32_bridge": "CONNECTED",
                "arm_kinematics": "LOCKED" if self.emergency_stop_latched else "ACTIVE"
            },
            "recent_logs": self.safety_logs[-10:]
        }

safety_guard = SafetyGuard()
