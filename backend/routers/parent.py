from fastapi import APIRouter, Depends, HTTPException
from models import User, Role, Class, Assignment, Grade
from typing import List

router = APIRouter(prefix="/parent", tags=["Parent"])

@router.get("/children", response_model=List[User])
async def list_children(parent_id: str): # Get from token
    parent = User.get(parent_id)
    if not parent or not parent.children_ids:
        return []
    
    children = []
    # Handle comma separated string
    if parent.children_ids:
        child_ids = parent.children_ids.split(",")
        for child_id in child_ids:
            try:
                children.append(User.get(child_id.strip()))
            except:
                pass
    return children

@router.get("/children/{child_id}/grades", response_model=List[Grade])
async def view_child_grades(parent_id: str, child_id: str):
    # Verify parent owns child
    parent = User.get(parent_id)
    children_ids = parent.children_ids.split(",") if parent.children_ids else []
    if child_id not in children_ids:
        raise HTTPException(status_code=403, detail="Not authorized to view this child")
    
    return Grade.find(Grade.student_id == child_id).all()
