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
    children_ids = [cid.strip() for cid in (parent.children_ids.split(",") if parent.children_ids else [])]
    if child_id not in children_ids:
        raise HTTPException(status_code=403, detail="Not authorized to view this child")
    
    # return Grade.find(Grade.student_id == child_id).all()
    grades = []
    all_pks = Grade.all_pks()
    for pk in all_pks:
        try:
            g = Grade.get(pk)
            if g.student_id == child_id:
                grades.append(g)
        except:
             pass
    return grades

@router.get("/children/{child_id}/fees")
async def view_child_fees(parent_id: str, child_id: str):
    # Verify parent
    parent = User.get(parent_id)
    children_ids = [cid.strip() for cid in (parent.children_ids.split(",") if parent.children_ids else [])]
    if child_id not in children_ids:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    from models import StudentFee
    fees = []
    for pk in StudentFee.all_pks():
        try:
            sf = StudentFee.get(pk)
            if sf.student_id == child_id:
                fees.append(sf)
        except:
            pass
    return fees

@router.get("/children/{child_id}/notifications")
async def view_child_notifications(parent_id: str, child_id: str):
    # Verify parent
    parent = User.get(parent_id)
    children_ids = [cid.strip() for cid in (parent.children_ids.split(",") if parent.children_ids else [])]
    if child_id not in children_ids:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        child = User.get(child_id)
        # child.class_id might be None, but we still want school-wide posts
            
        from models import Notification
        notifications = []
        for pk in Notification.all_pks():
            try:
                n = Notification.get(pk)
                # Show if matches class OR is school-wide OR is for child specifically
                is_class_match = child.class_id and n.class_id == child.class_id
                is_global = not n.class_id and not n.recipient_id
                is_specific = n.recipient_id == child_id
                
                if is_class_match or is_global or is_specific:
                    notifications.append(n)
            except:
                pass
        return sorted(notifications, key=lambda x: x.created_at, reverse=True)
    except:
        return []

@router.get("/children/{child_id}/assignments", response_model=List[Assignment])
async def view_child_assignments(parent_id: str, child_id: str):
    # Verify parent
    parent = User.get(parent_id)
    children_ids = [cid.strip() for cid in (parent.children_ids.split(",") if parent.children_ids else [])]
    if child_id not in children_ids:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    try:
        child = User.get(child_id)
        if not child.class_id:
            return []
            
        assignments = []
        # Manual filter
        for pk in Assignment.all_pks():
            try:
                a = Assignment.get(pk)
                if a.class_id == child.class_id:
                    assignments.append(a)
            except:
                pass
        return sorted(assignments, key=lambda x: x.due_date)
    except:
        return []
