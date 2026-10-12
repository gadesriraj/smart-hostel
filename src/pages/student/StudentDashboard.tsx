import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import {
  Building2,
  DoorOpen,
  Wrench,
  Users2,
  UtensilsCrossed,
  Bell,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const { allocation, room, roommates, stats, recentComplaints, recentNotices } = data;

  return (
    <div className="space-y-6">
      {/* Welcome & Allocated Room Feature Card */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full">
              Resident Student Dashboard
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
              {allocation ? `${allocation.hostelName}` : 'Hostel Allocation Pending'}
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              {allocation
                ? `You are assigned to ${allocation.block}, Room ${allocation.roomNumber} (Bed #${allocation.bedNumber}). Enjoy a productive academic stay.`
                : 'Your hostel registration is received. The Chief Warden is reviewing available beds for allocation.'}
            </p>
          </div>

          {allocation && (
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="text-center px-3 border-r border-white/20">
                <span className="text-[10px] text-blue-200 uppercase font-semibold block">Room</span>
                <span className="text-xl font-bold font-mono">{allocation.roomNumber}</span>
              </div>
              <div className="text-center px-3 border-r border-white/20">
                <span className="text-[10px] text-blue-200 uppercase font-semibold block">Bed</span>
                <span className="text-xl font-bold font-mono">#{allocation.bedNumber}</span>
              </div>
              <div className="text-center px-3">
                <span className="text-[10px] text-blue-200 uppercase font-semibold block">Sharing</span>
                <span className="text-base font-bold">{room?.roomType || 'Double'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Roommates Strip */}
        {roommates && roommates.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-blue-200">Roommates:</span>
            {roommates.map((rm: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-xl text-xs backdrop-blur-xs"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {rm.name} (Bed #{rm.bedNumber})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('complaints')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Lodge Complaint</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Report maintenance issue</p>
        </button>

        <button
          onClick={() => onNavigateTab('visitors')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Users2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Visitor Pass</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Pre-register family or guests</p>
        </button>

        <button
          onClick={() => onNavigateTab('mess')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Mess Rating</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Review food and cleanliness</p>
        </button>

        <button
          onClick={() => onNavigateTab('notices')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Bell className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Notice Board</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">{stats.unreadNoticesCount} active alerts</p>
        </button>
      </div>

      {/* Two columns: My Complaints & Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: My Complaints */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Maintenance Tickets</h3>
              <p className="text-xs text-slate-400">Status of your submitted maintenance requests</p>
            </div>
            <button
              onClick={() => onNavigateTab('complaints')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              You have not submitted any complaints yet. Everything in your room is running smoothly!
            </div>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-600">{c.complaintCode}</span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.description}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Category: {c.category}</span>
                    <span>
                      {c.assignedStaffName ? `Assigned to: ${c.assignedStaffName}` : 'Under Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Campus Notices */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Official Notices</h3>
              <p className="text-xs text-slate-400">Announcements from the Warden's Office</p>
            </div>
            <button
              onClick={() => onNavigateTab('notices')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              All Notices <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentNotices.map((n: any) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {n.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{n.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
