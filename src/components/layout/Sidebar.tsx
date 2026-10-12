import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  LayoutDashboard,
  DoorOpen,
  Wrench,
  Users2,
  Bell,
  UtensilsCrossed,
  FileBarChart,
  HardHat,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
}) => {
  const { user } = useAuth();

  // Navigation Items per Role
  const getNavItems = () => {
    if (user?.role === 'warden') {
      return [
        { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'rooms', label: 'Rooms & Allocation', icon: DoorOpen },
        { id: 'complaints', label: 'Complaints Center', icon: Wrench },
        { id: 'visitors', label: 'Visitor Logs', icon: Users2 },
        { id: 'notices', label: 'Digital Notices', icon: Bell },
        { id: 'mess', label: 'Mess Feedback', icon: UtensilsCrossed },
        { id: 'staff', label: 'Staff Management', icon: HardHat },
        { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart },
      ];
    }

    if (user?.role === 'staff') {
      return [
        { id: 'dashboard', label: 'Assigned Work Tasks', icon: Wrench },
        { id: 'visitors', label: 'Gate Visitor Desk', icon: UserCheck },
        { id: 'notices', label: 'Campus Notices', icon: Bell },
      ];
    }

    // Student navigation
    return [
      { id: 'dashboard', label: 'My Student Portal', icon: LayoutDashboard },
      { id: 'room', label: 'Room & Roommates', icon: DoorOpen },
      { id: 'complaints', label: 'Lodge Complaint', icon: Wrench },
      { id: 'visitors', label: 'Visitor Pass Request', icon: Users2 },
      { id: 'mess', label: 'Mess Feedback Rating', icon: UtensilsCrossed },
      { id: 'notices', label: 'Hostel Notice Board', icon: Bell },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">SmartHostel</h2>
              <span className="text-[10px] font-medium text-blue-400">Management Suite</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card Badge */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-800/80 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.avatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'User')}`
              }
              alt=""
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-blue-500/30"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wide">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Secure System</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v2.4 LTS</span>
        </div>
      </aside>
    </>
  );
};
