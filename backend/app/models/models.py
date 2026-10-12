import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Enum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), nullable=False, default="student")  # 'student', 'warden', 'staff'
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    staff_profile = relationship("StaffProfile", back_populates="user", uselist=False)
    complaints = relationship("Complaint", back_populates="student", foreign_keys="Complaint.student_user_id")
    assigned_complaints = relationship("Complaint", back_populates="assigned_staff", foreign_keys="Complaint.assigned_staff_id")
    visitor_requests = relationship("Visitor", back_populates="student")
    allocations = relationship("RoomAllocation", back_populates="student")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id = Column(String(100), unique=True, nullable=False, index=True)
    department = Column(String(255), nullable=False)
    year_of_study = Column(Integer, nullable=False)
    gender = Column(String(50), nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    allocated_room_id = Column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    allocated_bed = Column(Integer, nullable=True)

    user = relationship("User", back_populates="student_profile")
    room = relationship("Room", back_populates="students")

class StaffProfile(Base):
    __tablename__ = "staff_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    staff_id = Column(String(100), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)  # 'electrical', 'plumbing', etc.
    assigned_hostel_id = Column(String(36), ForeignKey("hostels.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="active")

    user = relationship("User", back_populates="staff_profile")
    hostel = relationship("Hostel", back_populates="staff")

class Hostel(Base):
    __tablename__ = "hostels"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, unique=True)
    type = Column(String(50), nullable=False)  # 'boys', 'girls', 'co-ed'
    total_blocks = Column(Integer, default=1)
    total_floors = Column(Integer, default=3)
    warden_name = Column(String(255), nullable=True)
    contact_number = Column(String(50), nullable=True)

    rooms = relationship("Room", back_populates="hostel", cascade="all, delete-orphan")
    staff = relationship("StaffProfile", back_populates="hostel")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hostel_id = Column(String(36), ForeignKey("hostels.id", ondelete="CASCADE"), nullable=False)
    block = Column(String(100), nullable=False)
    floor = Column(Integer, nullable=False)
    room_number = Column(String(50), nullable=False, index=True)
    room_type = Column(String(50), nullable=False, default="Double")
    capacity = Column(Integer, nullable=False, default=2)
    current_occupancy = Column(Integer, nullable=False, default=0)
    facilities = Column(JSON, default=list)
    monthly_fee = Column(Integer, default=4500)
    status = Column(String(50), default="available")  # 'available', 'fully_occupied', 'maintenance', 'inactive'

    hostel = relationship("Hostel", back_populates="rooms")
    students = relationship("StudentProfile", back_populates="room")
    allocations = relationship("RoomAllocation", back_populates="room")

class RoomAllocation(Base):
    __tablename__ = "room_allocations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    student_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bed_number = Column(Integer, nullable=False)
    allocation_date = Column(DateTime, default=datetime.utcnow)
    vacate_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active")  # 'active', 'vacated'
    allocated_by = Column(String(255), nullable=False)

    room = relationship("Room", back_populates="allocations")
    student = relationship("User", back_populates="allocations")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_code = Column(String(50), unique=True, nullable=False, index=True)
    student_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_info = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="Medium")
    status = Column(String(50), default="Submitted")
    assigned_staff_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    image_url = Column(String(500), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    student = relationship("User", back_populates="complaints", foreign_keys=[student_user_id])
    assigned_staff = relationship("User", back_populates="assigned_complaints", foreign_keys=[assigned_staff_id])
    history = relationship("ComplaintHistory", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    changed_by_id = Column(String(36), nullable=False)
    changed_by_name = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    complaint = relationship("Complaint", back_populates="history")

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    visitor_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    visitor_type = Column(String(50), nullable=False)
    student_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_room = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=False)
    expected_arrival = Column(DateTime, nullable=False)
    actual_check_in = Column(DateTime, nullable=True)
    actual_check_out = Column(DateTime, nullable=True)
    status = Column(String(50), default="Pending")  # 'Pending', 'Approved', 'Rejected', 'Checked In', 'Checked Out'
    approved_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="visitor_requests")

class Notice(Base):
    __tablename__ = "notices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    priority = Column(String(50), default="Normal")
    target_audience = Column(String(50), default="All")
    author_name = Column(String(255), nullable=False)
    published_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String(50), default="Published")
    is_pinned = Column(Boolean, default=False)

class NoticeRead(Base):
    __tablename__ = "notice_reads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    notice_id = Column(String(36), ForeignKey("notices.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    read_at = Column(DateTime, default=datetime.utcnow)

class MessFeedback(Base):
    __tablename__ = "mess_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    meal_type = Column(String(50), nullable=False)
    food_quality = Column(Integer, nullable=False)
    taste = Column(Integer, nullable=False)
    cleanliness = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    date = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    action = Column(String(100), nullable=False)
    performed_by = Column(String(255), nullable=False)
    user_role = Column(String(50), nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
