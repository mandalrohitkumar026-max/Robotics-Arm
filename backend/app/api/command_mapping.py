"""
Command Mapping Endpoints.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.robotics.mapper import command_mapper

router = APIRouter(prefix="/mappings", tags=["Command Mapping"])

class NewMappingRequest(BaseModel):
    trigger: str
    command: str
    description: Optional[str] = ""

class UpdateMappingRequest(BaseModel):
    trigger: Optional[str] = None
    command: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None

@router.get("/")
def get_mappings():
    return command_mapper.get_mappings()

@router.post("/")
def create_mapping(req: NewMappingRequest):
    return command_mapper.add_mapping(req.trigger, req.command, req.description or "")

@router.put("/{mapping_id}")
def update_mapping(mapping_id: str, req: UpdateMappingRequest):
    data = {k: v for k, v in req.model_dump().items() if v is not None}
    return command_mapper.update_mapping(mapping_id, data)

@router.delete("/{mapping_id}")
def delete_mapping(mapping_id: str):
    success = command_mapper.delete_mapping(mapping_id)
    return {"status": "SUCCESS" if success else "NOT_FOUND"}

@router.post("/reset-defaults")
def reset_default_mappings():
    return command_mapper.reset_defaults()
