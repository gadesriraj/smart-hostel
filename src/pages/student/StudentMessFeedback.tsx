import React, { useEffect, useState } from 'react';
import { feedbackService } from '../../services/api';
import { MessFeedback } from '../../types';
import { UtensilsCrossed, Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const StudentMessFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<MessFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    mealType: 'Dinner',
    foodQuality: 4,
    taste: 4,
    cleanliness: 4,
    comments: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await feedbackService.getFeedback();
      setFeedbacks(res.list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSubmitting(true);

    try {
      await feedbackService.submitFeedback(formData);
      setSuccessMsg('Thank you! Your dining feedback has been recorded for the mess warden committee.');
      setFormData({
        mealType: 'Dinner',
        foodQuality: 4,
        taste: 4,
        cleanliness: 4,
        comments: '',
      });
      fetchFeedback();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const StarPicker = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div>
      <span className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform cursor-pointer"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-700 ml-2">{value} / 5</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Hostel Dining & Mess Feedback</h2>
        <p className="text-xs text-slate-500">
          Share your daily dining experience. Ratings directly impact vendor accountability and weekly menu planning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Feedback Form */}
        <div className="lg:col-span-1 rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-blue-600" />
            Rate Today's Meal
          </h3>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Meal</label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snacks">Evening Snacks</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>

            <StarPicker
              label="1. Overall Food Quality"
              value={formData.foodQuality}
              onChange={(val) => setFormData({ ...formData, foodQuality: val })}
            />

            <StarPicker
              label="2. Taste & Seasoning"
              value={formData.taste}
              onChange={(val) => setFormData({ ...formData, taste: val })}
            />

            <StarPicker
              label="3. Dining Hall & Utensil Hygiene"
              value={formData.cleanliness}
              onChange={(val) => setFormData({ ...formData, cleanliness: val })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Comments or Suggestions (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Specific feedback on dishes, temperature, or service..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit Meal Review'}
            </button>
          </form>
        </div>

        {/* Right: Personal Feedback History */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">My Past Reviews</h3>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No meal ratings submitted yet. Help improve campus dining by submitting your first review today!
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{fb.mealType}</span>
                      <span className="text-[10px] text-slate-400">{fb.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{((fb.foodQuality + fb.taste + fb.cleanliness) / 3).toFixed(1)} Avg</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg text-[11px] text-slate-600 mb-2">
                    <div>Quality: <strong>{fb.foodQuality}★</strong></div>
                    <div>Taste: <strong>{fb.taste}★</strong></div>
                    <div>Cleanliness: <strong>{fb.cleanliness}★</strong></div>
                  </div>

                  {fb.comments && (
                    <p className="text-xs text-slate-600 italic">"{fb.comments}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
