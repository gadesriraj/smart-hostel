import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.db.session import Base, get_db
from backend.app.models.models import User, Hostel, Room

# In-memory SQLite engine for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_student_registration_and_login():
    reg_data = {
        "fullName": "Aryan Patel",
        "studentId": "CS202601",
        "email": "aryan.patel@campus.edu",
        "phone": "+91 98765 43210",
        "department": "Computer Science",
        "yearOfStudy": 2,
        "gender": "Male",
        "emergencyContact": "+91 98765 00000",
        "password": "SecurePassword@123",
    }
    response = client.post("/api/auth/register", json=reg_data)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "aryan.patel@campus.edu"
    assert data["user"]["role"] == "student"

    # Duplicate registration should return 409 Conflict
    dup_response = client.post("/api/auth/register", json=reg_data)
    assert dup_response.status_code == 409

    # Successful login
    login_res = client.post(
        "/api/auth/login",
        json={"email": "aryan.patel@campus.edu", "password": "SecurePassword@123"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Invalid password login
    bad_login = client.post(
        "/api/auth/login",
        json={"email": "aryan.patel@campus.edu", "password": "WrongPassword"},
    )
    assert bad_login.status_code == 401

def test_room_creation_and_capacity():
    db = TestingSessionLocal()
    hostel = Hostel(
        id="h-test-1",
        name="Test Hostel",
        type="boys",
        total_blocks=2,
        total_floors=3,
    )
    db.add(hostel)
    db.commit()

    # Create room
    room_data = {
        "hostel_id": "h-test-1",
        "block": "Block A",
        "floor": 1,
        "room_number": "101",
        "room_type": "Single",
        "capacity": 1,
        "facilities": ["Wi-Fi", "Desk"],
        "monthly_fee": 5000,
        "status": "available",
    }
    res = client.post("/api/rooms", json=room_data)
    assert res.status_code == 201
    room = res.json()
    assert room["capacity"] == 1
    assert room["current_occupancy"] == 0
