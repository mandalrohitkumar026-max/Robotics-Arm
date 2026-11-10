"""
Database storage layer with MongoDB support and local in-memory fallback.
"""
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

class StorageStore:
    def __init__(self, filepath: str = "neuroarm_local_db.json"):
        self.filepath = filepath
        self.data: Dict[str, Dict[str, Any]] = {
            "users": {},
            "sessions": {},
            "recordings": {},
            "models": {},
            "mappings": {},
            "logs": {}
        }
        self._load()
        self._seed_default_data()

    def _load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
            except Exception:
                pass

    def _save(self):
        try:
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, default=str)
        except Exception:
            pass

    def _seed_default_data(self):
        if not self.data["users"]:
            # Seed default researcher user (password: neuroarm2026)
            from app.core.security import hash_password
            user_id = str(uuid.uuid4())
            self.data["users"][user_id] = {
                "id": user_id,
                "username": "researcher",
                "email": "lab@neuroarm.ai",
                "role": "lead_researcher",
                "hashed_password": hash_password("neuroarm2026"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        
        # Seed default command mappings if empty
        if not self.data["mappings"]:
            default_mappings = [
                {"id": "m1", "trigger": "Single Blink", "command": "SELECT", "enabled": True},
                {"id": "m2", "trigger": "Double Blink", "command": "GRIP", "enabled": True},
                {"id": "m3", "trigger": "LEFT INTENT", "command": "ROTATE LEFT", "enabled": True},
                {"id": "m4", "trigger": "RIGHT INTENT", "command": "ROTATE RIGHT", "enabled": True},
                {"id": "m5", "trigger": "FORWARD INTENT", "command": "MOVE FORWARD", "enabled": True},
                {"id": "m6", "trigger": "BACKWARD INTENT", "command": "MOVE BACKWARD", "enabled": True},
                {"id": "m7", "trigger": "STOP INTENT", "command": "EMERGENCY STOP", "enabled": True}
            ]
            for m in default_mappings:
                self.data["mappings"][m["id"]] = m
        self._save()

    def insert(self, collection: str, item: Dict[str, Any]) -> Dict[str, Any]:
        if collection not in self.data:
            self.data[collection] = {}
        item_id = item.get("id") or str(uuid.uuid4())
        item["id"] = item_id
        if "created_at" not in item:
            item["created_at"] = datetime.now(timezone.utc).isoformat()
        self.data[collection][item_id] = item
        self._save()
        return item

    def get_by_id(self, collection: str, item_id: str) -> Optional[Dict[str, Any]]:
        return self.data.get(collection, {}).get(item_id)

    def find_one(self, collection: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for item in self.data.get(collection, {}).values():
            if all(item.get(k) == v for k, v in query.items()):
                return item
        return None

    def find_all(self, collection: str, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        items = list(self.data.get(collection, {}).values())
        if not query:
            return items
        return [i for i in items if all(i.get(k) == v for k, v in query.items())]

    def update(self, collection: str, item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        item = self.get_by_id(collection, item_id)
        if item:
            item.update(updates)
            item["updated_at"] = datetime.now(timezone.utc).isoformat()
            self._save()
            return item
        return None

    def delete(self, collection: str, item_id: str) -> bool:
        if collection in self.data and item_id in self.data[collection]:
            del self.data[collection][item_id]
            self._save()
            return True
        return False

db = StorageStore()
