"""
Authentication endpoints for mock verifier users.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import date, timedelta
import models
import auth
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    dob: date


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: str
    email: str
    name: str


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Create a new mock user account.
    """
    # Check if user already exists
    existing_user = db.query(models.MockUser).filter_by(email=request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = models.MockUser(
        email=request.email,
        password_hash=auth.hash_password(request.password),
        name=request.name,
        dob=request.dob
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generate token
    token = auth.create_access_token(
        data={"sub": user.user_id, "email": user.email}
    )
    
    return AuthResponse(
        token=token,
        user_id=user.user_id,
        email=user.email,
        name=user.name
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password.
    """
    # Find user
    user = db.query(models.MockUser).filter_by(email=request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate token
    token = auth.create_access_token(
        data={"sub": user.user_id, "email": user.email}
    )
    
    return AuthResponse(
        token=token,
        user_id=user.user_id,
        email=user.email,
        name=user.name
    )


@router.get("/me")
async def get_current_user(
    user_id: str = Depends(auth.get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get current user information.
    """
    user = db.query(models.MockUser).filter_by(user_id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate age for display (without revealing DOB)
    age = (date.today() - user.dob).days // 365
    
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "age": age  # Computed, not raw DOB
    }
