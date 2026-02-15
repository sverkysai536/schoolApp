from fastapi import APIRouter, Depends, HTTPException
from models import User, Role, Class, Assignment, Grade
from auth import get_password_hash
from typing import List, Optional
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/teacher", tags=["Teacher"])

class AssignmentCreate(BaseModel):
    title: str
    description: str
    due_date: datetime.datetime
    class_id: str

@router.post("/assignments", response_model=Assignment)
async def create_assignment(assignment: AssignmentCreate, teacher_id: str): # In real app, get teacher_id from token
    new_assignment = Assignment(
        title=assignment.title,
        description=assignment.description,
        due_date=assignment.due_date,
        class_id=assignment.class_id,
        teacher_id=teacher_id
    )
    new_assignment.save()
    return new_assignment

@router.get("/classes/{class_id}/students", response_model=List[User])
async def list_class_students(class_id: str):
    return User.find(User.class_id == class_id).all()

class GradeCreate(BaseModel):
    student_id: str
    assignment_id: str
    score: float
    feedback: Optional[str]

@router.post("/grades", response_model=Grade)
async def post_grade(grade: GradeCreate, teacher_id: str):
    new_grade = Grade(
        student_id=grade.student_id,
        assignment_id=grade.assignment_id,
        score=grade.score,
        feedback=grade.feedback,
        graded_by=teacher_id
    )
    new_grade.save()
    return new_grade
