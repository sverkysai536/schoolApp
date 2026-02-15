import asyncio
import random
import datetime
from models import User, Role, Class, Assignment, Grade
from auth import get_password_hash
from redis_om import Migrator

# Setup dates
# User said "due date of 6th march". Assuming current year 2026 based on logs.
DUE_DATE_SOCIAL = datetime.datetime(2026, 3, 6, 12, 0, 0)
NOW = datetime.datetime.now()

async def create_data():
    print("Starting mock data creation...")
    
    # 1. Create Class 9A
    # Check if exists first to avoid duplicates or just overwrite? 
    # Redis OM PKs are unique. I'll use predictable PKs.
    
    # 2. Create Teachers
    # Class Teacher
    ct_pass = get_password_hash("password123")
    ct = User(
        pk="class_teacher_9a",
        username="class_teacher_9a",
        email="ct9a@vikas.school",
        params=ct_pass,
        role=Role.CLASS_TEACHER,
        first_name="Class",
        last_name="Teacher 9A",
        phone="1234567890"
    )
    ct.save()
    print("Created Class Teacher")

    # Subject Teachers
    t_math = User(
        pk="math_teacher",
        username="math_teacher",
        email="math@vikas.school",
        params=ct_pass,
        role=Role.TEACHER,
        first_name="Math",
        last_name="Teacher"
    )
    t_math.save()

    t_social = User(
        pk="social_teacher",
        username="social_teacher",
        email="social@vikas.school",
        params=ct_pass,
        role=Role.TEACHER,
        first_name="Social",
        last_name="Teacher"
    )
    t_social.save()
    print("Created Subject Teachers")

    # 3. Create Class
    # We need to set the teacher_id to the class teacher's PK
    cls = Class(
        pk="9A",
        name="9A",
        teacher_id="class_teacher_9a"
    )
    cls.save()
    print("Created Class 9A")

    # 4. Create 10 Students
    student_pks = []
    for i in range(1, 11):
        pk = f"student_9a_{i}"
        student_pks.append(pk)
        s = User(
            pk=pk,
            username=pk,
            email=f"student{i}@9a.school",
            params=ct_pass,
            role=Role.STUDENT,
            first_name="Student",
            last_name=f"{i}",
            class_id="9A"
        )
        s.save()
    print("Created 10 Students")

    # 5. Create Assignments
    # Social Assignment due 6th March
    assign_social = Assignment(
        title="History Chapter 4 Project",
        description="Complete the project on the French Revolution.",
        due_date=DUE_DATE_SOCIAL,
        class_id="9A",
        teacher_id="social_teacher"
    )
    assign_social.save()
    print("Created Social Assignment")

    # Monthly Test (Math)
    assign_math = Assignment(
        title="Math Monthly Test - Feb",
        description="Algebra and Geometry monthly assessment.",
        due_date=NOW, # Already due/done
        class_id="9A",
        teacher_id="math_teacher"
    )
    assign_math.save()
    print("Created Math Monthly Test")

    # 6. Create Grades for Math Test
    # "every student gets a different grade"
    # Let's generate random distinct scores if possible, or just random
    scores = random.sample(range(50, 100), 10) # 10 unique scores between 50 and 100
    
    for i, spk in enumerate(student_pks):
        g = Grade(
            student_id=spk,
            assignment_id=assign_math.pk,
            score=float(scores[i]),
            feedback="Good effort" if scores[i] > 70 else "Needs improvement",
            graded_by="math_teacher"
        )
        g.save()
    print("Created Grades for Math Test")

    print("Mock data creation complete!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(create_data())
