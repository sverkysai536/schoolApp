from fastapi import APIRouter, Depends, HTTPException
from models import User, Role, Class, Assignment, Grade, Notification, Message
from auth import get_current_user
from typing import List, Optional
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/class-teacher", tags=["ClassTeacher"])

# Helper to verify role and getting teacher's managed class
# Helper to verify role and getting teacher's managed class
def verify_class_teacher(user: User):
    if user.role != Role.CLASS_TEACHER:
        raise HTTPException(status_code=403, detail="Not a class teacher")
    
    # Finding the class this teacher manages
    print(f"Verifying class teacher: {user.pk}")
    
    # Manual Search (Standard Redis compatibility)
    try:
        all_pks = Class.all_pks()
        for pk in all_pks:
            try:
                c = Class.get(pk)
                if c.teacher_id == user.pk:
                    print(f"Found class {c.name} via manual search")
                    return c
            except Exception as inner_e:
                # print(f"Error retrieving class {pk}: {inner_e}")
                continue
    except Exception as e:
         print(f"Manual search failed: {e}")

    print(f"No class found for teacher {user.pk} after all attempts.")
    raise HTTPException(status_code=404, detail="No class assigned to this teacher. Please contact admin.")

@router.get("/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_user)):
    managed_class = verify_class_teacher(current_user)
    
    # Stats
    # students = User.find(User.class_id == managed_class.pk).all()
    # Manual filter for students
    student_count = 0
    all_users_pks = User.all_pks()
    for pk in all_users_pks:
        try:
             u = User.get(pk)
             if u.class_id == managed_class.pk:
                 student_count += 1
        except:
             pass
    
    # Assignments for this class (posted by any teacher)
    # assignments = Assignment.find(Assignment.class_id == managed_class.pk).all()
    # Manual filter for assignments
    assignment_count = 0
    all_assign_pks = Assignment.all_pks()
    for pk in all_assign_pks:
        try:
            a = Assignment.get(pk)
            if a.class_id == managed_class.pk:
                assignment_count += 1
        except:
            pass
    
    return {
        "class_name": managed_class.name,
        "student_count": student_count,
        "assignment_count": assignment_count
    }

@router.get("/assignments", response_model=List[Assignment])
async def get_class_assignments(current_user: User = Depends(get_current_user)):
    managed_class = verify_class_teacher(current_user)
    # return Assignment.find(Assignment.class_id == managed_class.pk).all()
    assignments = []
    all_pks = Assignment.all_pks()
    for pk in all_pks:
        try:
            a = Assignment.get(pk)
            if a.class_id == managed_class.pk:
                assignments.append(a)
        except:
            pass
    return assignments

@router.get("/grades", response_model=List[Grade])
async def get_class_grades(current_user: User = Depends(get_current_user)):
    managed_class = verify_class_teacher(current_user)
    # Filter students
    student_ids = []
    all_users = User.all_pks()
    for pk in all_users:
        try:
            u = User.get(pk)
            if u.class_id == managed_class.pk:
                student_ids.append(u.pk)
        except:
            pass

    all_grades = []
    # Manual filter grades
    grade_pks = Grade.all_pks()
    for pk in grade_pks:
        try:
            g = Grade.get(pk)
            if g.student_id in student_ids:
                all_grades.append(g)
        except:
            pass
        
    return all_grades

class ForumPost(BaseModel):
    title: str
    message: str

@router.post("/forum")
async def post_to_forum(post: ForumPost, current_user: User = Depends(get_current_user)):
    # Verify just to be sure
    verify_class_teacher(current_user)
    
    # Posting to "school" scope as per requirement/plan
    new_notification = Notification(
        title=post.title,
        message=post.message,
        sender_id=current_user.pk,
        recipient_role=None, # Sent to everyone/school forum
        class_id=None # Global/School level
    )
    new_notification.save()
    return {"message": "Posted to forum successfully"}

@router.get("/forum", response_model=List[Notification])
async def get_forum_posts(current_user: User = Depends(get_current_user)):
    verify_class_teacher(current_user)
    
    # Just fetch all notifications. In a real app rely on a "type" field.
    # We will assume all Notifications with empty recipient_id are forum posts.
    forum_posts = []
    all_pks = Notification.all_pks()
    for pk in all_pks:
        try:
            n = Notification.get(pk)
            # Check for school forum posts (no recipient, no class - or purely global)
            # Based on post_to_forum: recipient_role=None, class_id=None
            if not n.recipient_id and not n.class_id:
                forum_posts.append(n)
        except:
            pass

    return sorted(forum_posts, key=lambda x: x.created_at, reverse=True)

class MessageCreate(BaseModel):
    recipient_id: str
    content: str

@router.post("/messages")
async def send_message(msg: MessageCreate, current_user: User = Depends(get_current_user)):
    verify_class_teacher(current_user)
    
    new_message = Message(
        sender_id=current_user.pk,
        recipient_id=msg.recipient_id,
        content=msg.content
    )
    new_message.save()
    return {"message": "Message sent"}

@router.get("/messages")
async def get_messages(current_user: User = Depends(get_current_user)):
    # Get messages where user is sender OR recipient
    messages = []
    all_pks = Message.all_pks()
    for pk in all_pks:
        try:
            m = Message.get(pk)
            if m.sender_id == current_user.pk or m.recipient_id == current_user.pk:
                messages.append(m)
        except:
            pass
    
    return sorted(messages, key=lambda x: x.created_at, reverse=True)
