import React, { useEffect, useState } from 'react';
import { complaintService, staffService } from '../../services/api';
import { Complaint, StaffUser } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { Modal } from '../../components/common/Modal';
import {
  Wrench,
  Search,
  Filter,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserPlus,
  Loader2,
  ChevronRight,
} from 'lucide-react';

export const ComplaintsManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState({
    staffId: '',
    priority: 'Medium',
    notes: '',
  });

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusData, setStatusData] = useState({
    status: 'In Progress',
    notes: '',
    resolutionNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const [cRes, sRes] = await Promise.all([
        complaintService.getComplaints(),
        staffService.getStaff(),
      ]);
      setComplaints(cRes);
      setStaffList(sRes);
      if (sRes.length > 0 && !assignData.staffId) {
        setAssignData(prev => ({ ...prev, staffId: sRes[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter((c) => {
    if (category && c.category !== category) return false;
    if (priority && c.priority !== priority) return false;
    if (status && c.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.complaintCode.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.roomInfo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAssign = (c: Complaint) => {
    setSelectedComplaint(c);
    setAssignData({
      staffId: staffList[0]?.id || '',
      priority: c.priority,
      notes: '',
    });
    setActionError('');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !assignData.staffId) return;

    setSubmitting(true);
    setActionError('');
    try {
      await complaintService.assignComplaint(selectedComplaint.id, assignData);
      setIsAssignModalOpen(false);
      fetchComplaints();
    } catch (err: any) {
      setActionError(err.message || 'Failed to assign complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatus = (c: Complaint) => {
    setSelectedComplaint(c);
    setStatusData({
      status: c.status,
      notes: '',
      resolutionNotes: '',
    });
    setActionError('');
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    setActionError('');
    try {
      await complaintService.updateStatus(selectedComplaint.id, statusData);
      setIsStatusModalOpen(false);
      fetchComplaints();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Maintenance Complaints Center</h2>
        <p className="text-xs text-slate-500">
          Review reported resident grievances, assign maintenance staff, and enforce repair SLAs
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Ticket ID, Resident, Room or Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Furniture">Furniture</option>
            <option value="Internet / Wi-Fi">Internet / Wi-Fi</option>
            <option value="Bathroom">Bathroom</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No complaints matching filter</h3>
          <p className="text-xs text-slate-500 mt-1">All maintenance issues have been resolved.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Ticket Code</th>
                  <th className="py-3 px-4 font-semibold">Resident & Room</th>
                  <th className="py-3 px-4 font-semibold">Category / Title</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Assigned Staff</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {c.complaintCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{c.studentName}</p>
                      <p className="text-[11px] text-slate-400">{c.roomInfo}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-slate-800 line-clamp-1">{c.title}</p>
                      <span className="text-[10px] text-slate-400">{c.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.assignedStaffName || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenAssign(c)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handleOpenStatus(c)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="View History Timeline"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Assign Staff */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Maintenance Staff: ${selectedComplaint?.complaintCode}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {actionError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              {actionError}
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
            <strong>{selectedComplaint?.title}</strong>
            <p className="mt-1 text-slate-500">{selectedComplaint?.description}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Assign Technician *</label>
            <select
              value={assignData.staffId}
              onChange={(e) => setAssignData({ ...assignData, staffId: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.department.toUpperCase()}) &bull; Active Tasks: {s.activeTaskCount}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Priority Tier</label>
            <select
              value={assignData.priority}
              onChange={(e) => setAssignData({ ...assignData, priority: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent (SLA 4h)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Work Dispatch Instructions</label>
            <textarea
              rows={2}
              value={assignData.notes}
              onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
              placeholder="e.g. Please carry replacement fan capacitor and ladder..."
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? 'Dispatching...' : 'Dispatch Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Update Status / Resolution */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Ticket Status: ${selectedComplaint?.complaintCode}`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          {actionError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              {actionError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">New Status *</label>
            <select
              value={statusData.status}
              onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved (Complete)</option>
              <option value="Rejected">Rejected (Invalid/Duplicate)</option>
            </select>
          </div>

          {statusData.status === 'Resolved' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700">Resolution Summary *</label>
              <textarea
                required
                rows={2}
                value={statusData.resolutionNotes}
                onChange={(e) => setStatusData({ ...statusData, resolutionNotes: e.target.value })}
                placeholder="Detail what was fixed, parts replaced, or tested..."
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Status Update Notes</label>
            <textarea
              rows={2}
              value={statusData.notes}
              onChange={(e) => setStatusData({ ...statusData, notes: e.target.value })}
              placeholder="Internal tracking notes..."
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Full Ticket & History Timeline */}
      <Modal
        isOpen={Boolean(selectedComplaint && !isAssignModalOpen && !isStatusModalOpen)}
        onClose={() => setSelectedComplaint(null)}
        title={`Audit Timeline: ${selectedComplaint?.complaintCode}`}
        maxWidth="xl"
      >
        {selectedComplaint && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{selectedComplaint.title}</span>
                <StatusBadge status={selectedComplaint.status} size="sm" />
              </div>
              <p className="text-xs text-slate-600 mt-2">{selectedComplaint.description}</p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>Resident: <strong>{selectedComplaint.studentName}</strong></span>
                <span>Room: <strong>{selectedComplaint.roomInfo}</strong></span>
                <span>Contact: <strong>{selectedComplaint.studentPhone}</strong></span>
              </div>
            </div>

            {selectedComplaint.resolutionNotes && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <strong>Resolution Note:</strong> {selectedComplaint.resolutionNotes}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-3">Status Progression Timeline</h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {selectedComplaint.history?.map((h) => (
                  <div key={h.id} className="relative flex items-start gap-3 pl-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white shrink-0 mt-0.5" />
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Status: {h.newStatus}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">{h.notes}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Logged by: {h.changedByName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
