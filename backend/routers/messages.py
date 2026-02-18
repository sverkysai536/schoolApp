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
    # sent = Message.find(Message.sender_id == current_user.pk).all()
    # received = Message.find(Message.recipient_id == current_user.pk).all()
    
    all_messages = []
    all_pks = Message.all_pks()
    for pk in all_pks:
        try:
            m = Message.get(pk)
            if m.sender_id == current_user.pk or m.recipient_id == current_user.pk:
                all_messages.append(m)
        except:
             pass

    # Combine and sort by created_at descending
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
            managed_classes = []
            # Manual search for class
            all_class_pks = Class.all_pks()
            for pk in all_class_pks:
                try:
                    c = Class.get(pk)
                    if c.teacher_id == current_user.pk:
                        managed_classes.append(c)
                        break 
                except:
                    pass
            
            if managed_classes:
                # 2. Find students in this class
                class_pk = managed_classes[0].pk
                # students = User.find(User.class_id == class_pk).all()
                student_pks = []
                all_user_pks = User.all_pks()
                for pk in all_user_pks:
                     try:
                         u = User.get(pk)
                         if u.class_id == class_pk:
                             student_pks.append(u.pk)
                     except:
                         pass

                # 3. Find parents of these students
                # Parents have 'children_ids' string (comma separated)
                # This is inefficient in NoSQL but necessary without a relational join
                # Better: Parents should have a field or we iterate all parents.
                # Let's iterate all parents and check if their children are in our student list.
                # all_parents = User.find(User.role == Role.PARENT).all()
                all_user_pks = User.all_pks()
                for pk in all_user_pks:
                    try:
                        parent = User.get(pk)
                        if parent.role == Role.PARENT and parent.children_ids:
                            children = parent.children_ids.split(',')
                            # If any child is in the teacher's class
                            if any(child_id in student_pks for child_id in children):
                                recipients.append(parent)
                    except:
                        pass

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
                                if teacher not in recipients and teacher.pk != current_user.pk:
                                    recipients.append(teacher)
                            except:
                                pass
                        
                        # 4. Get subject teachers
                        import json
                        if student_class.subject_teachers:
                            try:
                                subject_teachers = json.loads(student_class.subject_teachers)
                                for subject, teacher_id in subject_teachers.items():
                                     try:
                                         t = User.get(teacher_id)
                                         if t not in recipients and t.pk != current_user.pk:
                                             recipients.append(t)
                                     except:
                                         pass
                            except:
                                pass
                except:
                    pass

    elif current_user.role == Role.STUDENT:
        if current_user.class_id:
            try:
                student_class = Class.get(current_user.class_id)
                # 1. Class Teacher
                if student_class.teacher_id:
                     try:
                         t = User.get(student_class.teacher_id)
                         if t not in recipients and t.pk != current_user.pk:
                             recipients.append(t)
                     except:
                         pass
                
                # 2. Subject Teachers
                import json
                if student_class.subject_teachers:
                    try:
                        subject_teachers = json.loads(student_class.subject_teachers)
                        for subject, teacher_id in subject_teachers.items():
                                try:
                                    t = User.get(teacher_id)
                                    if t not in recipients and t.pk != current_user.pk:
                                            recipients.append(t)
                                except:
                                    pass
                    except:
                        pass
            except:
                pass

    elif current_user.role == Role.TEACHER:
        # Find all classes where I am a subject teacher
        # Manual iteration required due to Redis constraints
        import json
        all_classes_pks = Class.all_pks()
        for pk in all_classes_pks:
            try:
                c = Class.get(pk)
                is_teacher = False
                if c.subject_teachers:
                    try:
                        st_map = json.loads(c.subject_teachers)
                        if current_user.pk in st_map.values():
                            is_teacher = True
                    except:
                        pass
                
                if is_teacher:
                    # Add Students of this class
                    # Manual iteration of users
                    all_users_pks = User.all_pks()
                    for u_pk in all_users_pks:
                         try:
                             u = User.get(u_pk)
                             if u.role == Role.STUDENT and u.class_id == c.pk:
                                 if u not in recipients and u.pk != current_user.pk:
                                     recipients.append(u)
                             # Add Parents of these students
                             if u.role == Role.PARENT and u.children_ids:
                                 children = u.children_ids.split(',')
                                 # Check if any child is in this class (we know `u` is A parent, check children)
                                 # Optimized: We know the student `u` (above) is in the class. 
                                 # We need to find the parent OF `u`.
                                 # Since parent -> children link exists, we have to scan parents.
                                 pass
                         except:
                             pass
                    
                    # Parent scan for this class
                    all_parents_pks = User.all_pks() 
                    for p_pk in all_parents_pks:
                         try:
                             p = User.get(p_pk)
                             if p.role == Role.PARENT and p.children_ids:
                                 children = p.children_ids.split(',')
                                 # Check if any child is in class `c`
                                 # We need to fetch child to check class_id
                                 for child_id in children:
                                      try:
                                          child = User.get(child_id)
                                          if child.class_id == c.pk:
                                              if p not in recipients and p.pk != current_user.pk:
                                                  recipients.append(p)
                                              break # Found one child in class, good enough
                                      except:
                                          pass
                         except:
                             pass
            except:
                pass
    # Let's also allow messaging ADMIN for everyone
    try:
        # admins = User.find(User.role == Role.ADMIN).all()
        # Manual filter admins
        all_pks = User.all_pks()
        for pk in all_pks:
            try:
                u = User.get(pk)
                if u.role == Role.ADMIN:
                    if u not in recipients:
                        recipients.append(u)
            except:
                pass
    except:
        pass

    return recipients
