import asyncio
from models import User, Role
from auth import get_password_hash
from redis_om import Migrator
from redis import Redis
import datetime

# Connect to Redis to clear if needed (optional)
# redis = Redis.from_url("redis://localhost:6379")

async def init_db():
    # Wait for Redis OM to be ready
    Migrator().run()

    # Check if admin exists
    try:
        admins = User.find(User.role == Role.ADMIN).all()
        if admins:
            print("Admin user already exists.")
            return
    except Exception as e:
        print(f"Error checking admin: {e}")

    # Create default admin
    admin = User(
        pk="admin",
        username="admin",
        email="admin@vikas.school",
        params=get_password_hash("admin123"),
        role=Role.ADMIN,
        first_name="Super",
        last_name="Admin",
        created_at=datetime.datetime.now()
    )
    admin.save()
    print("Default admin created: admin / admin123")

if __name__ == "__main__":
    import datetime
    asyncio.run(init_db())
