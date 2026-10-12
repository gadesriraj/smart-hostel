export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'student' | 'warden' | 'staff';
  avatarUrl?: string;
  createdAt: string;
}

export interface StudentProfile {
  userId: string;
  studentId: string;
  department: string;
  yearOfStudy: number;
  gender: string;
  emergencyContact: string;
  allocatedRoomId?: string;
  allocatedBedNumber?: number;
}

export interface StaffProfile {
  userId: string;
  staffId: string;
  department: string;
  assignedHostelId: string;
  status: 'active' | 'on_leave';
}

export interface Hostel {
  id: string;
  name: string;
  type: 'boys' | 'girls' | 'co-ed';
  totalBlocks: number;
  totalFloors: number;
  wardenName: string;
  contactNumber: string;
}

export interface RoomOccupant {
  allocationId: string;
  studentName: string;
  studentRoll: string;
  department: string;
  bedNumber: number;
  allocationDate: string;
}

export interface Room {
  id: string;
  hostelId: string;
  hostelName: string;
  block: string;
  floor: number;
  roomNumber: string;
  roomType: 'Single' | 'Double' | 'Triple' | 'Four-Sharing';
  capacity: number;
  currentOccupancy: number;
  facilities: string[];
  monthlyFee: number;
  status: 'available' | 'fully_occupied' | 'maintenance' | 'inactive';
  occupants?: RoomOccupant[];
}

export interface RoomAllocation {
  id: string;
  roomId: string;
  roomNumber: string;
  hostelName: string;
  block: string;
  studentUserId: string;
  studentName: string;
  studentRoll: string;
  department: string;
  bedNumber: number;
  allocationDate: string;
  vacateDate?: string;
  status: 'active' | 'vacated';
  allocatedBy: string;
}

export interface ComplaintHistoryItem {
  id: string;
  complaintId: string;
  previousStatus: string;
  newStatus: string;
  changedById: string;
  changedByName: string;
  timestamp: string;
  notes: string;
}

export interface Complaint {
  id: string;
  complaintCode: string;
  studentUserId: string;
  studentName: string;
  studentRoll: string;
  studentPhone: string;
  roomInfo: string;
  category: 'Electrical' | 'Plumbing' | 'Cleaning' | 'Furniture' | 'Internet / Wi-Fi' | 'Bathroom' | 'Water Supply' | 'Other';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  imageUrl?: string;
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  assignedStaffId?: string;
  assignedStaffName?: string;
  submittedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  history: ComplaintHistoryItem[];
}

export interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  visitorType: 'Parent' | 'Relative' | 'Friend' | 'Official';
  studentUserId: string;
  studentName: string;
  studentRoom: string;
  purpose: string;
  expectedArrival: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Checked In' | 'Checked Out';
  approvedBy?: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Maintenance' | 'Mess' | 'Events' | 'Emergency' | 'Rules and Regulations';
  priority: 'Normal' | 'High' | 'Urgent';
  targetAudience: 'All' | 'Students' | 'Staff';
  authorName: string;
  publishedAt: string;
  expiresAt: string;
  status: 'Published' | 'Archived';
  isPinned?: boolean;
}

export interface MessFeedback {
  id: string;
  studentUserId: string;
  studentName: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  foodQuality: number;
  taste: number;
  cleanliness: number;
  comments: string;
  date: string;
  createdAt: string;
}

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  staffId: string;
  department: string;
  assignedHostelId: string;
  status: 'active' | 'on_leave';
  activeTaskCount: number;
  completedTaskCount: number;
  totalTasks: number;
}

export interface StudentListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  department: string;
  yearOfStudy: number;
  gender: string;
  emergencyContact: string;
  allocatedRoomId?: string;
  allocation: RoomAllocation | null;
  status: 'Allocated' | 'Unallocated';
}

export interface WardenDashboardData {
  metrics: {
    totalStudents: number;
    totalRooms: number;
    occupiedBeds: number;
    availableBeds: number;
    totalBedCapacity: number;
    occupancyPercentage: number;
    activeComplaints: number;
    overdueComplaints: number;
    pendingVisitorRequests: number;
    activeVisitorsCheckedIn: number;
    avgResolutionHours: number;
  };
  charts: {
    occupancyByHostel: Array<{ hostelName: string; fullName: string; occupied: number; available: number; capacity: number }>;
    complaintsByCategory: Array<{ category: string; count: number }>;
    statusCounts: Array<{ status: string; count: number; color: string }>;
  };
  tables: {
    recentComplaints: Complaint[];
    recentAllocations: RoomAllocation[];
    pendingVisitors: Visitor[];
    recentAudits: Array<{ id: string; action: string; performedBy: string; userRole: string; details: string; timestamp: string }>;
  };
}
