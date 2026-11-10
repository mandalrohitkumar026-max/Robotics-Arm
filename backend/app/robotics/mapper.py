"""
Command Mapper: Translates EEG Intents and Events into Robot Actuation Commands.
"""
from typing import Dict, List, Any, Optional
from app.core.database import db

DEFAULT_MAPPINGS = [
    {"id": "m1", "trigger": "Single Blink", "command": "SELECT", "description": "Trigger waypoint selection", "enabled": True},
    {"id": "m2", "trigger": "Double Blink", "command": "GRIP", "description": "Toggle gripper clamp", "enabled": True},
    {"id": "m3", "trigger": "LEFT", "command": "ROTATE LEFT", "description": "Rotate base J1 counter-clockwise", "enabled": True},
    {"id": "m4", "trigger": "RIGHT", "command": "ROTATE RIGHT", "description": "Rotate base J1 clockwise", "enabled": True},
    {"id": "m5", "trigger": "FORWARD", "command": "MOVE FORWARD", "description": "Extend shoulder J2 and elbow J3 forward", "enabled": True},
    {"id": "m6", "trigger": "BACKWARD", "command": "MOVE BACKWARD", "description": "Retract shoulder J2 and elbow J3 backward", "enabled": True},
    {"id": "m7", "trigger": "GRIP", "command": "CLOSE GRIPPER", "description": "Clamp gripper fingers", "enabled": True},
    {"id": "m8", "trigger": "RELEASE", "command": "OPEN GRIPPER", "description": "Open gripper fingers", "enabled": True},
    {"id": "m9", "trigger": "STOP", "command": "EMERGENCY STOP", "description": "Halt all active motor joints immediately", "enabled": True}
]

class CommandMapper:
    def __init__(self):
        self._ensure_defaults()

    def _ensure_defaults(self):
        existing = db.find_all("mappings")
        if not existing:
            for m in DEFAULT_MAPPINGS:
                db.insert("mappings", m)

    def get_mappings(self) -> List[Dict[str, Any]]:
        return db.find_all("mappings")

    def update_mapping(self, mapping_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return db.update("mappings", mapping_id, updates)

    def add_mapping(self, trigger: str, command: str, description: str = "") -> Dict[str, Any]:
        item = {
            "trigger": trigger,
            "command": command,
            "description": description,
            "enabled": True
        }
        return db.insert("mappings", item)

    def delete_mapping(self, mapping_id: str) -> bool:
        return db.delete("mappings", mapping_id)

    def reset_defaults(self) -> List[Dict[str, Any]]:
        for m in db.find_all("mappings"):
            db.delete("mappings", m["id"])
        for m in DEFAULT_MAPPINGS:
            db.insert("mappings", m)
        return db.find_all("mappings")

    def map_event_to_action(self, trigger: str) -> Optional[str]:
        """Lookup active robot command for given EEG trigger."""
        mappings = self.get_mappings()
        for m in mappings:
            if m.get("enabled", True) and m.get("trigger", "").upper() == trigger.upper():
                return m.get("command")
        return None

command_mapper = CommandMapper()
