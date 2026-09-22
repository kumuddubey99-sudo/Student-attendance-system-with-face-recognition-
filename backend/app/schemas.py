from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# User & Auth Schemas
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(Admin|Teacher)$")

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Student Schemas
class StudentCreate(BaseModel):
    student_id: str = Field(..., min_length=1, max_length=50)
    roll_number: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    course: str = Field(..., min_length=1, max_length=100)
    year: str = Field(..., min_length=1, max_length=20)
    division: str = Field(..., min_length=1, max_length=20)

class StudentUpdate(BaseModel):
    student_id: Optional[str] = None
    roll_number: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    year: Optional[str] = None
    division: Optional[str] = None

class StudentResponse(BaseModel):
    id: int
    student_id: str
    roll_number: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    course: str
    year: str
    division: str
    face_status: str = "Not Registered"  # "Registered" or "Not Registered"
    created_at: datetime

    class Config:
        from_attributes = True

# Face Registration & Recognition Schemas
class FaceRegisterRequest(BaseModel):
    samples: List[str]  # List of base64-encoded image frames

class FaceIdentifyRequest(BaseModel):
    frame: str  # Base64-encoded camera frame
    threshold: Optional[float] = None  # Optional override, defaults to system threshold

# Attendance Schemas
class AttendanceMarkManual(BaseModel):
    student_id: int
    status: str = "Present"
    attendance_date: Optional[str] = None
    attendance_time: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    roll_number: str
    student_uid: str
    course: str
    year: str
    division: str
    attendance_date: str
    attendance_time: str
    status: str
    confidence: float
    created_at: datetime

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_students: int
    present_today: int
    absent_today: int
    attendance_percentage: float
    today_date: str
    current_time: str
    recent_attendance: List[AttendanceResponse]
