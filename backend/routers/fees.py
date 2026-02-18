from fastapi import APIRouter, HTTPException, Depends
from models import FeeStructure, StudentFee, User, Role
from typing import List, Optional
from pydantic import BaseModel
import datetime

router = APIRouter(
    prefix="/fees",
    tags=["fees"],
    responses={404: {"description": "Not found"}},
)

class FeeStructureCreate(BaseModel):
    class_id: str
    amount: float
    academic_year: str
    due_date: datetime.datetime

class DiscountUpdate(BaseModel):
    discount_amount: float

@router.get("/structure", response_model=List[FeeStructure])
async def get_fee_structures():
    structures = []
    for pk in FeeStructure.all_pks():
        try:
            structures.append(FeeStructure.get(pk))
        except:
            pass
    return structures

@router.post("/structure")
async def create_or_update_fee_structure(fee_data: FeeStructureCreate):
    # Check if structure already exists for this class and year
    existing_structure = None
    for pk in FeeStructure.all_pks():
        try:
            struct = FeeStructure.get(pk)
            if struct.class_id == fee_data.class_id and struct.academic_year == fee_data.academic_year:
                existing_structure = struct
                break
        except:
            pass

    if existing_structure:
        fee_structure = existing_structure
        fee_structure.amount = fee_data.amount
        fee_structure.due_date = fee_data.due_date
        fee_structure.save()
        
        # Propagate changes to all students in this class
        all_student_fee_pks = StudentFee.all_pks()
        for sf_pk in all_student_fee_pks:
            try:
                sf = StudentFee.get(sf_pk)
                if sf.class_id == fee_data.class_id:
                    sf.base_amount = fee_data.amount
                    sf.final_amount = max(0, fee_data.amount - sf.discount_amount)
                    sf.due_date = fee_data.due_date
                    sf.save()
            except:
                pass
            
    else:
        # Create new structure
        # Since we don't have auto-increment or unique constraints enforced by RediSearch, 
        # we can use class_id + academic_year as VK or just let redis-om generate one.
        # Here we let redis-om generate one.
        fee_structure = FeeStructure(**fee_data.dict())
        fee_structure.save()
        
        # Initialize fees for all students in this class
        all_user_pks = User.all_pks()
        for u_pk in all_user_pks:
            try:
                student = User.get(u_pk)
                if student.role == Role.STUDENT and student.class_id == fee_data.class_id:
                     # Check if fee already exists for this student?
                     # Simplified: Just create a new fee record. In real app we might check for duplicates.
                     student_fee = StudentFee(
                        student_id=student.pk,
                        class_id=fee_data.class_id,
                        base_amount=fee_data.amount,
                        discount_amount=0.0,
                        final_amount=fee_data.amount,
                        due_date=fee_data.due_date
                    )
                     student_fee.save()
            except:
                pass
            
    return fee_structure

@router.get("/class/{class_id}", response_model=List[StudentFee])
async def get_class_fees(class_id: str):
    class_fees = []
    for pk in StudentFee.all_pks():
        try:
            sf = StudentFee.get(pk)
            if sf.class_id == class_id:
                class_fees.append(sf)
        except:
            pass
    return class_fees

@router.put("/student/{student_id}/discount")
async def update_student_discount(student_id: str, discount_data: DiscountUpdate):
    target_fee = None
    for pk in StudentFee.all_pks():
        try:
            sf = StudentFee.get(pk)
            if sf.student_id == student_id:
                target_fee = sf
                break
        except:
            pass
            
    if not target_fee:
        raise HTTPException(status_code=404, detail="Fee record not found for student")
    
    student_fee = target_fee
    student_fee.discount_amount = discount_data.discount_amount
    student_fee.final_amount = max(0, student_fee.base_amount - discount_data.discount_amount)
    student_fee.last_updated = datetime.datetime.now()
    student_fee.save()
    
    return student_fee

@router.get("/student/{student_id}")
async def get_student_fee(student_id: str):
    student_fees = []
    for pk in StudentFee.all_pks():
        try:
            sf = StudentFee.get(pk)
            if sf.student_id == student_id:
               student_fees.append(sf)
        except:
            pass
            
    if not student_fees:
        return []
    return student_fees
