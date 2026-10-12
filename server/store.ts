/**
 * Smart Hostel Management Platform - Mock/In-Memory Relational Store
 * Provides robust in-memory database with realistic seed data and transaction guarantees.
 */

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  role: 'student' | 'warden' | 'staff';
  avatarUrl?: string;
  createdAt: string;
}

export interface StudentProfile {
  userId: string;
  studentId: string; // e.g. "STU2024001"
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
  department: 'electrical' | 'plumbing' | 'cleaning' | 'wifi' | 'carpentry' | 'general';
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
  complaintCode: string; // e.g. "CMP-1001"
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
  foodQuality: number; // 1-5
  taste: number; // 1-5
  cleanliness: number; // 1-5
  comments: string;
  date: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  userRole: string;
  details: string;
  timestamp: string;
}

// Initial Database Seeder
class DatabaseStore {
  users: User[] = [];
  studentProfiles: StudentProfile[] = [];
  staffProfiles: StaffProfile[] = [];
  hostels: Hostel[] = [];
  rooms: Room[] = [];
  allocations: RoomAllocation[] = [];
  complaints: Complaint[] = [];
  visitors: Visitor[] = [];
  notices: Notice[] = [];
  messFeedbacks: MessFeedback[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Hostels
    this.hostels = [
      {
        id: 'hostel-1',
        name: 'Ganga Boys Hostel',
        type: 'boys',
        totalBlocks: 3,
        totalFloors: 4,
        wardenName: 'Dr. Rajesh Verma',
        contactNumber: '+91 98765 43210',
      },
      {
        id: 'hostel-2',
        name: 'Yamuna Girls Hostel',
        type: 'girls',
        totalBlocks: 2,
        totalFloors: 4,
        wardenName: 'Prof. Sunita Rao',
        contactNumber: '+91 98765 43211',
      },
      {
        id: 'hostel-3',
        name: 'Kaveri PG & Research Hostel',
        type: 'co-ed',
        totalBlocks: 2,
        totalFloors: 3,
        wardenName: 'Dr. Anand Joshi',
        contactNumber: '+91 98765 43212',
      },
    ];

    // 2. Users (Warden, Staff, Students)
    this.users = [
      {
        id: 'usr-warden-1',
        email: 'warden@campus.edu',
        passwordHash: 'Admin@123',
        fullName: 'Dr. Rajesh Verma (Chief Warden)',
        phone: '+91 98765 43210',
        role: 'warden',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        createdAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'usr-staff-1',
        email: 'ramesh.kumar@campus.edu',
        passwordHash: 'Staff@123',
        fullName: 'Ramesh Kumar',
        phone: '+91 98765 11001',
        role: 'staff',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        createdAt: '2026-01-12T09:00:00Z',
      },
      {
        id: 'usr-staff-2',
        email: 'suresh.singh@campus.edu',
        passwordHash: 'Staff@123',
        fullName: 'Suresh Singh',
        phone: '+91 98765 11002',
        role: 'staff',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        createdAt: '2026-01-12T09:30:00Z',
      },
      {
        id: 'usr-stu-1',
        email: 'aarav.sharma@campus.edu',
        passwordHash: 'Student@123',
        fullName: 'Aarav Sharma',
        phone: '+91 98111 22334',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'usr-stu-2',
        email: 'priya.patel@campus.edu',
        passwordHash: 'Student@123',
        fullName: 'Priya Patel',
        phone: '+91 98222 33445',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        createdAt: '2026-01-15T11:00:00Z',
      },
      {
        id: 'usr-stu-3',
        email: 'rohit.verma@campus.edu',
        passwordHash: 'Student@123',
        fullName: 'Rohit Verma',
        phone: '+91 98333 44556',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
        createdAt: '2026-01-18T12:00:00Z',
      },
      {
        id: 'usr-stu-4',
        email: 'ananya.iyer@campus.edu',
        passwordHash: 'Student@123',
        fullName: 'Ananya Iyer',
        phone: '+91 98444 55667',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        createdAt: '2026-01-20T14:00:00Z',
      },
    ];

    // Staff profiles
    this.staffProfiles = [
      {
        userId: 'usr-staff-1',
        staffId: 'STF-ELEC-01',
        department: 'electrical',
        assignedHostelId: 'hostel-1',
        status: 'active',
      },
      {
        userId: 'usr-staff-2',
        staffId: 'STF-PLUMB-02',
        department: 'plumbing',
        assignedHostelId: 'hostel-1',
        status: 'active',
      },
    ];

    // Student profiles
    this.studentProfiles = [
      {
        userId: 'usr-stu-1',
        studentId: 'CS202401',
        department: 'Computer Science & Engineering',
        yearOfStudy: 3,
        gender: 'Male',
        emergencyContact: '+91 98111 99991 (Father)',
        allocatedRoomId: 'room-101',
        allocatedBedNumber: 1,
      },
      {
        userId: 'usr-stu-2',
        studentId: 'EC202445',
        department: 'Electronics & Communication',
        yearOfStudy: 2,
        gender: 'Female',
        emergencyContact: '+91 98222 99992 (Mother)',
        allocatedRoomId: 'room-201',
        allocatedBedNumber: 1,
      },
      {
        userId: 'usr-stu-3',
        studentId: 'ME202412',
        department: 'Mechanical Engineering',
        yearOfStudy: 1,
        gender: 'Male',
        emergencyContact: '+91 98333 99993 (Father)',
        allocatedRoomId: undefined, // Unallocated, ready to allocate in demo
        allocatedBedNumber: undefined,
      },
      {
        userId: 'usr-stu-4',
        studentId: 'BT202488',
        department: 'Biotechnology',
        yearOfStudy: 2,
        gender: 'Female',
        emergencyContact: '+91 98444 99994 (Guardian)',
        allocatedRoomId: 'room-201',
        allocatedBedNumber: 2,
      },
    ];

    // 3. Rooms
    this.rooms = [
      {
        id: 'room-101',
        hostelId: 'hostel-1',
        hostelName: 'Ganga Boys Hostel',
        block: 'Block A',
        floor: 1,
        roomNumber: 'A-101',
        roomType: 'Double',
        capacity: 2,
        currentOccupancy: 1,
        facilities: ['High-speed Wi-Fi', 'Attached Balcony', 'Study Table', 'Cupboards'],
        monthlyFee: 4500,
        status: 'available',
      },
      {
        id: 'room-102',
        hostelId: 'hostel-1',
        hostelName: 'Ganga Boys Hostel',
        block: 'Block A',
        floor: 1,
        roomNumber: 'A-102',
        roomType: 'Double',
        capacity: 2,
        currentOccupancy: 2,
        facilities: ['High-speed Wi-Fi', 'Study Table', 'Cupboards', 'Ceiling Fan'],
        monthlyFee: 4500,
        status: 'fully_occupied',
      },
      {
        id: 'room-103',
        hostelId: 'hostel-1',
        hostelName: 'Ganga Boys Hostel',
        block: 'Block A',
        floor: 1,
        roomNumber: 'A-103',
        roomType: 'Single',
        capacity: 1,
        currentOccupancy: 0,
        facilities: ['AC', 'Attached Washroom', 'Wi-Fi', 'Ergonomic Chair'],
        monthlyFee: 7500,
        status: 'available',
      },
      {
        id: 'room-104',
        hostelId: 'hostel-1',
        hostelName: 'Ganga Boys Hostel',
        block: 'Block B',
        floor: 2,
        roomNumber: 'B-201',
        roomType: 'Triple',
        capacity: 3,
        currentOccupancy: 0,
        facilities: ['Balcony', 'Study Desks', 'Wi-Fi'],
        monthlyFee: 3800,
        status: 'maintenance',
      },
      {
        id: 'room-201',
        hostelId: 'hostel-2',
        hostelName: 'Yamuna Girls Hostel',
        block: 'Block A',
        floor: 2,
        roomNumber: 'YA-201',
        roomType: 'Double',
        capacity: 2,
        currentOccupancy: 2,
        facilities: ['Wi-Fi', 'Attached Washroom', 'Solar Geyser', 'Study Lamps'],
        monthlyFee: 5000,
        status: 'fully_occupied',
      },
      {
        id: 'room-202',
        hostelId: 'hostel-2',
        hostelName: 'Yamuna Girls Hostel',
        block: 'Block A',
        floor: 2,
        roomNumber: 'YA-202',
        roomType: 'Single',
        capacity: 1,
        currentOccupancy: 0,
        facilities: ['Attached Washroom', 'Wi-Fi', 'Geyser', 'Balcony'],
        monthlyFee: 7200,
        status: 'available',
      },
      {
        id: 'room-301',
        hostelId: 'hostel-3',
        hostelName: 'Kaveri PG & Research Hostel',
        block: 'Block C',
        floor: 3,
        roomNumber: 'KC-301',
        roomType: 'Four-Sharing',
        capacity: 4,
        currentOccupancy: 1,
        facilities: ['Wi-Fi', 'Library Access', 'Study Carrels'],
        monthlyFee: 3200,
        status: 'available',
      },
    ];

    // 4. Room Allocations
    this.allocations = [
      {
        id: 'alloc-1',
        roomId: 'room-101',
        roomNumber: 'A-101',
        hostelName: 'Ganga Boys Hostel',
        block: 'Block A',
        studentUserId: 'usr-stu-1',
        studentName: 'Aarav Sharma',
        studentRoll: 'CS202401',
        department: 'Computer Science & Engineering',
        bedNumber: 1,
        allocationDate: '2026-01-20',
        status: 'active',
        allocatedBy: 'Dr. Rajesh Verma',
      },
      {
        id: 'alloc-2',
        roomId: 'room-201',
        roomNumber: 'YA-201',
        hostelName: 'Yamuna Girls Hostel',
        block: 'Block A',
        studentUserId: 'usr-stu-2',
        studentName: 'Priya Patel',
        studentRoll: 'EC202445',
        department: 'Electronics & Communication',
        bedNumber: 1,
        allocationDate: '2026-01-21',
        status: 'active',
        allocatedBy: 'Prof. Sunita Rao',
      },
      {
        id: 'alloc-3',
        roomId: 'room-201',
        roomNumber: 'YA-201',
        hostelName: 'Yamuna Girls Hostel',
        block: 'Block A',
        studentUserId: 'usr-stu-4',
        studentName: 'Ananya Iyer',
        studentRoll: 'BT202488',
        department: 'Biotechnology',
        bedNumber: 2,
        allocationDate: '2026-01-22',
        status: 'active',
        allocatedBy: 'Prof. Sunita Rao',
      },
    ];

    // 5. Complaints
    this.complaints = [
      {
        id: 'cmp-1',
        complaintCode: 'CMP-1001',
        studentUserId: 'usr-stu-1',
        studentName: 'Aarav Sharma',
        studentRoll: 'CS202401',
        studentPhone: '+91 98111 22334',
        roomInfo: 'Ganga Boys Hostel, Room A-101',
        category: 'Electrical',
        title: 'Ceiling fan makes grinding noise and runs slow',
        description: 'The ceiling fan in A-101 started producing loud clicking and vibration sounds since yesterday night. It slows down intermittently.',
        priority: 'High',
        status: 'Assigned',
        assignedStaffId: 'usr-staff-1',
        assignedStaffName: 'Ramesh Kumar (Electrical)',
        submittedAt: '2026-10-09T09:15:00Z',
        history: [
          {
            id: 'h-1',
            complaintId: 'cmp-1',
            previousStatus: 'None',
            newStatus: 'Submitted',
            changedById: 'usr-stu-1',
            changedByName: 'Aarav Sharma',
            timestamp: '2026-10-09T09:15:00Z',
            notes: 'Ticket registered by student',
          },
          {
            id: 'h-2',
            complaintId: 'cmp-1',
            previousStatus: 'Submitted',
            newStatus: 'Assigned',
            changedById: 'usr-warden-1',
            changedByName: 'Dr. Rajesh Verma',
            timestamp: '2026-10-09T11:30:00Z',
            notes: 'Assigned to electrician Ramesh Kumar. Priority marked High.',
          },
        ],
      },
      {
        id: 'cmp-2',
        complaintCode: 'CMP-1002',
        studentUserId: 'usr-stu-2',
        studentName: 'Priya Patel',
        studentRoll: 'EC202445',
        studentPhone: '+91 98222 33445',
        roomInfo: 'Yamuna Girls Hostel, Room YA-201',
        category: 'Plumbing',
        title: 'Washroom tap leakage and low water pressure',
        description: 'The washroom washbasin tap has a steady continuous drip that does not turn off fully. Needs washer replacement.',
        priority: 'Medium',
        status: 'In Progress',
        assignedStaffId: 'usr-staff-2',
        assignedStaffName: 'Suresh Singh (Plumbing)',
        submittedAt: '2026-10-08T14:20:00Z',
        history: [
          {
            id: 'h-3',
            complaintId: 'cmp-2',
            previousStatus: 'None',
            newStatus: 'Submitted',
            changedById: 'usr-stu-2',
            changedByName: 'Priya Patel',
            timestamp: '2026-10-08T14:20:00Z',
            notes: 'Complaint submitted with photo description',
          },
          {
            id: 'h-4',
            complaintId: 'cmp-2',
            previousStatus: 'Submitted',
            newStatus: 'Assigned',
            changedById: 'usr-warden-1',
            changedByName: 'Dr. Rajesh Verma',
            timestamp: '2026-10-08T16:00:00Z',
            notes: 'Assigned to plumbing staff Suresh Singh',
          },
          {
            id: 'h-5',
            complaintId: 'cmp-2',
            previousStatus: 'Assigned',
            newStatus: 'In Progress',
            changedById: 'usr-staff-2',
            changedByName: 'Suresh Singh',
            timestamp: '2026-10-09T10:00:00Z',
            notes: 'Inspected tap fixture, procuring replacement valve',
          },
        ],
      },
      {
        id: 'cmp-3',
        complaintCode: 'CMP-1003',
        studentUserId: 'usr-stu-1',
        studentName: 'Aarav Sharma',
        studentRoll: 'CS202401',
        studentPhone: '+91 98111 22334',
        roomInfo: 'Ganga Boys Hostel, Room A-101',
        category: 'Internet / Wi-Fi',
        title: 'Frequent Wi-Fi disconnects on 1st Floor wing',
        description: 'Hostel access point AP-G-1A keeps restarting every 15 minutes during study hours.',
        priority: 'High',
        status: 'Resolved',
        assignedStaffId: 'usr-staff-1',
        assignedStaffName: 'Ramesh Kumar (Electrical/Tech)',
        submittedAt: '2026-10-05T18:00:00Z',
        resolvedAt: '2026-10-06T12:30:00Z',
        resolutionNotes: 'PoE power injector replaced and router firmware updated. Speeds verified at 95 Mbps.',
        history: [
          {
            id: 'h-6',
            complaintId: 'cmp-3',
            previousStatus: 'None',
            newStatus: 'Submitted',
            changedById: 'usr-stu-1',
            changedByName: 'Aarav Sharma',
            timestamp: '2026-10-05T18:00:00Z',
            notes: 'Wi-Fi failure logged',
          },
          {
            id: 'h-7',
            complaintId: 'cmp-3',
            previousStatus: 'Submitted',
            newStatus: 'Resolved',
            changedById: 'usr-staff-1',
            changedByName: 'Ramesh Kumar',
            timestamp: '2026-10-06T12:30:00Z',
            notes: 'Replaced PoE switch module and restored stable link',
          },
        ],
      },
    ];

    // 6. Visitors
    this.visitors = [
      {
        id: 'vis-1',
        visitorName: 'Manoj Sharma',
        phone: '+91 98111 99991',
        visitorType: 'Parent',
        studentUserId: 'usr-stu-1',
        studentName: 'Aarav Sharma',
        studentRoom: 'Ganga A-101',
        purpose: 'Dropping off winter clothes and academic books',
        expectedArrival: '2026-10-12T11:00:00Z',
        status: 'Approved',
        approvedBy: 'Dr. Rajesh Verma',
        createdAt: '2026-10-10T16:00:00Z',
      },
      {
        id: 'vis-2',
        visitorName: 'Kavita Patel',
        phone: '+91 98222 99992',
        visitorType: 'Parent',
        studentUserId: 'usr-stu-2',
        studentName: 'Priya Patel',
        studentRoom: 'Yamuna YA-201',
        purpose: 'Family visit during weekend',
        expectedArrival: '2026-10-11T14:00:00Z',
        actualCheckIn: '2026-10-11T14:15:00Z',
        actualCheckOut: '2026-10-11T17:30:00Z',
        status: 'Checked Out',
        approvedBy: 'Prof. Sunita Rao',
        createdAt: '2026-10-09T10:00:00Z',
      },
      {
        id: 'vis-3',
        visitorName: 'Deepak Verma',
        phone: '+91 98333 88881',
        visitorType: 'Friend',
        studentUserId: 'usr-stu-3',
        studentName: 'Rohit Verma',
        studentRoom: 'Hostel Reception',
        purpose: 'Group project discussion',
        expectedArrival: '2026-10-13T16:00:00Z',
        status: 'Pending',
        createdAt: '2026-10-11T20:00:00Z',
      },
    ];

    // 7. Notices
    this.notices = [
      {
        id: 'not-1',
        title: 'Scheduled Water Tank Cleaning & Maintenance',
        content: 'Please be informed that overhead water tanks for Ganga & Yamuna hostels will undergo sanitary cleaning on Saturday, Oct 17 between 10:00 AM and 03:00 PM. Water supply will be suspended during this window. Residents are advised to store necessary water in advance.',
        category: 'Maintenance',
        priority: 'High',
        targetAudience: 'All',
        authorName: 'Dr. Rajesh Verma (Chief Warden)',
        publishedAt: '2026-10-10T09:00:00Z',
        expiresAt: '2026-10-18T23:59:59Z',
        status: 'Published',
        isPinned: true,
      },
      {
        id: 'not-2',
        title: 'Mess Committee Meeting & Menu Revision Poll',
        content: 'All student wing representatives and interested residents are invited to the monthly Mess Committee review this Wednesday at 6:00 PM in the Central Dining Hall. Online poll for adding South Indian breakfast options is now active in the feedback section.',
        category: 'Mess',
        priority: 'Normal',
        targetAudience: 'Students',
        authorName: 'Mess Warden Committee',
        publishedAt: '2026-10-08T11:00:00Z',
        expiresAt: '2026-10-25T23:59:59Z',
        status: 'Published',
        isPinned: false,
      },
      {
        id: 'not-3',
        title: 'Curfew Timing Strict Adherence During Mid-Term Examinations',
        content: 'Hostel gates will close promptly at 10:30 PM. Late entry requests must be pre-approved with biometric pass from respective department coordinators.',
        category: 'Rules and Regulations',
        priority: 'Urgent',
        targetAudience: 'Students',
        authorName: 'Office of Student Affairs',
        publishedAt: '2026-10-06T15:00:00Z',
        expiresAt: '2026-10-30T23:59:59Z',
        status: 'Published',
        isPinned: false,
      },
    ];

    // 8. Mess Feedback
    this.messFeedbacks = [
      {
        id: 'fb-1',
        studentUserId: 'usr-stu-1',
        studentName: 'Aarav Sharma',
        mealType: 'Dinner',
        foodQuality: 4,
        taste: 4,
        cleanliness: 5,
        comments: 'Paneer butter masala and chapati were fresh and warm. Prompt serving staff.',
        date: '2026-10-10',
        createdAt: '2026-10-10T21:00:00Z',
      },
      {
        id: 'fb-2',
        studentUserId: 'usr-stu-2',
        studentName: 'Priya Patel',
        mealType: 'Breakfast',
        foodQuality: 3,
        taste: 3,
        cleanliness: 4,
        comments: 'Idli was good but sambar was overly spicy. Please maintain mild seasoning.',
        date: '2026-10-11',
        createdAt: '2026-10-11T09:30:00Z',
      },
      {
        id: 'fb-3',
        studentUserId: 'usr-stu-4',
        studentName: 'Ananya Iyer',
        mealType: 'Lunch',
        foodQuality: 5,
        taste: 5,
        cleanliness: 5,
        comments: 'Special Sunday feast with curd rice and dessert was outstanding!',
        date: '2026-10-11',
        createdAt: '2026-10-11T14:30:00Z',
      },
    ];

    // 9. Audit Logs
    this.auditLogs = [
      {
        id: 'log-1',
        action: 'ALLOCATION_CREATED',
        performedBy: 'Dr. Rajesh Verma',
        userRole: 'warden',
        details: 'Allocated student Aarav Sharma (CS202401) to Ganga Boys Hostel Room A-101 Bed 1',
        timestamp: '2026-01-20T10:00:00Z',
      },
      {
        id: 'log-2',
        action: 'COMPLAINT_ASSIGNED',
        performedBy: 'Dr. Rajesh Verma',
        userRole: 'warden',
        details: 'Assigned complaint CMP-1001 to Ramesh Kumar',
        timestamp: '2026-10-09T11:30:00Z',
      },
      {
        id: 'log-3',
        action: 'VISITOR_APPROVED',
        performedBy: 'Dr. Rajesh Verma',
        userRole: 'warden',
        details: 'Approved visitor Manoj Sharma for Aarav Sharma',
        timestamp: '2026-10-10T16:15:00Z',
      },
    ];
  }

  // --- Transactions & Helpers ---

  logAudit(action: string, performedBy: string, userRole: string, details: string) {
    this.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      performedBy,
      userRole,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Room allocation transaction
  allocateStudent(roomId: string, studentUserId: string, bedNumber: number, allocatedByName: string) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    if (room.status === 'maintenance' || room.status === 'inactive') {
      throw new Error(`Cannot allocate: Room is currently marked as ${room.status}`);
    }
    if (room.currentOccupancy >= room.capacity) {
      throw new Error(`Room ${room.roomNumber} is already at full capacity (${room.capacity}/${room.capacity})`);
    }

    const studentUser = this.users.find(u => u.id === studentUserId && u.role === 'student');
    if (!studentUser) {
      throw new Error('Student account not found');
    }

    const studentProfile = this.studentProfiles.find(sp => sp.userId === studentUserId);
    if (!studentProfile) {
      throw new Error('Student profile record not found');
    }

    // Check existing active allocation
    const existingAlloc = this.allocations.find(a => a.studentUserId === studentUserId && a.status === 'active');
    if (existingAlloc) {
      throw new Error(`Student ${studentUser.fullName} already has an active room allocation in ${existingAlloc.hostelName} (${existingAlloc.roomNumber})`);
    }

    // Check if bed number is taken in this room
    const bedTaken = this.allocations.some(a => a.roomId === roomId && a.bedNumber === bedNumber && a.status === 'active');
    if (bedTaken) {
      throw new Error(`Bed #${bedNumber} in Room ${room.roomNumber} is already occupied`);
    }

    // Transaction: Create allocation, update room occupancy, update student profile
    const allocationId = `alloc-${Date.now()}`;
    const newAllocation: RoomAllocation = {
      id: allocationId,
      roomId: room.id,
      roomNumber: room.roomNumber,
      hostelName: room.hostelName,
      block: room.block,
      studentUserId: studentUser.id,
      studentName: studentUser.fullName,
      studentRoll: studentProfile.studentId,
      department: studentProfile.department,
      bedNumber,
      allocationDate: new Date().toISOString().split('T')[0],
      status: 'active',
      allocatedBy: allocatedByName,
    };

    this.allocations.unshift(newAllocation);

    // Update room
    room.currentOccupancy += 1;
    if (room.currentOccupancy >= room.capacity) {
      room.status = 'fully_occupied';
    } else {
      room.status = 'available';
    }

    // Update student profile
    studentProfile.allocatedRoomId = room.id;
    studentProfile.allocatedBedNumber = bedNumber;

    this.logAudit(
      'ROOM_ALLOCATION',
      allocatedByName,
      'warden',
      `Allocated ${studentUser.fullName} (${studentProfile.studentId}) to ${room.hostelName} ${room.roomNumber} Bed ${bedNumber}`
    );

    return newAllocation;
  }

  // Vacate allocation transaction
  vacateAllocation(allocationId: string, vacatedByName: string) {
    const alloc = this.allocations.find(a => a.id === allocationId && a.status === 'active');
    if (!alloc) {
      throw new Error('Active allocation not found');
    }

    alloc.status = 'vacated';
    alloc.vacateDate = new Date().toISOString().split('T')[0];

    const room = this.rooms.find(r => r.id === alloc.roomId);
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
      if (room.status === 'fully_occupied' && room.currentOccupancy < room.capacity) {
        room.status = 'available';
      }
    }

    const studentProfile = this.studentProfiles.find(sp => sp.userId === alloc.studentUserId);
    if (studentProfile) {
      studentProfile.allocatedRoomId = undefined;
      studentProfile.allocatedBedNumber = undefined;
    }

    this.logAudit(
      'ROOM_VACATED',
      vacatedByName,
      'warden',
      `Vacated student ${alloc.studentName} from ${alloc.hostelName} ${alloc.roomNumber}`
    );

    return alloc;
  }
}

export const db = new DatabaseStore();
