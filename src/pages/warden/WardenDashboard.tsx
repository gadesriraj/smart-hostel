import React, { useEffect, useState } from 'react';
import { dashboardService, visitorService } from '../../services/api';
import { WardenDashboardData } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import {
  Users,
  Building,
  BedDouble,
  Wrench,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Loader2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface WardenDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const WardenDashboard: React.FC<WardenDashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<WardenDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await dashboardService.getWardenDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load warden dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVisitorStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    setActionLoading(id);
    try {
      await visitorService.updateStatus(id, status);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const { metrics, charts, tables } = data;

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Overdue Complaints exist */}
      {metrics.overdueComplaints > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Action Required: {metrics.overdueComplaints} Maintenance Ticket(s) Exceeded 48h SLA
              </h4>
              <p className="text-[11px] text-amber-700">
                Unresolved issues require review and escalation to department supervisors.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('complaints')}
            className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Review Tickets
          </button>
        </div>
      )}

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Residents</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</span>
            <span className="text-xs font-medium text-emerald-600">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified college students</p>
        </div>

        {/* Card 2: Bed Occupancy */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bed Occupancy</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.occupiedBeds} / {metrics.totalBedCapacity}
            </span>
            <span className="text-xs font-semibold text-blue-600">
              {metrics.occupancyPercentage}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.availableBeds} beds currently available
          </p>
        </div>

        {/* Card 3: Active Complaints */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Complaints</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.activeComplaints}</span>
            <span className="text-xs font-medium text-slate-500">
              Avg {metrics.avgResolutionHours}h SLA
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.overdueComplaints} ticket(s) overdue
          </p>
        </div>

        {/* Card 4: Visitors */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Visitor Passes</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.pendingVisitorRequests}</span>
            <span className="text-xs font-medium text-amber-600">Pending Review</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.activeVisitorsCheckedIn} visitors currently on campus
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Room Occupancy by Hostel */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bed Occupancy by Hostel</h3>
              <p className="text-xs text-slate-400">Occupied vs Available beds per campus wing</p>
            </div>
            <button
              onClick={() => onNavigateTab('rooms')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Allocate <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.occupancyByHostel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hostelName" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="occupied" name="Occupied Beds" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="available" name="Available Beds" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Complaints by Category */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaints by Category</h3>
              <p className="text-xs text-slate-400">Breakdown of reported maintenance concerns</p>
            </div>
            <button
              onClick={() => onNavigateTab('complaints')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={charts.complaintsByCategory}
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Tickets" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Complaints & Pending Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Recent Complaints */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Complaints</h3>
              <p className="text-xs text-slate-400">Latest issues submitted by residents</p>
            </div>
            <button
              onClick={() => onNavigateTab('complaints')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-3 font-medium">Ticket</th>
                  <th className="pb-3 font-medium">Category / Title</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tables.recentComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-mono font-semibold text-blue-600">{c.complaintCode}</td>
                    <td className="py-3 max-w-[160px] truncate">
                      <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                      <span className="text-[10px] text-slate-400">{c.category}</span>
                    </td>
                    <td className="py-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Pending Visitor Requests */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pending Visitor Approvals</h3>
              <p className="text-xs text-slate-400">Resident guest entry requests awaiting decision</p>
            </div>
            <button
              onClick={() => onNavigateTab('visitors')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              View All
            </button>
          </div>

          {tables.pendingVisitors.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No pending visitor requests at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {tables.pendingVisitors.map((vis) => (
                <div
                  key={vis.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{vis.visitorName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {vis.visitorType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Visiting <strong>{vis.studentName}</strong> ({vis.studentRoom})
                    </p>
                    <p className="text-[10px] text-slate-400">Purpose: {vis.purpose}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleVisitorStatus(vis.id, 'Approved')}
                      disabled={actionLoading === vis.id}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      title="Approve Visitor"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleVisitorStatus(vis.id, 'Rejected')}
                      disabled={actionLoading === vis.id}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                      title="Reject Visitor"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Audit Log */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">System Security & Audit Trail</h3>
        <div className="divide-y divide-slate-100">
          {tables.recentAudits.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800">{log.action}:</span>{' '}
                <span className="text-slate-600">{log.details}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                <span>By {log.performedBy}</span>
                <span>&bull;</span>
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
