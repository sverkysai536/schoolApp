from fastapi import APIRouter, Depends, HTTPException
from models import User, Role, Class
from auth import get_password_hash
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin"])

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Role
    first_name: str
    last_name: str
    phone: Optional[str] = None
    class_id: Optional[str] = None
    children_ids: Optional[str] = None

@router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    # Check if exists
    try:
        User.get(user.username)
        raise HTTPException(status_code=400, detail="Username already registered")
    except:
        pass # User does not exist, proceed
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        pk=user.username,
        username=user.username,
        email=user.email,
        params=hashed_password,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        class_id=user.class_id,
        children_ids=user.children_ids
    )
    new_user.save()
    new_user.save()
    return new_user

class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[Role] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    class_id: Optional[str] = None
    children_ids: Optional[str] = None

@router.put("/users/{username}")
async def update_user(username: str, user_update: UserUpdate):
    try:
        user = User.get(username)
    except:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.email: user.email = user_update.email
    if user_update.role: user.role = user_update.role
    if user_update.first_name: user.first_name = user_update.first_name
    if user_update.last_name: user.last_name = user_update.last_name
    if user_update.phone is not None: user.phone = user_update.phone
    if user_update.class_id is not None: user.class_id = user_update.class_id
    if user_update.children_ids is not None: user.children_ids = user_update.children_ids
    
    if user_update.password:
        user.params = get_password_hash(user_update.password)

    user.save()
    return {"message": "User updated successfully", "user": user}

@router.get("/users", response_model=List[User])
async def list_users(role: Optional[Role] = None):
    users = []
    for pk in User.all_pks():
        try:
            user = User.get(pk)
            if role:
                if user.role == role:
                    users.append(user)
            else:
                users.append(user)
        except:
            pass
    return users

class ClassCreate(BaseModel):
    name: str
    teacher_id: Optional[str]

@router.post("/classes", response_model=Class)
async def create_class(cls: ClassCreate):
    new_class = Class(name=cls.name, teacher_id=cls.teacher_id)
    new_class.save()
    return new_class

@router.get("/classes/{pk}", response_model=Class)
async def get_class(pk: str):
    try:
        return Class.get(pk)
    except:
        raise HTTPException(status_code=404, detail="Class not found")

@router.get("/classes", response_model=List[Class])
async def list_classes():
    classes = []
    for pk in Class.all_pks():
        try:
            classes.append(Class.get(pk))
        except:
            pass
    return classes
@router.delete("/classes/{pk}")
async def delete_class(pk: str):
    try:
        Class.delete(pk)
        return {"message": "Class deleted successfully"}
    except:
        raise HTTPException(status_code=404, detail="Class not found")

class ClassTeacherUpdate(BaseModel):
    teacher_id: str

@router.put("/classes/{pk}/class-teacher")
async def update_class_teacher(pk: str, update: ClassTeacherUpdate):
    try:
        cls = Class.get(pk)
        cls.teacher_id = update.teacher_id
        cls.save()
        return cls
    except:
        raise HTTPException(status_code=404, detail="Class not found")

class SubjectAdd(BaseModel):
    subject_name: str

@router.post("/classes/{pk}/subjects")
async def add_class_subject(pk: str, subject: SubjectAdd):
    try:
        cls = Class.get(pk)
        import json
        current_subjects = json.loads(cls.subjects) if cls.subjects else []
        if subject.subject_name not in current_subjects:
            current_subjects.append(subject.subject_name)
            cls.subjects = json.dumps(current_subjects)
            cls.save()
        return cls
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Class not found or error adding subject")

class SubjectTeacherUpdate(BaseModel):
    teacher_id: str

@router.put("/classes/{pk}/subjects/{subject_name}/teacher")
async def assign_subject_teacher(pk: str, subject_name: str, update: SubjectTeacherUpdate):
    try:
        cls = Class.get(pk)
        import json
        current_map = json.loads(cls.subject_teachers) if cls.subject_teachers else {}
        current_map[subject_name] = update.teacher_id
        cls.subject_teachers = json.dumps(current_map)
        cls.save()
        return cls
    except:
        raise HTTPException(status_code=404, detail="Class not found")

# Fee Management
from models import FeeStructure, StudentFee

class FeeStructureCreate(BaseModel):
    class_id: str
    amount: float
    academic_year: str
    due_date: str # ISO format

@router.get("/fee-structures", response_model=List[FeeStructure])
async def list_fee_structures():
    # Manual fetch
    fees = []
    for pk in FeeStructure.all_pks():
        try:
            fees.append(FeeStructure.get(pk))
        except:
            pass
    return fees

@router.post("/fee-structures", response_model=FeeStructure)
async def create_fee_structure(fs: FeeStructureCreate):
    # Check if exists for class/year? For now just overwrite or create new
    # ID can be class_id_year
    pk = f"{fs.class_id}_{fs.academic_year}"
    new_fs = FeeStructure(
        pk=pk,
        class_id=fs.class_id,
        amount=fs.amount,
        academic_year=fs.academic_year,
        due_date=datetime.datetime.fromisoformat(fs.due_date.replace("Z", "+00:00"))
    )
    new_fs.save()
    
    # Also, we should probably generate StudentFee records for all students in this class if they don't exist
    # Fetch all students in class
    all_users = User.all_pks()
    for user_pk in all_users:
        try:
            user = User.get(user_pk)
            if user.role == Role.STUDENT and user.class_id == fs.class_id:
                # Check if StudentFee exists
                sf_pk = f"{user.pk}_{fs.academic_year}"
                try:
                    StudentFee.get(sf_pk)
                except:
                    # Create
                    StudentFee(
                        pk=sf_pk,
                        student_id=user.pk,
                        class_id=fs.class_id,
                        base_amount=fs.amount,
                        final_amount=fs.amount, # Initial
                        due_date=new_fs.due_date
                    ).save()
        except:
            pass

    return new_fs

@router.get("/classes/{class_id}/fees", response_model=List[StudentFee])
async def list_class_student_fees(class_id: str):
    # Fetch all student fees for this class
    # Manual filter
    fees = []
    for pk in StudentFee.all_pks():
        try:
            sf = StudentFee.get(pk)
            if sf.class_id == class_id:
                fees.append(sf)
        except:
            pass
    return fees

class StudentFeeUpdate(BaseModel):
    pk: Optional[str] = None
    student_id: Optional[str] = None
    academic_year: str = "2025-2026"
    paid_amount: Optional[float] = None
    discount_amount: Optional[float] = None

@router.put("/student-fees")
async def update_student_fee(update: StudentFeeUpdate):
    if update.pk:
        pk = update.pk
    else:
        pk = f"{update.student_id}_{update.academic_year}"
        
    try:
        sf = StudentFee.get(pk)
        if update.paid_amount is not None:
            sf.paid_amount = update.paid_amount
        
        if update.discount_amount is not None:
            sf.discount_amount = update.discount_amount
            sf.final_amount = sf.base_amount - sf.discount_amount
        
        # Update status
        if sf.paid_amount >= sf.final_amount:
            sf.status = "paid"
        elif sf.paid_amount > 0:
            sf.status = "partial"
        else:
            sf.status = "pending"
            # overdue check?
            
        sf.save()
        return sf
    except:
        raise HTTPException(status_code=404, detail="Student fee record not found")
