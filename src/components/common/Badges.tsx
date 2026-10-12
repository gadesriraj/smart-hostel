import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status?.toLowerCase() || '';

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['available', 'resolved', 'approved', 'checked out', 'published', 'active'].includes(s)) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['in progress', 'assigned', 'checked in', 'under review'].includes(s)) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['pending', 'submitted', 'on_leave'].includes(s)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['fully_occupied', 'maintenance', 'rejected', 'vacated', 'inactive', 'archived'].includes(s)) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${px} ${bg}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          bg.includes('emerald')
            ? 'bg-emerald-500'
            : bg.includes('blue')
            ? 'bg-blue-500'
            : bg.includes('amber')
            ? 'bg-amber-500'
            : bg.includes('rose')
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const p = priority?.toLowerCase() || '';
  let color = 'bg-slate-100 text-slate-700 border-slate-200';

  if (p === 'urgent') {
    color = 'bg-red-100 text-red-800 border-red-300 font-semibold animate-pulse';
  } else if (p === 'high') {
    color = 'bg-orange-100 text-orange-800 border-orange-200';
  } else if (p === 'medium') {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
  } else {
    color = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${color}`}>
      {priority}
    </span>
  );
};
