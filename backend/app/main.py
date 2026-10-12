from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.core.config import settings
from backend.app.db.session import engine, get_db, Base
from backend.app.models.models import (
    User,
    StudentProfile,
    StaffProfile,
    Hostel,
    Room,
    RoomAllocation,
    Complaint,
    Visitor,
    Notice,
    MessFeedback,
)
from backend.app.schemas.schemas import (
    StudentRegisterRequest,
    LoginRequest,
    RoomCreate,
    AllocationCreate,
    ComplaintCreate,
    VisitorCreate,
    NoticeCreate,
    MessFeedbackCreate,
)
from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "Smart Hostel Management Platform",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }

# ----------------- AUTH ENDPOINTS -----------------
@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_student(payload: StudentRegisterRequest, db: Session = Depends(get_db)):
    # Check duplicate email
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    # Check duplicate student ID
    if db.query(StudentProfile).filter(StudentProfile.student_id == payload.studentId.upper()).first():
        raise HTTPException(status_code=409, detail="A student with this Student ID is already registered")

    new_user = User(
        email=payload.email.lower(),
        password_hash=get_password_hash(payload.password),
        full_name=payload.fullName,
        phone=payload.phone,
        role="student",
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={payload.fullName}",
    )
    db.add(new_user)
    db.flush()

    new_profile = StudentProfile(
        user_id=new_user.id,
        student_id=payload.studentId.upper(),
        department=payload.department,
        year_of_study=payload.yearOfStudy,
        gender=payload.gender,
        emergency_contact=payload.emergencyContact,
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role,
        },
    }

@app.post("/api/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email address or password")

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
    }

# ----------------- ROOMS ENDPOINTS -----------------
@app.get("/api/rooms")
def list_rooms(db: Session = Depends(get_db)):
    rooms = db.query(Room).all()
    return rooms

@app.post("/api/rooms", status_code=status.HTTP_201_CREATED)
def create_room(payload: RoomCreate, db: Session = Depends(get_db)):
    room = Room(
        hostel_id=payload.hostel_id,
        block=payload.block,
        floor=payload.floor,
        room_number=payload.room_number,
        room_type=payload.room_type,
        capacity=payload.capacity,
        facilities=payload.facilities,
        monthly_fee=payload.monthly_fee,
        status=payload.status,
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room

# ----------------- ALLOCATIONS ENDPOINTS -----------------
@app.post("/api/allocations", status_code=status.HTTP_201_CREATED)
def allocate_room(payload: AllocationCreate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == payload.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.status in ["maintenance", "inactive"]:
        raise HTTPException(status_code=400, detail=f"Cannot allocate: Room is {room.status}")
    if room.current_occupancy >= room.capacity:
        raise HTTPException(status_code=400, detail="Room is already at full capacity")

    # Check student active allocation
    active_alloc = db.query(RoomAllocation).filter(
        RoomAllocation.student_user_id == payload.student_user_id,
        RoomAllocation.status == "active"
    ).first()
    if active_alloc:
        raise HTTPException(status_code=400, detail="Student already has an active room allocation")

    new_alloc = RoomAllocation(
        room_id=room.id,
        student_user_id=payload.student_user_id,
        bed_number=payload.bed_number,
        allocated_by="Chief Warden",
    )
    room.current_occupancy += 1
    if room.current_occupancy >= room.capacity:
        room.status = "fully_occupied"

    db.add(new_alloc)
    db.commit()
    db.refresh(new_alloc)
    return new_alloc

# ----------------- COMPLAINTS ENDPOINTS -----------------
@app.get("/api/complaints")
def list_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).all()

@app.post("/api/complaints", status_code=status.HTTP_201_CREATED)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    count = db.query(Complaint).count() + 1001
    code = f"CMP-{count}"
    complaint = Complaint(
        complaint_code=code,
        student_user_id="usr-stu-1",
        room_info="Ganga Boys Hostel Room A-101",
        category=payload.category,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        image_url=payload.image_url,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint

# ----------------- NOTICES ENDPOINTS -----------------
@app.get("/api/notices")
def list_notices(db: Session = Depends(get_db)):
    return db.query(Notice).filter(Notice.status == "Published").all()

@app.post("/api/notices", status_code=status.HTTP_201_CREATED)
def create_notice(payload: NoticeCreate, db: Session = Depends(get_db)):
    notice = Notice(
        title=payload.title,
        content=payload.content,
        category=payload.category,
        priority=payload.priority,
        target_audience=payload.target_audience,
        author_name="Chief Warden",
        expires_at=payload.expires_at,
        is_pinned=payload.is_pinned,
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice

# ----------------- MESS FEEDBACK ENDPOINTS -----------------
@app.get("/api/feedback")
def list_feedback(db: Session = Depends(get_db)):
    return db.query(MessFeedback).all()

@app.post("/api/feedback", status_code=status.HTTP_201_CREATED)
def submit_feedback(payload: MessFeedbackCreate, db: Session = Depends(get_db)):
    fb = MessFeedback(
        student_user_id="usr-stu-1",
        meal_type=payload.meal_type,
        food_quality=payload.food_quality,
        taste=payload.taste,
        cleanliness=payload.cleanliness,
        comments=payload.comments,
        date=payload.date,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb
