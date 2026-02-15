from fastapi import APIRouter, Depends, HTTPException
from models import User, Role, Class, Assignment, Grade
from typing import List

router = APIRouter(prefix="/student", tags=["Student"])

@router.get("/assignments", response_model=List[Assignment])
async def list_assignments(student_id: str): # Get from token
    # Find student's class
    student = User.get(student_id)
    if not student or not student.class_id:
        return []
    return Assignment.find(Assignment.class_id == student.class_id).all()

@router.get("/grades", response_model=List[Grade])
async def list_grades(student_id: str): # Get from token
    return Grade.find(Grade.student_id == student_id).all()
