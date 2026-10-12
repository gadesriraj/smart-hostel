import React, { useEffect, useState } from 'react';
import { visitorService } from '../../services/api';
import { Visitor } from '../../types';
import { StatusBadge } from '../../components/common/Badges';
import {
  Users2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  LogIn,
  LogOut,
  Loader2,
  Calendar,
} from 'lucide-react';

export const VisitorManagement: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await visitorService.getVisitors();
      setVisitors(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    setActionLoading(id);
    try {
      await visitorService.updateStatus(id, newStatus);
      fetchVisitors();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = visitors.filter((v) => {
    if (statusFilter && v.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.visitorName.toLowerCase().includes(q) ||
        v.studentName.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.purpose.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Campus Visitor & Guest Management</h2>
        <p className="text-xs text-slate-500">
          Review resident pre-registered guests, authorize hostel access, and monitor campus arrival logs
        </p>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search visitor name, resident, or contact number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700"
        >
          <option value="">All Pass Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Checked In">Checked In (On Campus)</option>
          <option value="Checked Out">Checked Out</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No visitors found</h3>
          <p className="text-xs text-slate-500 mt-1">No guest passes match your search criteria.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Visitor Name</th>
                  <th className="py-3 px-4 font-semibold">Relation</th>
                  <th className="py-3 px-4 font-semibold">Resident Student</th>
                  <th className="py-3 px-4 font-semibold">Purpose</th>
                  <th className="py-3 px-4 font-semibold">Expected Arrival</th>
                  <th className="py-3 px-4 font-semibold">Pass Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{v.visitorName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{v.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {v.visitorType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{v.studentName}</p>
                      <p className="text-[11px] text-slate-400">{v.studentRoom}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {v.purpose}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(v.expectedArrival).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {v.status === 'Pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleStatusChange(v.id, 'Approved')}
                            disabled={actionLoading === v.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(v.id, 'Rejected')}
                            disabled={actionLoading === v.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {v.approvedBy ? `Reviewed by ${v.approvedBy}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
