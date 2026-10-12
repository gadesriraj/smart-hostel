import React, { useState, useEffect } from 'react';
import { roomService, complaintService, visitorService, feedbackService, reportService } from '../../services/api';
import { Room, Complaint, Visitor, MessFeedback } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import {
  FileBarChart,
  Download,
  Printer,
  Table,
  CheckCircle2,
  Clock,
  Loader2,
  Building2,
  Wrench,
  Users2,
  UtensilsCrossed,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'occupancy' | 'complaints' | 'visitors' | 'feedback'>('occupancy');
  const [loading, setLoading] = useState(true);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [feedbacks, setFeedbacks] = useState<MessFeedback[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [rList, cList, vList, fList] = await Promise.all([
          roomService.getRooms(),
          complaintService.getComplaints(),
          visitorService.getVisitors(),
          feedbackService.getFeedback(),
        ]);
        setRooms(rList);
        setComplaints(cList);
        setVisitors(vList);
        setFeedbacks(fList.list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleDownloadCsv = () => {
    reportService.downloadCsv(activeReport);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Institutional Reports & Audit Data</h2>
          <p className="text-xs text-slate-500">
            Generate printable audit logs and export database records directly to standard CSV format
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print View
          </button>
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveReport('occupancy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeReport === 'occupancy'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Room Occupancy ({rooms.length})
        </button>

        <button
          onClick={() => setActiveReport('complaints')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeReport === 'complaints'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Complaints & SLA ({complaints.length})
        </button>

        <button
          onClick={() => setActiveReport('visitors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeReport === 'visitors'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users2 className="w-4 h-4" />
          Visitor Passes ({visitors.length})
        </button>

        <button
          onClick={() => setActiveReport('feedback')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeReport === 'feedback'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Mess Satisfaction ({feedbacks.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Tab 1: Occupancy Report */}
          {activeReport === 'occupancy' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Hostel Wing</th>
                    <th className="py-3 px-4">Block & Floor</th>
                    <th className="py-3 px-4">Room Number</th>
                    <th className="py-3 px-4">Room Type</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Occupied</th>
                    <th className="py-3 px-4">Available</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((r) => {
                    const avail = Math.max(0, r.capacity - r.currentOccupancy);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-800">{r.hostelName}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {r.block}, Floor {r.floor}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.roomNumber}</td>
                        <td className="py-3 px-4">{r.roomType}</td>
                        <td className="py-3 px-4">{r.capacity}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{r.currentOccupancy}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{avail}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={r.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Complaints Report */}
          {activeReport === 'complaints' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Room Info</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4">Resolution Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.complaintCode}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{c.studentName}</td>
                      <td className="py-3 px-4 text-slate-500">{c.roomInfo}</td>
                      <td className="py-3 px-4">{c.category}</td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-600">{c.assignedStaffName || 'Unassigned'}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {c.resolutionNotes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Visitors Report */}
          {activeReport === 'visitors' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Visitor Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Relation</th>
                    <th className="py-3 px-4">Host Student</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Expected Arrival</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{v.visitorName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{v.phone}</td>
                      <td className="py-3 px-4">{v.visitorType}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{v.studentName}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{v.purpose}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(v.expectedArrival).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={v.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 4: Mess Feedback Report */}
          {activeReport === 'feedback' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Resident</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Meal Type</th>
                    <th className="py-3 px-4">Quality (1-5)</th>
                    <th className="py-3 px-4">Taste (1-5)</th>
                    <th className="py-3 px-4">Cleanliness (1-5)</th>
                    <th className="py-3 px-4">Resident Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feedbacks.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{f.studentName}</td>
                      <td className="py-3 px-4 text-slate-500">{f.date}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{f.mealType}</td>
                      <td className="py-3 px-4 font-bold">{f.foodQuality} ★</td>
                      <td className="py-3 px-4 font-bold">{f.taste} ★</td>
                      <td className="py-3 px-4 font-bold">{f.cleanliness} ★</td>
                      <td className="py-3 px-4 text-slate-600 max-w-md truncate">{f.comments || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
