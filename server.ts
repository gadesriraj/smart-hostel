/**
 * Smart Hostel Management Platform - Full-Stack Express Server
 * Serves complete REST API endpoints and integrates Vite middlewares for development.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, User, StudentProfile, StaffProfile, Room, RoomAllocation, Complaint, Visitor, Notice, MessFeedback } from './server/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Simple Auth Token decoding middleware
// In our secure demo, tokens are formatted as `Bearer user-id` or standard header
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return null;
  return db.users.find(u => u.id === token) || null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  (req as any).user = user;
  next();
}

function requireRole(roles: Array<'student' | 'warden' | 'staff'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

// -------------------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// POST /api/auth/register (Student Registration Only)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { fullName, email, studentId, phone, department, yearOfStudy, gender, emergencyContact, password } = req.body;

  if (!fullName || !email || !studentId || !password) {
    return res.status(400).json({ error: 'Full name, email, student ID, and password are required' });
  }

  // Validate duplicate email
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email address already exists' });
  }

  // Validate duplicate student ID
  if (db.studentProfiles.some(sp => sp.studentId.toUpperCase() === studentId.toUpperCase())) {
    return res.status(409).json({ error: 'A student with this Student ID is already registered' });
  }

  const userId = `usr-stu-${Date.now()}`;
  const newUser: User = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash: password, // In production stored as bcrypt/argon2 hash
    fullName,
    phone: phone || '',
    role: 'student', // Security Rule: Public registration is strictly for students
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    createdAt: new Date().toISOString(),
  };

  const newProfile: StudentProfile = {
    userId,
    studentId: studentId.toUpperCase(),
    department: department || 'General Engineering',
    yearOfStudy: Number(yearOfStudy) || 1,
    gender: gender || 'Unspecified',
    emergencyContact: emergencyContact || '',
  };

  db.users.push(newUser);
  db.studentProfiles.push(newProfile);

  db.logAudit('STUDENT_REGISTRATION', newUser.fullName, 'student', `Registered new student account ${newProfile.studentId}`);

  // Return clean user object (never return password)
  const { passwordHash, ...userResponse } = newUser;
  return res.status(201).json({
    token: newUser.id,
    user: userResponse,
    profile: newProfile,
    message: 'Registration successful! You may now access your student portal.',
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email address or password' });
  }

  let profile = null;
  if (user.role === 'student') {
    profile = db.studentProfiles.find(sp => sp.userId === user.id) || null;
  } else if (user.role === 'staff') {
    profile = db.staffProfiles.find(sp => sp.userId === user.id) || null;
  }

  const { passwordHash, ...userResponse } = user;
  return res.json({
    token: user.id,
    user: userResponse,
    profile,
    message: 'Login successful',
  });
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  let profile: StudentProfile | StaffProfile | null = null;
  let roomDetails = null;

  if (user.role === 'student') {
    const studentProfile = db.studentProfiles.find(sp => sp.userId === user.id) || null;
    profile = studentProfile;
    if (studentProfile?.allocatedRoomId) {
      roomDetails = db.rooms.find(r => r.id === studentProfile.allocatedRoomId) || null;
    }
  } else if (user.role === 'staff') {
    profile = db.staffProfiles.find(sp => sp.userId === user.id) || null;
  }

  const { passwordHash, ...userResponse } = user;
  return res.json({
    user: userResponse,
    profile,
    roomDetails,
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

// -------------------------------------------------------------
// 2. HOSTELS & ROOM MANAGEMENT
// -------------------------------------------------------------

// GET /api/hostels
app.get('/api/hostels', (req: Request, res: Response) => {
  return res.json(db.hostels);
});

// GET /api/rooms
app.get('/api/rooms', (req: Request, res: Response) => {
  const { hostelId, block, floor, status, search } = req.query;
  let results = [...db.rooms];

  if (hostelId) {
    results = results.filter(r => r.hostelId === hostelId);
  }
  if (block) {
    results = results.filter(r => r.block.toLowerCase() === String(block).toLowerCase());
  }
  if (floor !== undefined && floor !== '') {
    results = results.filter(r => r.floor === Number(floor));
  }
  if (status) {
    results = results.filter(r => r.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(r => r.roomNumber.toLowerCase().includes(q) || r.hostelName.toLowerCase().includes(q));
  }

  return res.json(results);
});

// GET /api/rooms/:id
app.get('/api/rooms/:id', (req: Request, res: Response) => {
  const room = db.rooms.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  // Get active occupants
  const occupants = db.allocations
    .filter(a => a.roomId === room.id && a.status === 'active')
    .map(a => ({
      allocationId: a.id,
      studentName: a.studentName,
      studentRoll: a.studentRoll,
      department: a.department,
      bedNumber: a.bedNumber,
      allocationDate: a.allocationDate,
    }));

  return res.json({ ...room, occupants });
});

// POST /api/rooms (Warden Only)
app.post('/api/rooms', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const { hostelId, block, floor, roomNumber, roomType, capacity, facilities, monthlyFee, status } = req.body;

  if (!hostelId || !block || !roomNumber || !capacity) {
    return res.status(400).json({ error: 'Hostel, block, room number, and capacity are required' });
  }

  const hostel = db.hostels.find(h => h.id === hostelId);
  if (!hostel) {
    return res.status(400).json({ error: 'Hostel does not exist' });
  }

  // Check duplicate room number in hostel
  if (db.rooms.some(r => r.hostelId === hostelId && r.roomNumber.toLowerCase() === roomNumber.toLowerCase())) {
    return res.status(409).json({ error: `Room ${roomNumber} already exists in ${hostel.name}` });
  }

  const newRoom: Room = {
    id: `room-${Date.now()}`,
    hostelId,
    hostelName: hostel.name,
    block,
    floor: Number(floor) || 1,
    roomNumber,
    roomType: roomType || 'Double',
    capacity: Number(capacity),
    currentOccupancy: 0,
    facilities: Array.isArray(facilities) ? facilities : ['Wi-Fi', 'Study Desk', 'Cupboard'],
    monthlyFee: Number(monthlyFee) || 4500,
    status: status || 'available',
  };

  db.rooms.unshift(newRoom);
  const warden = (req as any).user as User;
  db.logAudit('ROOM_CREATED', warden.fullName, 'warden', `Added new room ${newRoom.roomNumber} in ${hostel.name}`);

  return res.status(201).json(newRoom);
});

// PATCH /api/rooms/:id (Warden Only)
app.patch('/api/rooms/:id', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const room = db.rooms.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const { facilities, monthlyFee, status, capacity } = req.body;

  if (capacity !== undefined) {
    const newCap = Number(capacity);
    if (newCap < room.currentOccupancy) {
      return res.status(400).json({ error: `Cannot reduce capacity below current occupancy (${room.currentOccupancy})` });
    }
    room.capacity = newCap;
  }

  if (facilities !== undefined) room.facilities = facilities;
  if (monthlyFee !== undefined) room.monthlyFee = Number(monthlyFee);
  if (status !== undefined) {
    // If setting to maintenance or inactive while occupied, warn or update
    room.status = status;
  }

  // Re-evaluate available vs fully occupied if status wasn't maintenance
  if (room.status !== 'maintenance' && room.status !== 'inactive') {
    room.status = room.currentOccupancy >= room.capacity ? 'fully_occupied' : 'available';
  }

  const warden = (req as any).user as User;
  db.logAudit('ROOM_UPDATED', warden.fullName, 'warden', `Updated details for Room ${room.roomNumber}`);

  return res.json(room);
});

// DELETE /api/rooms/:id (Warden Only - Safe Delete)
app.delete('/api/rooms/:id', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const index = db.rooms.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = db.rooms[index];
  if (room.currentOccupancy > 0) {
    return res.status(400).json({ error: `Cannot delete Room ${room.roomNumber} because it currently has ${room.currentOccupancy} occupant(s). Vacate occupants first.` });
  }

  db.rooms.splice(index, 1);
  const warden = (req as any).user as User;
  db.logAudit('ROOM_DELETED', warden.fullName, 'warden', `Deleted Room ${room.roomNumber} from ${room.hostelName}`);

  return res.json({ message: `Room ${room.roomNumber} deleted successfully` });
});

// -------------------------------------------------------------
// 3. ROOM ALLOCATIONS
// -------------------------------------------------------------

// GET /api/allocations
app.get('/api/allocations', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { status, roomId, studentId } = req.query;

  let results = [...db.allocations];
  if (user.role === 'student') {
    // Student sees only their allocations
    results = results.filter(a => a.studentUserId === user.id);
  } else {
    if (status) results = results.filter(a => a.status === status);
    if (roomId) results = results.filter(a => a.roomId === roomId);
    if (studentId) results = results.filter(a => a.studentRoll.toLowerCase().includes(String(studentId).toLowerCase()));
  }

  return res.json(results);
});

// POST /api/allocations (Warden Only - Atomic Allocation Transaction)
app.post('/api/allocations', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const { roomId, studentUserId, bedNumber } = req.body;
  const warden = (req as any).user as User;

  if (!roomId || !studentUserId || !bedNumber) {
    return res.status(400).json({ error: 'Room ID, student, and bed number are required' });
  }

  try {
    const allocation = db.allocateStudent(roomId, studentUserId, Number(bedNumber), warden.fullName);
    return res.status(201).json(allocation);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to allocate room' });
  }
});

// POST /api/allocations/:id/vacate (Warden Only)
app.post('/api/allocations/:id/vacate', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const warden = (req as any).user as User;
  try {
    const vacated = db.vacateAllocation(req.params.id, warden.fullName);
    return res.json({ message: 'Student vacated successfully', allocation: vacated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to vacate room' });
  }
});

// -------------------------------------------------------------
// 4. STUDENTS DIRECTORY & PROFILES
// -------------------------------------------------------------

// GET /api/students (Warden & Staff)
app.get('/api/students', requireAuth, requireRole(['warden', 'staff']), (req: Request, res: Response) => {
  const { search, unallocatedOnly } = req.query;

  const students = db.users
    .filter(u => u.role === 'student')
    .map(u => {
      const profile = db.studentProfiles.find(sp => sp.userId === u.id);
      const activeAlloc = db.allocations.find(a => a.studentUserId === u.id && a.status === 'active');
      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        studentId: profile?.studentId || 'N/A',
        department: profile?.department || 'N/A',
        yearOfStudy: profile?.yearOfStudy || 1,
        gender: profile?.gender || 'N/A',
        emergencyContact: profile?.emergencyContact || 'N/A',
        allocatedRoomId: profile?.allocatedRoomId,
        allocation: activeAlloc || null,
        status: activeAlloc ? 'Allocated' : 'Unallocated',
      };
    });

  let filtered = students;
  if (unallocatedOnly === 'true') {
    filtered = filtered.filter(s => !s.allocation);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(s => s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }

  return res.json(filtered);
});

// GET /api/students/me (Current Student Details)
app.get('/api/students/me', requireAuth, requireRole(['student']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const profile = db.studentProfiles.find(sp => sp.userId === user.id);
  const activeAlloc = db.allocations.find(a => a.studentUserId === user.id && a.status === 'active');

  let room = null;
  let roommates: any[] = [];

  if (activeAlloc) {
    room = db.rooms.find(r => r.id === activeAlloc.roomId) || null;
    roommates = db.allocations
      .filter(a => a.roomId === activeAlloc.roomId && a.status === 'active' && a.studentUserId !== user.id)
      .map(a => ({
        name: a.studentName,
        roll: a.studentRoll,
        department: a.department,
        bedNumber: a.bedNumber,
      }));
  }

  return res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    },
    profile,
    allocation: activeAlloc,
    room,
    roommates,
  });
});

// -------------------------------------------------------------
// 5. COMPLAINTS MANAGEMENT
// -------------------------------------------------------------

// GET /api/complaints
app.get('/api/complaints', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { category, priority, status, search } = req.query;

  let results = [...db.complaints];

  if (user.role === 'student') {
    // Student sees only personal complaints
    results = results.filter(c => c.studentUserId === user.id);
  } else if (user.role === 'staff') {
    // Staff sees tasks assigned to them or unassigned in their dept
    results = results.filter(c => c.assignedStaffId === user.id || !c.assignedStaffId);
  }

  if (category) results = results.filter(c => c.category === category);
  if (priority) results = results.filter(c => c.priority === priority);
  if (status) results = results.filter(c => c.status === status);
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(c => c.title.toLowerCase().includes(q) || c.complaintCode.toLowerCase().includes(q) || c.studentName.toLowerCase().includes(q));
  }

  return res.json(results);
});

// POST /api/complaints (Student Only)
app.post('/api/complaints', requireAuth, requireRole(['student']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { title, category, description, priority, imageUrl } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Title, category, and description are required' });
  }

  const profile = db.studentProfiles.find(sp => sp.userId === user.id);
  const activeAlloc = db.allocations.find(a => a.studentUserId === user.id && a.status === 'active');
  const roomInfo = activeAlloc ? `${activeAlloc.hostelName}, Room ${activeAlloc.roomNumber}` : 'Hostel Resident (Pending Room assignment)';

  const count = db.complaints.length + 1001;
  const complaintCode = `CMP-${count}`;
  const complaintId = `cmp-${Date.now()}`;
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    id: complaintId,
    complaintCode,
    studentUserId: user.id,
    studentName: user.fullName,
    studentRoll: profile?.studentId || 'N/A',
    studentPhone: user.phone,
    roomInfo,
    category,
    title,
    description,
    priority: priority || 'Medium',
    imageUrl,
    status: 'Submitted',
    submittedAt: now,
    history: [
      {
        id: `h-${Date.now()}`,
        complaintId,
        previousStatus: 'None',
        newStatus: 'Submitted',
        changedById: user.id,
        changedByName: user.fullName,
        timestamp: now,
        notes: 'Complaint submitted by resident student',
      },
    ],
  };

  db.complaints.unshift(newComplaint);
  db.logAudit('COMPLAINT_SUBMITTED', user.fullName, 'student', `Registered ticket ${complaintCode}: ${title}`);

  return res.status(201).json(newComplaint);
});

// GET /api/complaints/:id
app.get('/api/complaints/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const complaint = db.complaints.find(c => c.id === req.params.id);

  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  // Security: Students can only view their own complaints
  if (user.role === 'student' && complaint.studentUserId !== user.id) {
    return res.status(403).json({ error: 'Forbidden: Cannot access another resident\'s complaint' });
  }

  return res.json(complaint);
});

// POST /api/complaints/:id/assign (Warden Only)
app.post('/api/complaints/:id/assign', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const warden = (req as any).user as User;
  const { staffId, priority, notes } = req.body;

  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const staffUser = db.users.find(u => u.id === staffId && u.role === 'staff');
  if (!staffUser) {
    return res.status(400).json({ error: 'Valid staff member is required' });
  }

  const prevStatus = complaint.status;
  complaint.status = 'Assigned';
  complaint.assignedStaffId = staffUser.id;
  complaint.assignedStaffName = staffUser.fullName;
  if (priority) complaint.priority = priority;

  const now = new Date().toISOString();
  complaint.history.push({
    id: `h-${Date.now()}`,
    complaintId: complaint.id,
    previousStatus: prevStatus,
    newStatus: 'Assigned',
    changedById: warden.id,
    changedByName: warden.fullName,
    timestamp: now,
    notes: notes || `Assigned to ${staffUser.fullName}`,
  });

  db.logAudit('COMPLAINT_ASSIGNED', warden.fullName, 'warden', `Assigned ${complaint.complaintCode} to ${staffUser.fullName}`);

  return res.json(complaint);
});

// POST /api/complaints/:id/status (Staff or Warden - Update Status)
app.post('/api/complaints/:id/status', requireAuth, requireRole(['staff', 'warden']), (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { status, notes, resolutionNotes } = req.body;

  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const prevStatus = complaint.status;
  complaint.status = status;

  const now = new Date().toISOString();
  if (status === 'Resolved') {
    complaint.resolvedAt = now;
    complaint.resolutionNotes = resolutionNotes || notes || 'Issue resolved successfully';
  }

  complaint.history.push({
    id: `h-${Date.now()}`,
    complaintId: complaint.id,
    previousStatus: prevStatus,
    newStatus: status,
    changedById: currentUser.id,
    changedByName: currentUser.fullName,
    timestamp: now,
    notes: notes || `Status updated from ${prevStatus} to ${status}`,
  });

  db.logAudit('COMPLAINT_STATUS_UPDATE', currentUser.fullName, currentUser.role, `Updated ${complaint.complaintCode} status to ${status}`);

  return res.json(complaint);
});

// -------------------------------------------------------------
// 6. VISITOR MANAGEMENT
// -------------------------------------------------------------

// GET /api/visitors
app.get('/api/visitors', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { status, search } = req.query;

  let results = [...db.visitors];

  if (user.role === 'student') {
    // Students only see their own registered visitors
    results = results.filter(v => v.studentUserId === user.id);
  }

  if (status) results = results.filter(v => v.status === status);
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(v => v.visitorName.toLowerCase().includes(q) || v.studentName.toLowerCase().includes(q) || v.phone.includes(q));
  }

  return res.json(results);
});

// POST /api/visitors (Student Registers Expected Visitor)
app.post('/api/visitors', requireAuth, requireRole(['student']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { visitorName, phone, visitorType, purpose, expectedArrival } = req.body;

  if (!visitorName || !phone || !purpose || !expectedArrival) {
    return res.status(400).json({ error: 'Visitor name, phone, purpose, and arrival time are required' });
  }

  const activeAlloc = db.allocations.find(a => a.studentUserId === user.id && a.status === 'active');
  const roomInfo = activeAlloc ? `${activeAlloc.hostelName} ${activeAlloc.roomNumber}` : 'Hostel Resident';

  const newVisitor: Visitor = {
    id: `vis-${Date.now()}`,
    visitorName,
    phone,
    visitorType: visitorType || 'Relative',
    studentUserId: user.id,
    studentName: user.fullName,
    studentRoom: roomInfo,
    purpose,
    expectedArrival,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  db.visitors.unshift(newVisitor);
  db.logAudit('VISITOR_REGISTERED', user.fullName, 'student', `Registered visitor ${visitorName} for visit on ${expectedArrival}`);

  return res.status(201).json(newVisitor);
});

// PATCH /api/visitors/:id/status (Warden Approves/Rejects)
app.patch('/api/visitors/:id/status', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const warden = (req as any).user as User;
  const { status } = req.body;

  const visitor = db.visitors.find(v => v.id === req.params.id);
  if (!visitor) {
    return res.status(404).json({ error: 'Visitor record not found' });
  }

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Approved or Rejected' });
  }

  visitor.status = status;
  visitor.approvedBy = warden.fullName;

  db.logAudit('VISITOR_STATUS_CHANGE', warden.fullName, 'warden', `${status} visitor ${visitor.visitorName}`);

  return res.json(visitor);
});

// POST /api/visitors/:id/check-in (Staff or Warden Gate Desk)
app.post('/api/visitors/:id/check-in', requireAuth, requireRole(['staff', 'warden']), (req: Request, res: Response) => {
  const staff = (req as any).user as User;
  const visitor = db.visitors.find(v => v.id === req.params.id);

  if (!visitor) {
    return res.status(404).json({ error: 'Visitor record not found' });
  }

  if (visitor.status !== 'Approved') {
    return res.status(400).json({ error: `Cannot check-in visitor with status '${visitor.status}'. Must be Approved first.` });
  }

  visitor.status = 'Checked In';
  visitor.actualCheckIn = new Date().toISOString();

  db.logAudit('VISITOR_CHECK_IN', staff.fullName, staff.role, `Checked in visitor ${visitor.visitorName}`);

  return res.json(visitor);
});

// POST /api/visitors/:id/check-out (Staff or Warden Gate Desk)
app.post('/api/visitors/:id/check-out', requireAuth, requireRole(['staff', 'warden']), (req: Request, res: Response) => {
  const staff = (req as any).user as User;
  const visitor = db.visitors.find(v => v.id === req.params.id);

  if (!visitor) {
    return res.status(404).json({ error: 'Visitor record not found' });
  }

  if (visitor.status !== 'Checked In') {
    return res.status(400).json({ error: `Cannot check-out visitor with status '${visitor.status}'. Must be Checked In.` });
  }

  visitor.status = 'Checked Out';
  visitor.actualCheckOut = new Date().toISOString();

  db.logAudit('VISITOR_CHECK_OUT', staff.fullName, staff.role, `Checked out visitor ${visitor.visitorName}`);

  return res.json(visitor);
});

// -------------------------------------------------------------
// 7. NOTICE BOARD
// -------------------------------------------------------------

// GET /api/notices
app.get('/api/notices', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  let notices = [...db.notices];

  // Non-wardens only see Published notices
  if (user.role !== 'warden') {
    notices = notices.filter(n => n.status === 'Published');
  }

  return res.json(notices);
});

// POST /api/notices (Warden Only)
app.post('/api/notices', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const warden = (req as any).user as User;
  const { title, content, category, priority, targetAudience, expiresAt, isPinned } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required' });
  }

  const newNotice: Notice = {
    id: `not-${Date.now()}`,
    title,
    content,
    category,
    priority: priority || 'Normal',
    targetAudience: targetAudience || 'All',
    authorName: warden.fullName,
    publishedAt: new Date().toISOString(),
    expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Published',
    isPinned: Boolean(isPinned),
  };

  db.notices.unshift(newNotice);
  db.logAudit('NOTICE_PUBLISHED', warden.fullName, 'warden', `Published announcement "${title}"`);

  return res.status(201).json(newNotice);
});

// PATCH /api/notices/:id (Warden Only)
app.patch('/api/notices/:id', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const warden = (req as any).user as User;
  const notice = db.notices.find(n => n.id === req.params.id);

  if (!notice) {
    return res.status(404).json({ error: 'Notice not found' });
  }

  const { title, content, category, priority, targetAudience, status, isPinned } = req.body;
  if (title !== undefined) notice.title = title;
  if (content !== undefined) notice.content = content;
  if (category !== undefined) notice.category = category;
  if (priority !== undefined) notice.priority = priority;
  if (targetAudience !== undefined) notice.targetAudience = targetAudience;
  if (status !== undefined) notice.status = status;
  if (isPinned !== undefined) notice.isPinned = isPinned;

  db.logAudit('NOTICE_UPDATED', warden.fullName, 'warden', `Updated notice "${notice.title}"`);

  return res.json(notice);
});

// DELETE /api/notices/:id (Warden Only)
app.delete('/api/notices/:id', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const index = db.notices.findIndex(n => n.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Notice not found' });
  }

  const removed = db.notices.splice(index, 1)[0];
  const warden = (req as any).user as User;
  db.logAudit('NOTICE_DELETED', warden.fullName, 'warden', `Deleted notice "${removed.title}"`);

  return res.json({ message: 'Notice deleted successfully' });
});

// -------------------------------------------------------------
// 8. MESS FEEDBACK
// -------------------------------------------------------------

// GET /api/feedback
app.get('/api/feedback', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { mealType, date } = req.query;

  let list = [...db.messFeedbacks];
  if (user.role === 'student') {
    list = list.filter(f => f.studentUserId === user.id);
  }

  if (mealType) list = list.filter(f => f.mealType === mealType);
  if (date) list = list.filter(f => f.date === date);

  // Compute aggregate stats for wardens
  let stats = null;
  if (user.role === 'warden' || user.role === 'staff') {
    const total = db.messFeedbacks.length;
    const avgQuality = total > 0 ? (db.messFeedbacks.reduce((acc, f) => acc + f.foodQuality, 0) / total).toFixed(1) : '0';
    const avgTaste = total > 0 ? (db.messFeedbacks.reduce((acc, f) => acc + f.taste, 0) / total).toFixed(1) : '0';
    const avgClean = total > 0 ? (db.messFeedbacks.reduce((acc, f) => acc + f.cleanliness, 0) / total).toFixed(1) : '0';

    stats = {
      totalSubmissions: total,
      averageQuality: Number(avgQuality),
      averageTaste: Number(avgTaste),
      averageCleanliness: Number(avgClean),
    };
  }

  return res.json({ list, stats });
});

// POST /api/feedback (Student Only)
app.post('/api/feedback', requireAuth, requireRole(['student']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { mealType, foodQuality, taste, cleanliness, comments, date } = req.body;

  if (!mealType || !foodQuality || !taste || !cleanliness) {
    return res.status(400).json({ error: 'Meal type and all three ratings (1-5) are required' });
  }

  const newFeedback: MessFeedback = {
    id: `fb-${Date.now()}`,
    studentUserId: user.id,
    studentName: user.fullName,
    mealType,
    foodQuality: Number(foodQuality),
    taste: Number(taste),
    cleanliness: Number(cleanliness),
    comments: comments || '',
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  db.messFeedbacks.unshift(newFeedback);
  return res.status(201).json(newFeedback);
});

// -------------------------------------------------------------
// 9. STAFF MANAGEMENT
// -------------------------------------------------------------

// GET /api/staff
app.get('/api/staff', requireAuth, (req: Request, res: Response) => {
  const staffUsers = db.users
    .filter(u => u.role === 'staff')
    .map(u => {
      const profile = db.staffProfiles.find(sp => sp.userId === u.id);
      const assignedTasks = db.complaints.filter(c => c.assignedStaffId === u.id);
      const activeTasks = assignedTasks.filter(c => ['Assigned', 'In Progress'].includes(c.status));
      const completedTasks = assignedTasks.filter(c => c.status === 'Resolved');

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        staffId: profile?.staffId || 'STF-001',
        department: profile?.department || 'general',
        assignedHostelId: profile?.assignedHostelId || 'hostel-1',
        status: profile?.status || 'active',
        activeTaskCount: activeTasks.length,
        completedTaskCount: completedTasks.length,
        totalTasks: assignedTasks.length,
      };
    });

  return res.json(staffUsers);
});

// POST /api/staff (Warden Only - Add Staff Member)
app.post('/api/staff', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const { fullName, email, phone, department, assignedHostelId, password } = req.body;
  const warden = (req as any).user as User;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full name and email are required' });
  }

  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const userId = `usr-staff-${Date.now()}`;
  const staffId = `STF-${(department || 'GEN').toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`;

  const newStaff: User = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash: password || 'Staff@123',
    fullName,
    phone: phone || '+91 98000 00000',
    role: 'staff',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    createdAt: new Date().toISOString(),
  };

  const newProfile: StaffProfile = {
    userId,
    staffId,
    department: department || 'general',
    assignedHostelId: assignedHostelId || 'hostel-1',
    status: 'active',
  };

  db.users.push(newStaff);
  db.staffProfiles.push(newProfile);

  db.logAudit('STAFF_ADDED', warden.fullName, 'warden', `Added staff member ${fullName} (${staffId})`);

  const { passwordHash, ...userResponse } = newStaff;
  return res.status(201).json({ ...userResponse, profile: newProfile });
});

// -------------------------------------------------------------
// 10. DASHBOARD ANALYTICS & STATS (REAL DATABASE QUERIES)
// -------------------------------------------------------------

// GET /api/dashboard/warden
app.get('/api/dashboard/warden', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const totalStudents = db.users.filter(u => u.role === 'student').length;
  const totalRooms = db.rooms.length;
  const totalBedCapacity = db.rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = db.rooms.reduce((acc, r) => acc + r.currentOccupancy, 0);
  const availableBeds = Math.max(0, totalBedCapacity - occupiedBeds);
  const occupancyPercentage = totalBedCapacity > 0 ? Math.round((occupiedBeds / totalBedCapacity) * 100) : 0;

  const activeComplaints = db.complaints.filter(c => ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)).length;
  const overdueComplaints = db.complaints.filter(c => {
    if (['Resolved', 'Rejected'].includes(c.status)) return false;
    const submittedTime = new Date(c.submittedAt).getTime();
    // Overdue if older than 48 hours
    return Date.now() - submittedTime > 48 * 60 * 60 * 1000;
  }).length;

  const pendingVisitorRequests = db.visitors.filter(v => v.status === 'Pending').length;
  const activeVisitorsCheckedIn = db.visitors.filter(v => v.status === 'Checked In').length;

  // Chart 1: Room Occupancy by Hostel
  const occupancyByHostel = db.hostels.map(h => {
    const hostelRooms = db.rooms.filter(r => r.hostelId === h.id);
    const capacity = hostelRooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupied = hostelRooms.reduce((acc, r) => acc + r.currentOccupancy, 0);
    return {
      hostelName: h.name.split(' ')[0], // short name
      fullName: h.name,
      occupied,
      available: Math.max(0, capacity - occupied),
      capacity,
    };
  });

  // Chart 2: Complaints by Category
  const categories = ['Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Internet / Wi-Fi', 'Bathroom', 'Water Supply', 'Other'];
  const complaintsByCategory = categories.map(cat => ({
    category: cat,
    count: db.complaints.filter(c => c.category === cat).length,
  }));

  // Chart 3: Complaints by Status
  const statusCounts = [
    { status: 'Submitted', count: db.complaints.filter(c => c.status === 'Submitted').length, color: '#3b82f6' },
    { status: 'In Progress', count: db.complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length, color: '#f59e0b' },
    { status: 'Resolved', count: db.complaints.filter(c => c.status === 'Resolved').length, color: '#10b981' },
    { status: 'Rejected', count: db.complaints.filter(c => c.status === 'Rejected').length, color: '#ef4444' },
  ];

  // Chart 4: Average Resolution Time in Hours
  const resolvedList = db.complaints.filter(c => c.status === 'Resolved' && c.resolvedAt);
  let avgResolutionHours = 0;
  if (resolvedList.length > 0) {
    const totalDiffHours = resolvedList.reduce((acc, c) => {
      const diff = (new Date(c.resolvedAt!).getTime() - new Date(c.submittedAt).getTime()) / (1000 * 60 * 60);
      return acc + diff;
    }, 0);
    avgResolutionHours = Math.round((totalDiffHours / resolvedList.length) * 10) / 10;
  }

  // Recent Tables
  const recentComplaints = db.complaints.slice(0, 5);
  const recentAllocations = db.allocations.slice(0, 5);
  const pendingVisitors = db.visitors.filter(v => v.status === 'Pending').slice(0, 5);
  const recentAudits = db.auditLogs.slice(0, 6);

  return res.json({
    metrics: {
      totalStudents,
      totalRooms,
      occupiedBeds,
      availableBeds,
      totalBedCapacity,
      occupancyPercentage,
      activeComplaints,
      overdueComplaints,
      pendingVisitorRequests,
      activeVisitorsCheckedIn,
      avgResolutionHours,
    },
    charts: {
      occupancyByHostel,
      complaintsByCategory,
      statusCounts,
    },
    tables: {
      recentComplaints,
      recentAllocations,
      pendingVisitors,
      recentAudits,
    },
  });
});

// GET /api/dashboard/student
app.get('/api/dashboard/student', requireAuth, requireRole(['student']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const profile = db.studentProfiles.find(sp => sp.userId === user.id);
  const activeAlloc = db.allocations.find(a => a.studentUserId === user.id && a.status === 'active');

  const myComplaints = db.complaints.filter(c => c.studentUserId === user.id);
  const activeComplaintsCount = myComplaints.filter(c => ['Submitted', 'Assigned', 'In Progress'].includes(c.status)).length;
  const resolvedComplaintsCount = myComplaints.filter(c => c.status === 'Resolved').length;

  const recentNotices = db.notices.filter(n => n.status === 'Published').slice(0, 4);
  const myVisitors = db.visitors.filter(v => v.studentUserId === user.id).slice(0, 3);

  let room = null;
  let roommates: any[] = [];
  if (activeAlloc) {
    room = db.rooms.find(r => r.id === activeAlloc.roomId);
    roommates = db.allocations
      .filter(a => a.roomId === activeAlloc.roomId && a.status === 'active' && a.studentUserId !== user.id)
      .map(a => ({ name: a.studentName, roll: a.studentRoll, department: a.department, bedNumber: a.bedNumber }));
  }

  return res.json({
    allocation: activeAlloc || null,
    room,
    roommates,
    stats: {
      totalComplaints: myComplaints.length,
      activeComplaints: activeComplaintsCount,
      resolvedComplaints: resolvedComplaintsCount,
      unreadNoticesCount: recentNotices.length,
    },
    recentComplaints: myComplaints.slice(0, 4),
    recentNotices,
    recentVisitors: myVisitors,
  });
});

// GET /api/dashboard/staff
app.get('/api/dashboard/staff', requireAuth, requireRole(['staff']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const assignedTasks = db.complaints.filter(c => c.assignedStaffId === user.id);
  const pendingTasks = assignedTasks.filter(c => c.status === 'Assigned');
  const inProgressTasks = assignedTasks.filter(c => c.status === 'In Progress');
  const resolvedTasks = assignedTasks.filter(c => c.status === 'Resolved');

  const approvedVisitors = db.visitors.filter(v => ['Approved', 'Checked In'].includes(v.status));

  return res.json({
    metrics: {
      totalAssigned: assignedTasks.length,
      pendingCount: pendingTasks.length,
      inProgressCount: inProgressTasks.length,
      resolvedCount: resolvedTasks.length,
      activeVisitorsOnCampus: db.visitors.filter(v => v.status === 'Checked In').length,
    },
    tasks: assignedTasks,
    visitors: approvedVisitors,
  });
});

// -------------------------------------------------------------
// 11. REPORTS & CSV EXPORT
// -------------------------------------------------------------

// GET /api/reports/csv?type=occupancy|complaints|visitors|feedback
app.get('/api/reports/csv', requireAuth, requireRole(['warden']), (req: Request, res: Response) => {
  const type = String(req.query.type || 'occupancy');
  let filename = `report-${type}-${Date.now()}.csv`;
  let csvContent = '';

  if (type === 'occupancy') {
    csvContent = 'Hostel Name,Block,Floor,Room Number,Type,Capacity,Current Occupancy,Available Beds,Monthly Fee,Status\n';
    db.rooms.forEach(r => {
      const avail = Math.max(0, r.capacity - r.currentOccupancy);
      csvContent += `"${r.hostelName}","${r.block}",${r.floor},"${r.roomNumber}","${r.roomType}",${r.capacity},${r.currentOccupancy},${avail},${r.monthlyFee},"${r.status}"\n`;
    });
  } else if (type === 'complaints') {
    csvContent = 'Ticket Code,Student Name,Roll Number,Room Info,Category,Priority,Status,Staff Assigned,Submitted At,Resolved At,Title\n';
    db.complaints.forEach(c => {
      csvContent += `"${c.complaintCode}","${c.studentName}","${c.studentRoll}","${c.roomInfo}","${c.category}","${c.priority}","${c.status}","${c.assignedStaffName || 'Unassigned'}","${c.submittedAt}","${c.resolvedAt || 'N/A'}","${c.title.replace(/"/g, '""')}"\n`;
    });
  } else if (type === 'visitors') {
    csvContent = 'Visitor Name,Phone,Type,Student Name,Resident Room,Purpose,Expected Arrival,Status,Actual Check In,Actual Check Out\n';
    db.visitors.forEach(v => {
      csvContent += `"${v.visitorName}","${v.phone}","${v.visitorType}","${v.studentName}","${v.studentRoom}","${v.purpose.replace(/"/g, '""')}","${v.expectedArrival}","${v.status}","${v.actualCheckIn || 'N/A'}","${v.actualCheckOut || 'N/A'}"\n`;
    });
  } else if (type === 'feedback') {
    csvContent = 'Student Name,Date,Meal Type,Quality Rating,Taste Rating,Cleanliness Rating,Comments\n';
    db.messFeedbacks.forEach(f => {
      csvContent += `"${f.studentName}","${f.date}","${f.mealType}",${f.foodQuality},${f.taste},${f.cleanliness},"${f.comments.replace(/"/g, '""')}"\n`;
    });
  } else {
    return res.status(400).send('Invalid report type');
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(csvContent);
});

// -------------------------------------------------------------
// 12. VITE MIDDLEWARE / STATIC ASSETS INTEGRATION
// -------------------------------------------------------------

async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Hostel] Full-Stack server is live and running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
