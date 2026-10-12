import React, { useEffect, useState } from 'react';
import { noticeService } from '../../services/api';
import { Notice } from '../../types';
import { PriorityBadge } from '../../components/common/Badges';
import { Bell, Pin, Search, Filter, Loader2 } from 'lucide-react';

export const StudentNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const res = await noticeService.getNotices();
        setNotices(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const filtered = notices.filter((n) => {
    if (category && n.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Hostel Digital Notice Board</h2>
        <p className="text-xs text-slate-500">
          Official announcements, exam curfews, utility maintenance schedules, and mess meetings
        </p>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search announcement keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700"
        >
          <option value="">All Categories</option>
          <option value="General">General</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Mess">Mess Committee</option>
          <option value="Events">Campus Events</option>
          <option value="Emergency">Emergency</option>
          <option value="Rules and Regulations">Rules & Regulations</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No announcements match search</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
                n.isPinned
                  ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-300/30'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {n.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {n.category}
                  </span>
                  <PriorityBadge priority={n.priority} />
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{n.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {n.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {n.authorName}</span>
                <span>
                  {new Date(n.publishedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
