from fastapi import APIRouter, Depends, HTTPException
from models import User, Role, Class, Assignment, Grade
from auth import get_password_hash, get_current_user
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
async def create_assignment(assignment: AssignmentCreate, current_user: User = Depends(get_current_user)):
    # Verify role
    if current_user.role != Role.TEACHER and current_user.role != Role.CLASS_TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can create assignments")

    new_assignment = Assignment(
        title=assignment.title,
        description=assignment.description,
        due_date=assignment.due_date,
        class_id=assignment.class_id,
        teacher_id=current_user.pk
    )
    new_assignment.save()
    return new_assignment

@router.get("/assignments", response_model=List[Assignment])
async def get_teacher_assignments(current_user: User = Depends(get_current_user)):
    # Return all assignments created by this teacher
    # Manual filter for RediSearch compatibility
    assignments = []
    all_pks = Assignment.all_pks()
    for pk in all_pks:
        try:
            a = Assignment.get(pk)
            if a.teacher_id == current_user.pk:
                assignments.append(a)
        except:
             pass
    return sorted(assignments, key=lambda x: x.created_at, reverse=True)

@router.get("/classes/{class_id}/students", response_model=List[User])
async def list_class_students(class_id: str):
    # return User.find(User.class_id == class_id).all()
    students = []
    all_pks = User.all_pks()
    for pk in all_pks:
        try:
            u = User.get(pk)
            if u.class_id == class_id:
                students.append(u)
        except:
             pass
    return students

class GradeCreate(BaseModel):
    student_id: str
    assignment_id: str
    score: float
    feedback: Optional[str] = None

@router.post("/grades", response_model=Grade)
async def post_grade(grade: GradeCreate, current_user: User = Depends(get_current_user)):
    # Check if grade already exists for this student and assignment
    # Manual check for RediSearch compatibility
    existing_grade = None
    all_pks = Grade.all_pks()
    for pk in all_pks:
        try:
            g = Grade.get(pk)
            if g.student_id == grade.student_id and g.assignment_id == grade.assignment_id:
                existing_grade = g
                break
        except:
            pass
            
    if existing_grade:
        existing_grade.score = grade.score
        existing_grade.feedback = grade.feedback
        existing_grade.graded_by = current_user.pk
        existing_grade.save()
        return existing_grade
    else:
        new_grade = Grade(
            student_id=grade.student_id,
            assignment_id=grade.assignment_id,
            score=grade.score,
            feedback=grade.feedback,
            graded_by=current_user.pk
        )
        new_grade.save()
        return new_grade

@router.get("/assignments/{assignment_id}/grades", response_model=List[Grade])
async def get_assignment_grades(assignment_id: str):
    grades = []
    all_pks = Grade.all_pks()
    for pk in all_pks:
        try:
            g = Grade.get(pk)
            if g.assignment_id == assignment_id:
                grades.append(g)
        except:
            pass
    return grades

class NotificationCreate(BaseModel):
    title: str
    message: str
    class_id: str

@router.post("/notifications", response_model=dict)
async def post_notification(notification: NotificationCreate, current_user: User = Depends(get_current_user)):
    # Verify teacher teaches this class (basic check)
    # In real app, we should check Relation or SubjectTeacher logic
    # For now, let's assume if they have the ID, they can post (or check if they are a teacher)
    if current_user.role != Role.TEACHER and current_user.role != Role.CLASS_TEACHER:
         raise HTTPException(status_code=403, detail="Only teachers can post notifications")

    from models import Notification
    new_notif = Notification(
        title=notification.title,
        message=notification.message,
        sender_id=current_user.pk,
        class_id=notification.class_id,
        recipient_role=None # To everyone in class
    )
    new_notif.save()
    return {"message": "Notification posted successfully"}

@router.get("/classes", response_model=List[Class])
async def get_teacher_classes(current_user: User = Depends(get_current_user)):
    # Return all classes where this teacher teaches a subject
    # Manual filter again
    import json
    taught_classes = []
    
    all_pks = Class.all_pks()
    for pk in all_pks:
        try:
            c = Class.get(pk)
            # Check if class teacher (redundant but good)
            if c.teacher_id == current_user.pk:
                 taught_classes.append(c)
                 continue
            
            # Check subject teachers
            if c.subject_teachers:
                try:
                    st_map = json.loads(c.subject_teachers)
                    if current_user.pk in st_map.values():
                        taught_classes.append(c)
                except:
                    pass
        except:
             pass
             
    # De-duplicate
    # (Not strictly needed if logic is mutually exclusive, but list is fine)
    return taught_classes

