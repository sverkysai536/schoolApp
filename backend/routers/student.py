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
    # return Assignment.find(Assignment.class_id == student.class_id).all()
    assignments = []
    all_pks = Assignment.all_pks()
    for pk in all_pks:
        try:
            a = Assignment.get(pk)
            if a.class_id == student.class_id:
                assignments.append(a)
        except:
             pass
    return assignments

@router.get("/grades", response_model=List[Grade])
async def list_grades(student_id: str): # Get from token
    # return Grade.find(Grade.student_id == student_id).all()
    grades = []
    all_pks = Grade.all_pks()
    for pk in all_pks:
        try:
            g = Grade.get(pk)
            if g.student_id == student_id:
                grades.append(g)
        except:
             pass
    return grades

@router.get("/notifications")
async def list_notifications(student_id: str):
    student = User.get(student_id)
    if not student:
        return []

    from models import Notification
    notifications = []
    all_pks = Notification.all_pks()
    for pk in all_pks:
        try:
            n = Notification.get(pk)
            # Show if:
            # 1. Matches student's class
            # 2. Is school-wide (no class_id and no specific recipient_id)
            # 3. Dedicated to student specifically (recipient_id matches)
            if n.class_id == student.class_id or (not n.class_id and not n.recipient_id) or n.recipient_id == student.pk:
                notifications.append(n)
        except:
             pass
    return sorted(notifications, key=lambda x: x.created_at, reverse=True)
