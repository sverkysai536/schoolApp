from models import User, Role
from auth import get_password_hash
from redis_om import Migrator
import datetime

# Setup
Migrator().run()

def create_user_if_not_exists(username, role, **kwargs):
    try:
        user = User.get(username)
        print(f"User {username} already exists.")
    except Exception:
        print(f"Creating {role} user: {username}")
        user = User(
            pk=username,
            username=username,
            email=f"{username}@vikas.school",
            params=get_password_hash(f"{username}123"),
            role=role,
            created_at=datetime.datetime.now(),
            **kwargs
        )
        user.save()

# Create Teacher
create_user_if_not_exists(
    "teacher1", 
    Role.TEACHER, 
    first_name="Anita", 
    last_name="Sharma"
)

# Create Student
create_user_if_not_exists(
    "student1", 
    Role.STUDENT, 
    first_name="Rohan", 
    last_name="Gupta",
    class_id="class_10_a"
)

# Create Parent
create_user_if_not_exists(
    "parent1", 
    Role.PARENT, 
    first_name="Mr.", 
    last_name="Gupta",
    children_ids="student1"
)

print("Seeding complete.")
