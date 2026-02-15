from fastapi import APIRouter, Depends, HTTPException
from models import User, Role, Message, Class
from auth import get_current_user
from typing import List, Optional
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/messages", tags=["Messages"])

class MessageCreate(BaseModel):
    recipient_id: str
    content: str

@router.post("/", response_model=dict)
async def send_message(msg: MessageCreate, current_user: User = Depends(get_current_user)):
    # Validate recipient exists
    try:
        recipient = User.get(msg.recipient_id)
    except:
        raise HTTPException(status_code=404, detail="Recipient not found")

    new_message = Message(
        sender_id=current_user.pk,
        recipient_id=msg.recipient_id,
        content=msg.content
    )
    new_message.save()
    return {"message": "Message sent successfully"}

@router.get("/", response_model=List[Message])
async def get_messages(current_user: User = Depends(get_current_user)):
    """
    Get all messages sent to or received by the current user.
    """
    # Fetch sent and received separately due to Redis OM limitations on OR queries
    sent = Message.find(Message.sender_id == current_user.pk).all()
    received = Message.find(Message.recipient_id == current_user.pk).all()
    
    # Combine and sort by created_at descending
    all_messages = sent + received
    return sorted(all_messages, key=lambda x: x.created_at, reverse=True)

@router.get("/recipients", response_model=List[User])
async def get_available_recipients(current_user: User = Depends(get_current_user)):
    """
    Get appropriate recipients based on user role.
    - Class Teachers: Parents of students in their managed classes.
    - Parents: Teachers of their children.
    """
    recipients = []

    if current_user.role == Role.CLASS_TEACHER:
        # 1. Find the class managed by this teacher
        try:
            managed_classes = Class.find(Class.teacher_id == current_user.pk).all()
            if not managed_classes:
                # Fallback manual search if needed, but keeping it simple for now
                 all_pks = Class.all_pks()
                 for pk in all_pks:
                     c = Class.get(pk)
                     if c.teacher_id == current_user.pk:
                         managed_classes = [c]
                         break
            
            if managed_classes:
                # 2. Find students in this class
                class_pk = managed_classes[0].pk
                students = User.find(User.class_id == class_pk).all()
                student_pks = [s.pk for s in students]

                # 3. Find parents of these students
                # Parents have 'children_ids' string (comma separated)
                # This is inefficient in NoSQL but necessary without a relational join
                # Better: Parents should have a field or we iterate all parents.
                # Let's iterate all parents and check if their children are in our student list.
                all_parents = User.find(User.role == Role.PARENT).all()
                for parent in all_parents:
                    if parent.children_ids:
                        children = parent.children_ids.split(',')
                        # If any child is in the teacher's class
                        if any(child_id in student_pks for child_id in children):
                            recipients.append(parent)

        except Exception as e:
            print(f"Error fetching recipients for teacher: {e}")

    elif current_user.role == Role.PARENT:
        # 1. Get children
        if current_user.children_ids:
            children_ids = current_user.children_ids.split(',')
            for child_id in children_ids:
                try:
                    child = User.get(child_id)
                    if child.class_id:
                        # 2. Get class of child
                        student_class = Class.get(child.class_id)
                        # 3. Get teacher of that class
                        if student_class.teacher_id:
                            try:
                                teacher = User.get(student_class.teacher_id)
                                # Avoid duplicates
                                if teacher not in recipients:
                                    recipients.append(teacher)
                            except:
                                pass
                except:
                    pass
    
    # For now, if no logic matched or empty (e.g. Admin or unassigned), return empty or Maybe Admin?
    # Let's also allow messaging ADMIN for everyone
    try:
        admins = User.find(User.role == Role.ADMIN).all()
        for admin in admins:
             if admin not in recipients:
                 recipients.append(admin)
    except:
        pass

    return recipients
