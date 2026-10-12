import React, { useEffect, useState } from 'react';
import { staffService, roomService } from '../../services/api';
import { StaffUser, Hostel } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  HardHat,
  Plus,
  Mail,
  Phone,
  Wrench,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'electrical',
    assignedHostelId: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const [sRes, hRes] = await Promise.all([
        staffService.getStaff(),
        roomService.getHostels(),
      ]);
      setStaffList(sRes);
      setHostels(hRes);
      if (hRes.length > 0 && !formData.assignedHostelId) {
        setFormData(prev => ({ ...prev, assignedHostelId: hRes[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      setError('Please provide full name and email address');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await staffService.addStaff(formData);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        department: 'electrical',
        assignedHostelId: hostels[0]?.id || '',
      });
      fetchStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to add staff');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hostel Staff & Maintenance Personnel</h2>
          <p className="text-xs text-slate-500">
            Workforce roster, active work delegation, task completion statistics, and technician directory
          </p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : staffList.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <HardHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No staff members configured</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={
                      s.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.fullName)}`
                    }
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{s.fullName}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {s.department}
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {s.staffId}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </div>
                </div>
              </div>

              {/* Workload stats */}
              <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
                  <span className="text-[10px] font-semibold text-amber-800 block">Active Tasks</span>
                  <span className="text-base font-bold text-amber-900">{s.activeTaskCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] font-semibold text-emerald-800 block">Completed</span>
                  <span className="text-base font-bold text-emerald-900">{s.completedTaskCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Staff */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Hostel Staff">
        <form onSubmit={handleAddStaff} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Staff Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Anand Murthy"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@campus.edu"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98000 00000"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Department / Trade</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="electrical">Electrical Maintenance</option>
                <option value="plumbing">Plumbing & Sanitation</option>
                <option value="cleaning">Housekeeping & Cleaning</option>
                <option value="wifi">Network / Wi-Fi</option>
                <option value="carpentry">Carpentry & Furniture</option>
                <option value="general">General Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Primary Hostel</label>
              <select
                value={formData.assignedHostelId}
                onChange={(e) => setFormData({ ...formData, assignedHostelId: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? 'Creating...' : 'Register Staff'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
