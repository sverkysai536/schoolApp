from redis_om import HashModel, Field
from typing import Optional, List
from enum import Enum
import datetime

class Role(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    CLASS_TEACHER = "class_teacher"
    STUDENT = "student"
    PARENT = "parent"

class Message(HashModel):
    sender_id: str = Field(index=True)
    recipient_id: str = Field(index=True)
    content: str
    read: int = Field(default=0, index=True) # 0=Unread, 1=Read
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)

class User(HashModel):
    username: str = Field(index=True)
    email: str = Field(index=True)
    params: str # Hashed password
    role: Role = Field(index=True)
    first_name: str
    last_name: str
    phone: Optional[str] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)

    # Relations (stored as IDs)
    class_id: Optional[str] = Field(default=None, index=True) # For students
    children_ids: Optional[str] = None # For parents (comma separated)

class Class(HashModel):
    name: str = Field(index=True) # e.g. "10th Grade A"
    teacher_id: Optional[str] = Field(default=None, index=True) # Class teacher
    subjects: Optional[str] = None # JSON list of strings e.g. '["Math", "Science"]'
    subject_teachers: Optional[str] = None # JSON dict e.g. '{"Math": "teacher_id_1"}'
    
class Assignment(HashModel):
    title: str = Field(index=True)
    description: str
    due_date: datetime.datetime
    class_id: str = Field(index=True)
    teacher_id: str = Field(index=True)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)

class Grade(HashModel):
    student_id: str = Field(index=True)
    assignment_id: str = Field(index=True)
    score: float
    feedback: Optional[str] = None
    graded_by: str # Teacher ID
    
class Notification(HashModel):
    title: str
    message: str
    sender_id: str = Field(index=True)
    recipient_role: Optional[Role] = Field(default=None, index=True) # e.g. "student" (all students)
    recipient_id: Optional[str] = Field(default=None, index=True) # Specific user
    class_id: Optional[str] = Field(default=None, index=True) # Specific class
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)

class FeeStructure(HashModel):
    class_id: str = Field(index=True)
    amount: float
    academic_year: str = Field(index=True) # e.g. "2025-2026"
    due_date: datetime.datetime
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)

class StudentFee(HashModel):
    student_id: str = Field(index=True)
    class_id: str = Field(index=True)
    base_amount: float # Copied from FeeStructure
    discount_amount: float = 0.0
    final_amount: float # base - discount
    paid_amount: float = 0.0
    status: str = Field(index=True, default="pending") # pending, partial, paid, overdue
    due_date: datetime.datetime
    last_updated: datetime.datetime = Field(default_factory=datetime.datetime.now)
