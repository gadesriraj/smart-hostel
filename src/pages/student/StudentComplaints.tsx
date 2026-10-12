import React, { useEffect, useState } from 'react';
import { complaintService } from '../../services/api';
import { Complaint } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { Modal } from '../../components/common/Modal';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const StudentComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electrical',
    priority: 'Medium',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaints();
      setComplaints(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Please provide ticket title and detailed description');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await complaintService.createComplaint(formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'Electrical',
        priority: 'Medium',
        description: '',
      });
      fetchComplaints();
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Maintenance Complaint Tracking</h2>
          <p className="text-xs text-slate-500">
            Submit hostel maintenance requests and track technician assignment and resolution in real time
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
          Lodge Maintenance Complaint
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No complaints registered</h3>
          <p className="text-xs text-slate-500 mt-1">If anything requires repair or cleaning, click the button above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{c.complaintCode}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {c.category}
                  </span>
                  <PriorityBadge priority={c.priority} />
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} size="sm" />
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{c.description}</p>

              {/* Status Tracker Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-slate-400 text-[11px]">Assigned Staff:</span>
                  <span className="font-semibold text-slate-800">
                    {c.assignedStaffName || 'Pending Warden Assignment'}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedTicket(c)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  View Status History <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {c.resolutionNotes && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <strong>Resolution Details:</strong> {c.resolutionNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Lodge Complaint */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lodge Maintenance Complaint">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Issue Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Washroom tap continuous leakage"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Cleaning">Cleaning & Housekeeping</option>
                <option value="Furniture">Furniture & Carpentry</option>
                <option value="Internet / Wi-Fi">Internet / Wi-Fi</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Urgency Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="Low">Low (Convenience)</option>
                <option value="Medium">Medium (Normal)</option>
                <option value="High">High (Impacting studies)</option>
                <option value="Urgent">Urgent (Safety/Hazard)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Description of the Problem *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide exact details (e.g. which fixture, switch, or faucet is damaged)..."
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
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
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Status Progression Drawer */}
      <Modal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={`Status History: ${selectedTicket?.complaintCode}`}
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800">
              <h4 className="font-bold">{selectedTicket.title}</h4>
              <p className="text-slate-500 mt-1">{selectedTicket.description}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-3">Ticket Lifecycle</h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {selectedTicket.history?.map((h) => (
                  <div key={h.id} className="relative flex items-start gap-3 pl-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white shrink-0 mt-0.5" />
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{h.newStatus}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">{h.notes}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">By: {h.changedByName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700"
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
