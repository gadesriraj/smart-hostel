from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Auth schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "student"

class StudentRegisterRequest(BaseModel):
    fullName: str
    studentId: str
    email: EmailStr
    phone: str
    department: str
    yearOfStudy: int
    gender: str
    emergencyContact: Optional[str] = None
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Any

# Room Schemas
class RoomCreate(BaseModel):
    hostel_id: str
    block: str
    floor: int
    room_number: str
    room_type: str = "Double"
    capacity: int = 2
    facilities: List[str] = []
    monthly_fee: int = 4500
    status: str = "available"

class RoomUpdate(BaseModel):
    capacity: Optional[int] = None
    facilities: Optional[List[str]] = None
    monthly_fee: Optional[int] = None
    status: Optional[str] = None

# Allocation Schemas
class AllocationCreate(BaseModel):
    room_id: str
    student_user_id: str
    bed_number: int

# Complaint Schemas
class ComplaintCreate(BaseModel):
    title: str
    category: str
    description: str
    priority: str = "Medium"
    image_url: Optional[str] = None

class ComplaintAssign(BaseModel):
    staff_id: str
    priority: Optional[str] = None
    notes: Optional[str] = None

class ComplaintStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None

# Visitor Schemas
class VisitorCreate(BaseModel):
    visitor_name: str
    phone: str
    visitor_type: str = "Parent"
    purpose: str
    expected_arrival: datetime

class VisitorStatusUpdate(BaseModel):
    status: str

# Notice Schemas
class NoticeCreate(BaseModel):
    title: str
    content: str
    category: str = "General"
    priority: str = "Normal"
    target_audience: str = "All"
    expires_at: datetime
    is_pinned: bool = False

# Feedback Schemas
class MessFeedbackCreate(BaseModel):
    meal_type: str
    food_quality: int = Field(ge=1, le=5)
    taste: int = Field(ge=1, le=5)
    cleanliness: int = Field(ge=1, le=5)
    comments: Optional[str] = None
    date: str
