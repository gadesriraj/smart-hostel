import React, { useEffect, useState } from 'react';
import { roomService, allocationService, studentService } from '../../services/api';
import { Room, Hostel, StudentListItem } from '../../types';
import { StatusBadge } from '../../components/common/Badges';
import { Modal } from '../../components/common/Modal';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  BedDouble,
  Wrench,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  DoorOpen,
} from 'lucide-react';

export const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);
  const [selectedRoomForAllocation, setSelectedRoomForAllocation] = useState<Room | null>(null);

  // Add Room form state
  const [newRoomData, setNewRoomData] = useState({
    hostelId: '',
    block: 'Block A',
    floor: 1,
    roomNumber: '',
    roomType: 'Double' as const,
    capacity: 2,
    monthlyFee: 4500,
    facilities: ['High-speed Wi-Fi', 'Study Table', 'Cupboards'],
  });

  // Allocate form state
  const [allocationData, setAllocationData] = useState({
    studentUserId: '',
    bedNumber: 1,
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rList, hList, sList] = await Promise.all([
        roomService.getRooms(),
        roomService.getHostels(),
        studentService.getStudents(),
      ]);
      setRooms(rList);
      setHostels(hList);
      setStudents(sList);
      if (hList.length > 0 && !newRoomData.hostelId) {
        setNewRoomData(prev => ({ ...prev, hostelId: hList[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedHostel && r.hostelId !== selectedHostel) return false;
    if (selectedStatus && r.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.roomNumber.toLowerCase().includes(q) ||
        r.hostelName.toLowerCase().includes(q) ||
        r.block.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!newRoomData.roomNumber) {
      setFormError('Please enter a room number');
      return;
    }

    setSubmitting(true);
    try {
      await roomService.createRoom(newRoomData);
      setFormSuccess('Room added successfully');
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAllocate = (room: Room) => {
    setSelectedRoomForAllocation(room);
    setFormError('');
    setFormSuccess('');
    // Auto pick next available bed number
    const occupiedBeds = room.occupants?.map(o => o.bedNumber) || [];
    let nextBed = 1;
    for (let i = 1; i <= room.capacity; i++) {
      if (!occupiedBeds.includes(i)) {
        nextBed = i;
        break;
      }
    }
    setAllocationData({ studentUserId: '', bedNumber: nextBed });
    setIsAllocateModalOpen(true);
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForAllocation || !allocationData.studentUserId) {
      setFormError('Please select a resident student');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await allocationService.allocateRoom({
        roomId: selectedRoomForAllocation.id,
        studentUserId: allocationData.studentUserId,
        bedNumber: Number(allocationData.bedNumber),
      });
      setFormSuccess('Student allocated successfully!');
      setIsAllocateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Allocation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewRoomDetails = async (roomId: string) => {
    try {
      const fullRoom = await roomService.getRoom(roomId);
      setSelectedRoomForDetails(fullRoom);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVacate = async (allocationId: string) => {
    if (!confirm('Are you sure you want to vacate this student? This updates occupancy.')) return;
    try {
      await allocationService.vacateRoom(allocationId);
      if (selectedRoomForDetails) {
        handleViewRoomDetails(selectedRoomForDetails.id);
      }
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Vacate failed');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room? This is permanent.')) return;
    try {
      await roomService.deleteRoom(roomId);
      setSelectedRoomForDetails(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Rooms & Bed Allocation</h2>
          <p className="text-xs text-slate-500">
            Real-time occupancy control, capacity enforcement, and student placement
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Room
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Room Number or Hostel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="fully_occupied">Fully Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Rooms Catalog Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No rooms found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new room.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const isFull = room.currentOccupancy >= room.capacity;
            const hasSpace = room.currentOccupancy < room.capacity && room.status === 'available';

            return (
              <div
                key={room.id}
                className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{room.roomNumber}</span>
                        <StatusBadge status={room.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {room.hostelName} &bull; {room.block} (Floor {room.floor})
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {room.roomType}
                    </span>
                  </div>

                  {/* Bed Occupancy Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                      <span>Occupancy</span>
                      <span>
                        {room.currentOccupancy} / {room.capacity} Beds
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-rose-500' : room.currentOccupancy > 0 ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                        style={{ width: `${(room.currentOccupancy / room.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Facilities list */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {room.facilities.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md"
                      >
                        {f}
                      </span>
                    ))}
                    {room.facilities.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5">
                        +{room.facilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewRoomDetails(room.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    View Occupants
                  </button>

                  {hasSpace && (
                    <button
                      onClick={() => handleOpenAllocate(room)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Allocate Bed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Room */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Hostel Room">
        <form onSubmit={handleCreateRoom} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Hostel *</label>
            <select
              value={newRoomData.hostelId}
              onChange={(e) => setNewRoomData({ ...newRoomData, hostelId: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Block *</label>
              <input
                type="text"
                required
                value={newRoomData.block}
                onChange={(e) => setNewRoomData({ ...newRoomData, block: e.target.value })}
                placeholder="Block A"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Floor *</label>
              <input
                type="number"
                min="0"
                max="10"
                required
                value={newRoomData.floor}
                onChange={(e) => setNewRoomData({ ...newRoomData, floor: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Room Number / Identifier *</label>
              <input
                type="text"
                required
                value={newRoomData.roomNumber}
                onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                placeholder="A-205"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Room Type</label>
              <select
                value={newRoomData.roomType}
                onChange={(e) => {
                  const t = e.target.value as any;
                  const caps: Record<string, number> = { Single: 1, Double: 2, Triple: 3, 'Four-Sharing': 4 };
                  setNewRoomData({ ...newRoomData, roomType: t, capacity: caps[t] || 2 });
                }}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="Single">Single (1 Bed)</option>
                <option value="Double">Double (2 Beds)</option>
                <option value="Triple">Triple (3 Beds)</option>
                <option value="Four-Sharing">Four-Sharing (4 Beds)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Monthly Fee (₹)</label>
            <input
              type="number"
              value={newRoomData.monthlyFee}
              onChange={(e) => setNewRoomData({ ...newRoomData, monthlyFee: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Allocate Student to Room */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title={`Allocate Student - Room ${selectedRoomForAllocation?.roomNumber}`}
      >
        <form onSubmit={handleAllocateSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 text-xs text-blue-800">
            <strong>{selectedRoomForAllocation?.hostelName}</strong> &bull; {selectedRoomForAllocation?.roomNumber}
            <br />
            Capacity: {selectedRoomForAllocation?.currentOccupancy} / {selectedRoomForAllocation?.capacity} Beds Occupied
          </div>

          {formError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Select Resident Student *</label>
            <select
              required
              value={allocationData.studentUserId}
              onChange={(e) => setAllocationData({ ...allocationData, studentUserId: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              <option value="">-- Choose unallocated student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id} disabled={Boolean(s.allocation)}>
                  {s.fullName} ({s.studentId}) {s.allocation ? `[Already in ${s.allocation.roomNumber}]` : '[Unallocated]'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Bed Number *</label>
            <select
              value={allocationData.bedNumber}
              onChange={(e) => setAllocationData({ ...allocationData, bedNumber: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              {Array.from({ length: selectedRoomForAllocation?.capacity || 2 }).map((_, idx) => {
                const bedNum = idx + 1;
                const isBedTaken = selectedRoomForAllocation?.occupants?.some(o => o.bedNumber === bedNum);
                return (
                  <option key={bedNum} value={bedNum} disabled={isBedTaken}>
                    Bed #{bedNum} {isBedTaken ? '(Occupied)' : '(Available)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAllocateModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-70"
            >
              {submitting ? 'Confirming...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Room Occupants & Details Drawer */}
      <Modal
        isOpen={Boolean(selectedRoomForDetails)}
        onClose={() => setSelectedRoomForDetails(null)}
        title={`Room Details: ${selectedRoomForDetails?.roomNumber}`}
        maxWidth="xl"
      >
        {selectedRoomForDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Hostel</span>
                <span className="font-bold text-slate-800">{selectedRoomForDetails.hostelName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Block & Floor</span>
                <span className="font-bold text-slate-800">
                  {selectedRoomForDetails.block}, Floor {selectedRoomForDetails.floor}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Type</span>
                <span className="font-bold text-slate-800">{selectedRoomForDetails.roomType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Monthly Fee</span>
                <span className="font-bold text-slate-800">₹{selectedRoomForDetails.monthlyFee}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Current Occupants</h4>
              {(!selectedRoomForDetails.occupants || selectedRoomForDetails.occupants.length === 0) ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No active occupants in this room.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedRoomForDetails.occupants.map((occ) => (
                    <div
                      key={occ.allocationId}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{occ.studentName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                            Bed #{occ.bedNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Roll: {occ.studentRoll} &bull; {occ.department}
                        </p>
                        <p className="text-[10px] text-slate-400">Allocated on: {occ.allocationDate}</p>
                      </div>

                      <button
                        onClick={() => handleVacate(occ.allocationId)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Vacate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDeleteRoom(selectedRoomForDetails.id)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Room
              </button>

              <button
                onClick={() => setSelectedRoomForDetails(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
