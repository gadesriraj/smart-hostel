import React, { useEffect, useState } from 'react';
import { studentService } from '../../services/api';
import { StatusBadge } from '../../components/common/Badges';
import {
  DoorOpen,
  BedDouble,
  Shield,
  Wifi,
  Users,
  CheckCircle2,
  PhoneCall,
  Loader2,
  FileCheck,
} from 'lucide-react';

export const StudentRoomView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentService.getMyProfile();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
      </div>
    );
  }

  const { allocation, room, roommates, profile, user } = data || {};

  if (!allocation || !room) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Room Allocation Pending</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Your hostel admission is registered under Student ID <strong>{profile?.studentId}</strong>.
          The hostel administration has not assigned a room yet. Please check back shortly or visit the Warden Office.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">My Room & Accommodation Details</h2>
        <p className="text-xs text-slate-500">
          Personal room assignment, amenities, roommate information, and residential rules
        </p>
      </div>

      {/* Main Room Card */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900">Room {allocation.roomNumber}</span>
              <StatusBadge status={room.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {allocation.hostelName} &bull; {allocation.block}, Floor {room.floor}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Your Allocated Bed</span>
              <span className="font-bold text-base text-blue-600">Bed #{allocation.bedNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Room Type</span>
              <span className="font-bold text-slate-800">{room.roomType}</span>
            </div>
          </div>
        </div>

        {/* Room Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block">Total Capacity</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{room.capacity} Residents</span>
          </div>
          <div>
            <span className="text-slate-400 block">Current Occupancy</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{room.currentOccupancy} Occupants</span>
          </div>
          <div>
            <span className="text-slate-400 block">Allocation Date</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{allocation.allocationDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Authorized By</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{allocation.allocatedBy}</span>
          </div>
        </div>

        {/* Facilities Checklist */}
        <div className="pt-6">
          <h4 className="text-xs font-bold text-slate-900 mb-3">Room Amenities & Inclusions</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {room.facilities?.map((f: string, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roommates Card */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Current Roommates</h3>
        {roommates.length === 0 ? (
          <p className="text-xs text-slate-400">You are currently the sole occupant in this room.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roommates.map((rm: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rm.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rm.department}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Roll: {rm.roll}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                  Bed #{rm.bedNumber}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Residential Rules & Guidelines */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Hostel Resident Guidelines</h3>
        </div>
        <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
          <li>Curfew hours: Main gates close strictly at 10:30 PM on weekdays.</li>
          <li>All maintenance concerns must be logged through the platform rather than verbal requests.</li>
          <li>Visitors are permitted in common lounges only between 10:00 AM and 07:00 PM.</li>
          <li>High-wattage appliances (e.g., room heaters, induction plates) require prior warden approval.</li>
        </ul>
      </div>
    </div>
  );
};
