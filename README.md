# Smart Hostel Management Platform
A centralized digital platform for colleges and universities to manage hostel activities, student room allocations, maintenance complaints, visitor passes, mess feedback, and administrative analytics.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Project Architecture](#2-project-architecture)
3. [Quick Start (AI Studio Dev Server)](#3-quick-start)
4. [Backend Setup (FastAPI & PostgreSQL/Supabase)](#4-backend-setup)
5. [Frontend Setup (React + Vite)](#5-frontend-setup)
6. [Database Schema & Migrations](#6-database-schema--migrations)
7. [Initial Administrator Setup](#7-initial-administrator-setup)
8. [Testing Instructions](#8-testing-instructions)
9. [Troubleshooting Guide](#9-troubleshooting-guide)
10. [Deployment Instructions](#10-deployment-instructions)

---

## 1. Prerequisites
Before running the application locally, ensure you have installed:
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Python**: 3.10, 3.11, or 3.12 (for the Python backend)
- **PostgreSQL** (v14+) or a free cloud database on [Supabase](https://supabase.com)
- **Git**

---

## 2. Project Architecture
The platform features two operational modes:
1. **Interactive Full-Stack Web Mode (Port 3000)**:
   - Uses an integrated Express + Vite server (`server.ts`) that runs within this applet.
   - Provides fully functional REST APIs under `/api/*` backed by a relational in-memory database store with persistence, transactional room capacity enforcement, complaint lifecycle history, and realistic campus seed data.
2. **Modular Python Backend Mode (`backend/`)**:
   - Production FastAPI microservice with SQLAlchemy 2.0 ORM, Pydantic validation, Alembic migrations, and PostgreSQL/Supabase connection.

---

## 3. Quick Start (AI Studio Interactive Server)

To run the interactive full-stack applet:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Instant 1-Click Demo Accounts:
| Role | Email | Password | Access Highlights |
|---|---|---|---|
| **Chief Warden** | `warden@campus.edu` | `Admin@123` | Room management, allocation engine, ticket dispatch, visitor approval, CSV reports |
| **Student Resident** | `aarav.sharma@campus.edu` | `Student@123` | Allocated room info, roommates, lodge maintenance ticket, visitor pass, mess rating |
| **Hostel Staff** | `ramesh.kumar@campus.edu` | `Staff@123` | Assigned maintenance work orders, resolution logs, gate visitor check-in desk |

---

## 4. Backend Setup (FastAPI & PostgreSQL / Supabase)

### Step 1: Create Python Virtual Environment
**Windows (PowerShell / Command Prompt):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```

**macOS / Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your PostgreSQL or Supabase connection string:
```ini
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SECRET_KEY=generate_a_random_64_character_jwt_secret
```

### Step 4: Run the FastAPI Server
```bash
uvicorn backend.app.main:app --reload --port 8000
```
API Documentation will be available at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 5. Frontend Setup (React + Vite)
In the project root:
```bash
npm install
npm run dev
```
The client will start on port 3000 (or 5173 if running standalone Vite).

---

## 6. Database Schema & Migrations
The database schema contains 14 normalized tables:
- `users`: Core identity with bcrypt hashed passwords and RBAC (`student`, `warden`, `staff`)
- `student_profiles`: Roll numbers, departments, years of study, emergency contacts
- `staff_profiles`: Department trades (electrical, plumbing, cleaning, wifi)
- `hostels`: Hostels on campus (Ganga Boys, Yamuna Girls, Kaveri PG)
- `rooms`: Room numbers, types, capacity limits, occupancy count, facilities
- `room_allocations`: Active and historic student-to-bed mappings
- `complaints`: Maintenance tickets with SLA priorities and categories
- `complaint_history`: Complete audit timeline tracking each status transition
- `visitors`: Pre-registered guest logs, arrival/departure timestamps
- `notices`: Broadcast campus announcements with pinned flags
- `mess_feedback`: 5-star student food quality, taste, and hygiene reviews
- `audit_logs`: Administrative action audit trails

To run Alembic database migrations:
```bash
alembic revision --autogenerate -m "Initial hostel schema"
alembic upgrade head
```

---

## 7. Initial Administrator Setup
Public registration is strictly restricted to the **Student** role. To bootstrap the first Chief Warden account securely:
```bash
python -c "
from backend.app.db.session import SessionLocal
from backend.app.models.models import User
from backend.app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    email='warden@campus.edu',
    password_hash=get_password_hash('Admin@123'),
    full_name='Dr. Rajesh Verma (Chief Warden)',
    phone='+91 98765 43210',
    role='warden'
)
db.add(admin)
db.commit()
print('Initial Administrator created successfully!')
"
```

---

## 8. Testing Instructions
Run backend tests with pytest:
```bash
pytest backend/tests/test_api.py -v
```

### Manual Acceptance Checklist:
- [x] **Student Registration**: Register with Roll number and email -> account created with 'student' role.
- [x] **Authentication**: Login returns valid token and user profile.
- [x] **Room Allocation**: Warden allocates bed -> current occupancy increments -> room status updates to `fully_occupied` when max capacity reached.
- [x] **Capacity Safeguard**: Attempting to allocate beyond room capacity is blocked with an HTTP 400 error.
- [x] **Vacate Transaction**: Vacating resident releases bed and updates room occupancy.
- [x] **Complaint Lifecycle**: Student logs ticket -> Warden assigns technician -> Staff starts work -> Marks resolved with resolution notes.
- [x] **Visitor Pass**: Student registers visitor -> Warden approves -> Staff checks in & checks out at the gate.
- [x] **Mess Rating**: Student submits 1-5 star review -> Warden sees aggregated averages.
- [x] **CSV Exports**: Occupancy, complaints, visitors, and mess reports download as clean CSV files.

---

## 9. Troubleshooting Guide
- **CORS Errors**: Verify `BACKEND_CORS_ORIGINS` in `.env` includes your client's host and port.
- **Database Connection Refused**: Ensure PostgreSQL is running on port 5432 or verify your Supabase project network access.
- **Port In Use (3000 / 8000)**: Kill the process using `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows).

---

## 10. Deployment Instructions
### Build for Production:
```bash
npm run build
```
Start the production server:
```bash
npm start
```
For containerized deployment (Docker):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
