import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  GraduationCap,
  Wrench,
  ChevronDown,
  Menu,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTabTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeTabTitle }) => {
  const { user, logout, quickLoginAs } = useAuth();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Water Tank Cleaning Notice', time: '10 mins ago', unread: true },
    { id: 2, title: 'Complaint CMP-1001 assigned to staff', time: '1 hour ago', unread: true },
    { id: 3, title: 'Visitor request approved by Warden', time: '3 hours ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
            {activeTabTitle || 'Smart Hostel Management'}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Campus Residential Portal &bull; Academic Year 2026-27
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Role Switcher for Testing/Demonstration */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
          <span className="px-2 text-slate-500 text-[11px]">Demo Role:</span>
          <button
            onClick={() => quickLoginAs('warden')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              user?.role === 'warden'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Warden
          </button>
          <button
            onClick={() => quickLoginAs('student')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              user?.role === 'student'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Student
          </button>
          <button
            onClick={() => quickLoginAs('staff')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              user?.role === 'staff'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Staff
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-3 shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Campus Alerts</span>
                <span className="text-[11px] text-blue-600 font-medium cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition-colors"
          >
            <img
              src={
                user?.avatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'User')}`
              }
              alt={user?.fullName}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.fullName?.split(' ')[0]}
              </p>
              <p className="text-[10px] capitalize text-blue-600 font-medium">
                {user?.role}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {profileDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Role: {user?.role}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
