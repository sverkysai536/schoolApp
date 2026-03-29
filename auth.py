from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models import User
from auth import verify_password, create_access_token, get_password_hash, get_current_user
from redis_om import NotFoundError
from pydantic import BaseModel

router = APIRouter(tags=["Auth"])

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = User.get(form_data.username)
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user or not verify_password(form_data.password, user.params):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str

@router.put("/update-password")
async def update_password(password_update: PasswordUpdate, current_user: User = Depends(get_current_user)):
    if not verify_password(password_update.old_password, current_user.params):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    current_user.params = get_password_hash(password_update.new_password)
    current_user.save()
    return {"message": "Password updated successfully"}
