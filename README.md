# Smart Hostel Management Platform
A centralized digital platform for colleges and universities to manage hostel activities, student room allocations, maintenance complaints, visitor passes, mess feedback, and administrative analytics.

---

## Table of Contents
1. [Overview](#1-overview)
2. [Unified Architecture](#2-unified-architecture)
3. [Quick Start](#3-quick-start)
4. [Instant Demo Accounts](#4-instant-demo-accounts)
5. [Role-Based Modules](#5-role-based-modules)
6. [API Specifications](#6-api-specifications)
7. [Database Schema & Data Model](#7-database-schema--data-model)
8. [Acceptance Verification](#8-acceptance-verification)
9. [Deployment](#9-deployment)

---

## 1. Overview
The **Smart Hostel Management Platform** combines real-time residential management into a cohesive, single-repository system. It eliminates paper registers, manual logs, and spreadsheet errors while enforcing strict room capacity safeguards, multi-role security, and auditable maintenance workflows.

---

## 2. Unified Architecture
This application is built as a unified, full-stack platform:
- **Application Server (`server.ts`)**: An Express server listening on port 3000 that serves high-throughput REST APIs (`/api/*`) while seamlessly mounting Vite middlewares in development and static assets in production.
- **Relational Data Store (`server/store.ts`)**: Relational database engine supporting ACID-compliant room allocations, bed capacity enforcement, complaint audit progression histories, visitor check-in timestamps, and mess ratings.
- **Client Application (`src/`)**: A modular React + Tailwind CSS dashboard with responsive sidebar navigation, role-tailored viewports, and interactive analytics charts (Recharts).

---

## 3. Quick Start

Run the following commands in the root directory:
```bash
# Install dependencies
npm install

# Start the full-stack development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 4. Instant Demo Accounts

You can test each role using 1-click preset buttons on the login screen or by entering these credentials:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Chief Warden** | `warden@campus.edu` | `Admin@123` | Room management, atomic bed allocation, complaint dispatch, visitor approvals, CSV export |
| **Resident Student** | `aarav.sharma@campus.edu` | `Student@123` | View room & roommates, lodge complaints, pre-register visitors, submit mess ratings |
| **Hostel Staff** | `ramesh.kumar@campus.edu` | `Staff@123` | Task management, progress logs, resolution summaries, gate visitor check-in desk |

---

## 5. Role-Based Modules

### 1. Student Portal
- **Dashboard**: Displays allocated hostel, block, room, bed number, active roommates, and quick actions.
- **Lodge Complaints**: Select category (Electrical, Plumbing, Cleaning, WiFi, etc.), set priority tier, provide problem descriptions, and track lifecycle from `Submitted` to `Resolved`.
- **Visitor Pass**: Pre-register family members or guests with expected arrival times and monitor warden approval.
- **Mess Feedback**: 5-star daily rating breakdown for food quality, taste, and dining hygiene across all 4 meals.
- **Notice Board**: Read official announcements, maintenance curfews, and exam rules.

### 2. Warden Administration Portal
- **Overview Analytics**: Real-time KPI summary cards (occupancy percentage, active complaints, overdue SLAs, pending visitor requests) with interactive bar and pie charts.
- **Room Allocation**: Create rooms, search/filter by wing and status, allocate beds with strict capacity checks, and safely vacate residents.
- **Complaints Center**: Delegate incoming issues to specific maintenance technicians, change priorities, and inspect chronological audit histories.
- **Visitor Authorization**: Review and approve/reject resident visitor pass applications.
- **Mess Committee Oversight**: View aggregate star ratings and review comments by meal type.
- **Reports & Export**: Inspect tabular occupancy, complaint, visitor, and dining reports with direct CSV downloads.

### 3. Staff & Security Desk
- **Work Orders**: Review pending and active tasks assigned by wardens, record work notes, and mark tickets resolved with resolution summaries.
- **Gate Desk**: Search verified visitor records by phone or name, and record arrival (`Check-In`) and departure (`Check-Out`) timestamps.

---

## 6. API Specifications

### Authentication
- `POST /api/auth/register` - Register resident student account
- `POST /api/auth/login` - Authenticate user & retrieve session token
- `GET /api/auth/me` - Fetch profile & room info
- `POST /api/auth/logout` - Invalidate session

### Rooms & Allocations
- `GET /api/rooms` - Query rooms with filters (hostel, block, floor, status)
- `POST /api/rooms` - Create a new room (warden only)
- `GET /api/rooms/:id` - Fetch room with active occupants
- `POST /api/allocations` - Transactional student bed allocation
- `POST /api/allocations/:id/vacate` - Vacate resident and free bed

### Complaints
- `GET /api/complaints` - Query complaints (role-filtered)
- `POST /api/complaints` - Submit complaint ticket
- `POST /api/complaints/:id/assign` - Dispatch ticket to staff
- `POST /api/complaints/:id/status` - Update status and resolution summary

### Visitors
- `GET /api/visitors` - List visitor records
- `POST /api/visitors` - Pre-register visitor pass
- `PATCH /api/visitors/:id/status` - Warden approval/rejection
- `POST /api/visitors/:id/check-in` - Gate security check-in
- `POST /api/visitors/:id/check-out` - Gate security check-out

### Reports & CSV
- `GET /api/reports/csv?type=occupancy|complaints|visitors|feedback` - Export real database records to CSV

---

## 7. Database Schema & Data Model

The data store manages 14 normalized entities:
1. `User`: Identity with role-based access (`student`, `warden`, `staff`)
2. `StudentProfile`: Roll number, department, year of study, emergency contact
3. `StaffProfile`: Department trade (electrical, plumbing, cleaning, wifi)
4. `Hostel`: Wing names, block counts, warden details
5. `Room`: Room identifiers, capacity limit, occupancy, facilities, fee
6. `RoomAllocation`: Student-bed mapping with timestamps
7. `Complaint`: Ticket ID, category, priority, status, assigned technician
8. `ComplaintHistory`: Event-driven state changes and notes
9. `Visitor`: Guest name, contact, purpose, check-in/out timestamps
10. `Notice`: Announcements with category and pinned flags
11. `MessFeedback`: Multi-dimensional meal ratings (1-5 stars)
12. `AuditLog`: Security audit trails for all critical admin operations

---

## 8. Acceptance Verification
- [x] Application compiles cleanly with zero TypeScript errors.
- [x] Full-stack server starts and serves client bundle and REST APIs on port 3000.
- [x] Role-based routing isolates student, warden, and staff permissions.
- [x] Dynamic room allocation enforces capacity limits and prevents duplicate active assignments.
- [x] Status change history is preserved for every complaint ticket.
- [x] Real-time CSV export downloads verified datasets.

---

## 9. Deployment
To create a production build:
```bash
npm run build
npm start
```
