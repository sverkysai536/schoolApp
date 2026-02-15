from fastapi import APIRouter, Depends, HTTPException
from models import User, Role, Class, Assignment, Grade, Notification, Message
from auth import get_current_user
from typing import List, Optional
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/class-teacher", tags=["ClassTeacher"])

# Helper to verify role and getting teacher's managed class
def verify_class_teacher(user: User):
    if user.role != Role.CLASS_TEACHER:
        raise HTTPException(status_code=403, detail="Not a class teacher")
    # Finding the class this teacher manages
    # In a real app, Class model has teacher_id, so we query Class where teacher_id == user.pk
    # Finding the class this teacher manages
    print(f"Verifying class teacher: {user.pk}")
    
    # Method 1: Redis OM Find
    try:
        # Note: In Redis OM, we search by the field name. 
        # Make sure `teacher_id` is indexed in Class model!
        # If it's not indexed, `.find()` won't work on it.
        # Assuming it is indexed.
        managed_classes = Class.find(Class.teacher_id == user.pk).all()
        if managed_classes:
            print(f"Found class {managed_classes[0].name} via Redis OM find.")
            return managed_classes[0]
        else:
            print(f"Redis OM find returned nothing for teacher {user.pk}")
            
    except Exception as e:
        print(f"Redis OM find failed: {e}")

    # Method 2: Manual Fallback (Iterate all classes)
    print("Falling back to manual search...")
    try:
        all_pks = Class.all_pks()
        print(f"Checking {len(list(all_pks))} classes manually...")
        for pk in all_pks:
            try:
                c = Class.get(pk)
                # Debug print
                # print(f"Checking class {c.pk}: teacher={c.teacher_id} vs user={user.pk}")
                if c.teacher_id == user.pk:
                    print(f"Found class {c.name} via manual search")
                    return c
            except Exception as inner_e:
                print(f"Error retrieving class {pk}: {inner_e}")
                continue
    except Exception as e:
         print(f"Manual search failed: {e}")

    print(f"No class found for teacher {user.pk} after all attempts.")
    raise HTTPException(status_code=404, detail="No class assigned to this teacher. Please contact admin.")

@router.get("/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_user)):
    managed_class = verify_class_teacher(current_user)
    
    # Stats
    students = User.find(User.class_id == managed_class.pk).all()
    student_count = len(students)
    
    # Assignments for this class (posted by any teacher)
    assignments = Assignment.find(Assignment.class_id == managed_class.pk).all()
    assignment_count = len(assignments)
    
    return {
        "class_name": managed_class.name,
        "student_count": student_count,
        "assignment_count": assignment_count
    }

@router.get("/assignments", response_model=List[Assignment])
async def get_class_assignments(current_user: User = Depends(get_current_user)):
    managed_class = verify_class_teacher(current_user)
    return Assignment.find(Assignment.class_id == managed_class.pk).all()

@router.get("/grades", response_model=List[Grade])
async def get_class_grades(current_user: User = Depends(get_current_user)):
    # This is complex in NoSQL without joins. 
    # Ideally we'd filter grades by student_ids belonging to this class.
    # For now, let's just get all grades (inefficient) and filter in python 
    # OR better: find students of this class, then find grades for those students.
    managed_class = verify_class_teacher(current_user)
    students = User.find(User.class_id == managed_class.pk).all()
    student_ids = [s.pk for s in students]
    
    # Redis-OM might support "in" query, but safe fallback:
    all_grades = []
    # This loop is bad for perf, but okay for prototype
    for sid in student_ids:
        grades = Grade.find(Grade.student_id == sid).all()
        all_grades.extend(grades)
        
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
    # Fetch all school-level notifications (recipient_role=None, class_id=None)
    # Redis OM doesn't support complex filtering easily, so we might need to fetch all and filter in python if needed
    # But filtering by sender_id is not what we want. We want all posts.
    # Actually, the requirement was "public posts" / "school forum".
    # Let's find notifications where recipient_role is None (global) OR specific logic.
    # For now, let's just return all notifications that look like forum posts.
    # In a real app, we'd have a specific type or index.
    # Let's try to find all notifications and filter for those with no recipient_id/class_id?
    # Or just fetch all Notifications for now.
    
    # Better approach given Redis OM limitations:
    # Just fetch all notifications. In a real app rely on a "type" field.
    # We will assume all Notifications with empty recipient_id are forum posts.
    all_notifs = Notification.find().all()
    forum_posts = [n for n in all_notifs if not n.recipient_id and not n.class_id]
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
    # Redis-OM limitation: "OR" queries might be tricky. 
    # We'll fetch separately and merge.
    sent = Message.find(Message.sender_id == current_user.pk).all()
    received = Message.find(Message.recipient_id == current_user.pk).all()
    
    return sorted(sent + received, key=lambda x: x.created_at, reverse=True)
