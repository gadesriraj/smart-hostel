import React, { useEffect, useState } from 'react';
import { visitorService } from '../../services/api';
import { Visitor } from '../../types';
import { StatusBadge } from '../../components/common/Badges';
import {
  UserCheck,
  Search,
  LogIn,
  LogOut,
  Clock,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const StaffVisitorDesk: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  const handleCheckIn = async (id: string) => {
    setActionLoading(id);
    try {
      await visitorService.checkIn(id);
      fetchVisitors();
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (id: string) => {
    setActionLoading(id);
    try {
      await visitorService.checkOut(id);
      fetchVisitors();
    } catch (err: any) {
      alert(err.message || 'Check-out failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = visitors.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        v.visitorName.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.studentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Hostel Security Gate Desk</h2>
        <p className="text-xs text-slate-500">
          Verify approved guest credentials, record entry checkpoints, and manage departure timestamps
        </p>
      </div>

      {/* Search Input */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Visitor Name, Phone, or Resident Student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-900 border-none outline-hidden"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No visitors found</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{v.visitorName}</span>
                  <StatusBadge status={v.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 font-mono">Mobile: {v.phone}</p>
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <p>
                    Visiting: <strong>{v.studentName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Location: {v.studentRoom}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Purpose: {v.purpose}</p>
                </div>
              </div>

              {/* Gate Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {v.actualCheckIn ? `In: ${new Date(v.actualCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not checked in'}
                </span>

                {v.status === 'Approved' && (
                  <button
                    onClick={() => handleCheckIn(v.id)}
                    disabled={actionLoading === v.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Check In
                  </button>
                )}

                {v.status === 'Checked In' && (
                  <button
                    onClick={() => handleCheckOut(v.id)}
                    disabled={actionLoading === v.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Check Out
                  </button>
                )}

                {v.status === 'Checked Out' && (
                  <span className="text-xs font-bold text-slate-400">Departed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
