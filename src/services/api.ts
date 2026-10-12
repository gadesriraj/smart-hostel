import axios from 'axios';
import {
  User,
  StudentProfile,
  Room,
  RoomAllocation,
  Complaint,
  Visitor,
  Notice,
  MessFeedback,
  StaffUser,
  StudentListItem,
  WardenDashboardData,
  Hostel,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hostel_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for clear errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User; profile: any; message: string }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('hostel_token', res.data.token);
    return res.data;
  },

  register: async (payload: {
    fullName: string;
    studentId: string;
    email: string;
    phone: string;
    department: string;
    yearOfStudy: number;
    gender: string;
    emergencyContact?: string;
    password: string;
  }) => {
    const res = await api.post<{ token: string; user: User; profile: StudentProfile; message: string }>(
      '/auth/register',
      payload
    );
    localStorage.setItem('hostel_token', res.data.token);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<{ user: User; profile: any; roomDetails: Room | null }>('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('hostel_token');
    return api.post('/auth/logout');
  },
};

export const roomService = {
  getHostels: async () => {
    const res = await api.get<Hostel[]>('/hostels');
    return res.data;
  },

  getRooms: async (params?: { hostelId?: string; block?: string; floor?: number | string; status?: string; search?: string }) => {
    const res = await api.get<Room[]>('/rooms', { params });
    return res.data;
  },

  getRoom: async (id: string) => {
    const res = await api.get<Room>(`/rooms/${id}`);
    return res.data;
  },

  createRoom: async (payload: Partial<Room>) => {
    const res = await api.post<Room>('/rooms', payload);
    return res.data;
  },

  updateRoom: async (id: string, payload: Partial<Room>) => {
    const res = await api.patch<Room>(`/rooms/${id}`, payload);
    return res.data;
  },

  deleteRoom: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/rooms/${id}`);
    return res.data;
  },
};

export const allocationService = {
  getAllocations: async (params?: { status?: string; roomId?: string; studentId?: string }) => {
    const res = await api.get<RoomAllocation[]>('/allocations', { params });
    return res.data;
  },

  allocateRoom: async (payload: { roomId: string; studentUserId: string; bedNumber: number }) => {
    const res = await api.post<RoomAllocation>('/allocations', payload);
    return res.data;
  },

  vacateRoom: async (allocationId: string) => {
    const res = await api.post<{ message: string; allocation: RoomAllocation }>(`/allocations/${allocationId}/vacate`);
    return res.data;
  },
};

export const studentService = {
  getStudents: async (params?: { search?: string; unallocatedOnly?: string }) => {
    const res = await api.get<StudentListItem[]>('/students', { params });
    return res.data;
  },

  getMyProfile: async () => {
    const res = await api.get<{
      user: User;
      profile: StudentProfile;
      allocation: RoomAllocation | null;
      room: Room | null;
      roommates: Array<{ name: string; roll: string; department: string; bedNumber: number }>;
    }>('/students/me');
    return res.data;
  },
};

export const complaintService = {
  getComplaints: async (params?: { category?: string; priority?: string; status?: string; search?: string }) => {
    const res = await api.get<Complaint[]>('/complaints', { params });
    return res.data;
  },

  getComplaint: async (id: string) => {
    const res = await api.get<Complaint>(`/complaints/${id}`);
    return res.data;
  },

  createComplaint: async (payload: {
    title: string;
    category: string;
    description: string;
    priority?: string;
    imageUrl?: string;
  }) => {
    const res = await api.post<Complaint>('/complaints', payload);
    return res.data;
  },

  assignComplaint: async (id: string, payload: { staffId: string; priority?: string; notes?: string }) => {
    const res = await api.post<Complaint>(`/complaints/${id}/assign`, payload);
    return res.data;
  },

  updateStatus: async (
    id: string,
    payload: { status: string; notes?: string; resolutionNotes?: string }
  ) => {
    const res = await api.post<Complaint>(`/complaints/${id}/status`, payload);
    return res.data;
  },
};

export const visitorService = {
  getVisitors: async (params?: { status?: string; search?: string }) => {
    const res = await api.get<Visitor[]>('/visitors', { params });
    return res.data;
  },

  registerVisitor: async (payload: {
    visitorName: string;
    phone: string;
    visitorType: string;
    purpose: string;
    expectedArrival: string;
  }) => {
    const res = await api.post<Visitor>('/visitors', payload);
    return res.data;
  },

  updateStatus: async (id: string, status: 'Approved' | 'Rejected') => {
    const res = await api.patch<Visitor>(`/visitors/${id}/status`, { status });
    return res.data;
  },

  checkIn: async (id: string) => {
    const res = await api.post<Visitor>(`/visitors/${id}/check-in`);
    return res.data;
  },

  checkOut: async (id: string) => {
    const res = await api.post<Visitor>(`/visitors/${id}/check-out`);
    return res.data;
  },
};

export const noticeService = {
  getNotices: async () => {
    const res = await api.get<Notice[]>('/notices');
    return res.data;
  },

  createNotice: async (payload: Partial<Notice>) => {
    const res = await api.post<Notice>('/notices', payload);
    return res.data;
  },

  updateNotice: async (id: string, payload: Partial<Notice>) => {
    const res = await api.patch<Notice>(`/notices/${id}`, payload);
    return res.data;
  },

  deleteNotice: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/notices/${id}`);
    return res.data;
  },
};

export const feedbackService = {
  getFeedback: async (params?: { mealType?: string; date?: string }) => {
    const res = await api.get<{
      list: MessFeedback[];
      stats?: { totalSubmissions: number; averageQuality: number; averageTaste: number; averageCleanliness: number };
    }>('/feedback', { params });
    return res.data;
  },

  submitFeedback: async (payload: {
    mealType: string;
    foodQuality: number;
    taste: number;
    cleanliness: number;
    comments?: string;
    date?: string;
  }) => {
    const res = await api.post<MessFeedback>('/feedback', payload);
    return res.data;
  },
};

export const staffService = {
  getStaff: async () => {
    const res = await api.get<StaffUser[]>('/staff');
    return res.data;
  },

  addStaff: async (payload: {
    fullName: string;
    email: string;
    phone: string;
    department: string;
    assignedHostelId: string;
    password?: string;
  }) => {
    const res = await api.post<StaffUser>('/staff', payload);
    return res.data;
  },
};

export const dashboardService = {
  getWardenDashboard: async () => {
    const res = await api.get<WardenDashboardData>('/dashboard/warden');
    return res.data;
  },

  getStudentDashboard: async () => {
    const res = await api.get<any>('/dashboard/student');
    return res.data;
  },

  getStaffDashboard: async () => {
    const res = await api.get<any>('/dashboard/staff');
    return res.data;
  },
};

export const reportService = {
  downloadCsv: (type: 'occupancy' | 'complaints' | 'visitors' | 'feedback') => {
    const token = localStorage.getItem('hostel_token') || '';
    window.open(`/api/reports/csv?type=${type}`, '_blank');
  },
};

export default api;
