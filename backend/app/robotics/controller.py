"""
Robot Controller:
Manages real-time joint states, processes validated commands, runs interpolation,
and coordinates with the safety controller and ESP32 bridge.
"""
import time
from typing import Dict, Any, Optional
from app.robotics.kinematics import JOINT_LIMITS, PRESET_POSES, ArmKinematics
from app.robotics.mapper import command_mapper
from app.safety.safety_guard import safety_guard

class RobotController:
    def __init__(self):
        # Current active joint angles (deg)
        self.current_joints = PRESET_POSES["HOME"].copy()
        self.target_joints = PRESET_POSES["HOME"].copy()
        self.last_update = time.time()
        self.active_command: str = "IDLE"
        self.is_moving: bool = False

    def get_state(self) -> Dict[str, Any]:
        """Return current kinematics, end-effector coordinates, and status."""
        ee = ArmKinematics.compute_forward_kinematics(self.current_joints)
        return {
            "joints": self.current_joints,
            "target_joints": self.target_joints,
            "end_effector": ee,
            "active_command": self.active_command,
            "is_moving": self.is_moving,
            "limits": JOINT_LIMITS,
            "timestamp": time.time()
        }

    def execute_eeg_intent(self, intent: str, confidence: float) -> Dict[str, Any]:
        """
        Full Pipeline:
        EEG Intent -> Confidence Check -> Safety Gate -> Command Mapping -> Trajectory
        """
        # Safety validation
        valid, reason = safety_guard.validate_intent(intent, confidence)
        if not valid:
            return {"success": False, "reason": reason, "intent": intent}

        if intent.upper() == "STOP":
            self.stop_movement()
            return {"success": True, "action": "STOPPED", "reason": "STOP intent executed."}

        # Command lookup
        mapped_action = command_mapper.map_event_to_action(intent)
        if not mapped_action:
            return {"success": False, "reason": f"No active mapping for {intent}"}

        self.apply_action(mapped_action)
        return {"success": True, "action": mapped_action, "intent": intent}

    def apply_action(self, action: str):
        """Translate action into target joint delta."""
        self.active_command = action
        
        # Step sizes for incremental moves
        step = 8.0

        if action == "ROTATE LEFT":
            self.target_joints["J1"] = self.current_joints["J1"] - step
        elif action == "ROTATE RIGHT":
            self.target_joints["J1"] = self.current_joints["J1"] + step
        elif action == "MOVE FORWARD":
            self.target_joints["J2"] = self.current_joints["J2"] + step * 0.8
            self.target_joints["J3"] = self.current_joints["J3"] - step * 0.5
        elif action == "MOVE BACKWARD":
            self.target_joints["J2"] = self.current_joints["J2"] - step * 0.8
            self.target_joints["J3"] = self.current_joints["J3"] + step * 0.5
        elif action in ["GRIP", "CLOSE GRIPPER"]:
            self.target_joints["J6"] = max(0.0, self.current_joints["J6"] - 25.0)
        elif action in ["RELEASE", "OPEN GRIPPER"]:
            self.target_joints["J6"] = min(100.0, self.current_joints["J6"] + 25.0)
        elif action in ["EMERGENCY STOP", "STOP"]:
            self.stop_movement()

        # Clamp target joints immediately
        self.target_joints = ArmKinematics.clamp_joints(self.target_joints)

    def set_preset_pose(self, pose_name: str) -> bool:
        if pose_name in PRESET_POSES:
            self.target_joints = PRESET_POSES[pose_name].copy()
            self.active_command = f"GOTO_{pose_name}"
            return True
        return False

    def set_manual_joints(self, joints: Dict[str, float]) -> Dict[str, float]:
        """Manual slider override from UI."""
        if safety_guard.emergency_stop_latched:
            return self.current_joints
        
        clamped = ArmKinematics.clamp_joints(joints)
        self.target_joints = clamped
        self.active_command = "MANUAL_CONTROL"
        return self.target_joints

    def stop_movement(self):
        """Instant zero velocity lock."""
        self.target_joints = self.current_joints.copy()
        self.active_command = "HALTED"
        self.is_moving = False

    def update_step(self, dt: float = 0.05):
        """Simulation tick: smoothly damp joints toward targets."""
        new_joints, allowed = safety_guard.validate_and_clamp_motion(
            self.current_joints, self.target_joints, dt=dt
        )
        
        # Check if joints changed
        diff = sum(abs(new_joints[j] - self.current_joints[j]) for j in new_joints)
        self.is_moving = diff > 0.1
        self.current_joints = new_joints
        if not self.is_moving and self.active_command != "HALTED":
            self.active_command = "IDLE"

robot_controller = RobotController()
