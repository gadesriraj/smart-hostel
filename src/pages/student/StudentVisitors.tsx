import React, { useEffect, useState } from 'react';
import { visitorService } from '../../services/api';
import { Visitor } from '../../types';
import { StatusBadge } from '../../components/common/Badges';
import { Modal } from '../../components/common/Modal';
import {
  Users2,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';

export const StudentVisitors: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    visitorName: '',
    phone: '',
    visitorType: 'Parent',
    purpose: '',
    expectedArrival: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visitorName || !formData.phone || !formData.purpose || !formData.expectedArrival) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await visitorService.registerVisitor(formData);
      setIsModalOpen(false);
      setFormData({
        visitorName: '',
        phone: '',
        visitorType: 'Parent',
        purpose: '',
        expectedArrival: '',
      });
      fetchVisitors();
    } catch (err: any) {
      setError(err.message || 'Failed to register visitor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hostel Visitor & Guest Passes</h2>
          <p className="text-xs text-slate-500">
            Pre-register visiting family members or friends for security gate clearance
          </p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Pre-Register Visitor
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : visitors.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No visitors registered</h3>
          <p className="text-xs text-slate-500 mt-1">Expected a guest? Click the button above to issue an entry pass.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visitors.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{v.visitorName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {v.visitorType}
                    </span>
                  </div>
                  <StatusBadge status={v.status} size="sm" />
                </div>

                <p className="text-xs text-slate-500 font-mono">Contact: {v.phone}</p>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Purpose: {v.purpose}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Expected: {new Date(v.expectedArrival).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                {v.approvedBy && (
                  <span className="text-emerald-700 font-medium">Approved by {v.approvedBy}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Pre-Register Visitor */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pre-Register Expected Visitor">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Visitor Full Name *</label>
            <input
              type="text"
              required
              value={formData.visitorName}
              onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
              placeholder="e.g. Ramesh Chandra"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Visitor Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98000 00000"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Relation / Type</label>
              <select
                value={formData.visitorType}
                onChange={(e) => setFormData({ ...formData, visitorType: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="Parent">Parent</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend / Classmate</option>
                <option value="Official">Official / Guardian</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Expected Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.expectedArrival}
              onChange={(e) => setFormData({ ...formData, expectedArrival: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Purpose of Visit *</label>
            <textarea
              required
              rows={2}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. Dropping off personal books and medicine..."
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
