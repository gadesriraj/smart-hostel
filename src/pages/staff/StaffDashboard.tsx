import React, { useEffect, useState } from 'react';
import { dashboardService, complaintService } from '../../services/api';
import { Complaint } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { Modal } from '../../components/common/Modal';
import {
  Wrench,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  Loader2,
  AlertCircle,
  HardHat,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Status Update Modal
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<'In Progress' | 'Resolved'>('In Progress');
  const [notes, setNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStaffDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenUpdate = (task: Complaint, defaultStatus: 'In Progress' | 'Resolved') => {
    setSelectedTask(task);
    setNewStatus(defaultStatus);
    setNotes('');
    setResolutionNotes(task.resolutionNotes || '');
    setError('');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (newStatus === 'Resolved' && !resolutionNotes) {
      setError('Please provide a resolution summary describing the repair completed.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await complaintService.updateStatus(selectedTask.id, {
        status: newStatus,
        notes: notes || `Work updated to ${newStatus}`,
        resolutionNotes: newStatus === 'Resolved' ? resolutionNotes : undefined,
      });
      setSelectedTask(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const { metrics, tasks } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Hostel Staff Work Desk</h2>
        <p className="text-xs text-slate-500">
          Manage delegated repair assignments, inspect room details, and log resolution reports
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Work Orders</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalAssigned}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned to your roster</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Acceptance</span>
          <p className="text-2xl font-bold text-amber-600 mt-2">{metrics.pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting start</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Work In Progress</span>
          <p className="text-2xl font-bold text-blue-600 mt-2">{metrics.inProgressCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Repairs underway</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Resolved Tasks</span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{metrics.resolvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Completed & verified</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Assigned Maintenance Tasks</h3>

        {tasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <HardHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-900">No pending maintenance jobs</h4>
            <p className="text-xs text-slate-500 mt-1">All assigned work orders have been completed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task: Complaint) => {
              const isResolved = task.status === 'Resolved';
              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border shadow-xs transition-all ${
                    isResolved
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-blue-200 ring-1 ring-blue-500/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {task.complaintCode}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {task.category}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <StatusBadge status={task.status} size="sm" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{task.description}</p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap gap-4 text-xs text-slate-600">
                    <span>
                      Location: <strong>{task.roomInfo}</strong>
                    </span>
                    <span>
                      Resident: <strong>{task.studentName}</strong> ({task.studentPhone})
                    </span>
                    <span>
                      Submitted: {new Date(task.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {task.resolutionNotes && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <strong>Resolution Log:</strong> {task.resolutionNotes}
                    </div>
                  )}

                  {!isResolved && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      {task.status === 'Assigned' && (
                        <button
                          onClick={() => handleOpenUpdate(task, 'In Progress')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Start Work
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenUpdate(task, 'Resolved')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Update Task */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={`Update Task: ${selectedTask?.complaintCode}`}
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Action</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              <option value="In Progress">In Progress (Work started)</option>
              <option value="Resolved">Resolved (Completed & Tested)</option>
            </select>
          </div>

          {newStatus === 'Resolved' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Summary *
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain what was fixed, components replaced, or tested..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technician Work Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Procured 40W LED fixture from central warehouse..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? 'Saving...' : 'Update Work Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
