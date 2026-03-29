from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis_om.checks
# Monkeypatch to avoid crash on COMMAND INFO if standard Redis is used
def patched_check_for_command(conn, cmd):
    try:
        cmd_info = conn.execute_command("COMMAND", "INFO", cmd)
        if not cmd_info or cmd_info == [None]:
            return False
        return True
    except Exception:
        return False

redis_om.checks.check_for_command = patched_check_for_command

from routers import auth, admin, teacher, student, parent, class_teacher, messages, fees
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Vikas School App API", version="1.0.0")

# Mount uploads directory
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(teacher.router)
app.include_router(student.router)
app.include_router(parent.router)
app.include_router(class_teacher.router)
app.include_router(messages.router)
app.include_router(fees.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Vikas School App API", "status": "running"}

@app.get("/health")
async def health_check():
    # TODO: Check Redis connection here
    return {"status": "ok", "redis": "pending"}
