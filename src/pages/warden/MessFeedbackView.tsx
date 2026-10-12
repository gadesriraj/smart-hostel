import React, { useEffect, useState } from 'react';
import { feedbackService } from '../../services/api';
import { MessFeedback } from '../../types';
import { UtensilsCrossed, Star, Filter, Calendar, Loader2 } from 'lucide-react';

export const MessFeedbackView: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<MessFeedback[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [mealTypeFilter, setMealTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await feedbackService.getFeedback({ mealType: mealTypeFilter || undefined });
      setFeedbacks(res.list);
      setStats(res.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [mealTypeFilter]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Dining Hall & Mess Feedback</h2>
        <p className="text-xs text-slate-500">
          Resident dining satisfaction, quality ratings, hygiene feedback, and meal analytics
        </p>
      </div>

      {/* Aggregate Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total Reviews</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalSubmissions}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Submitted by residents</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Food Quality</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900">{stats.averageQuality}</span>
              {renderStars(stats.averageQuality)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scale 1-5 stars</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Taste & Flavor</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900">{stats.averageTaste}</span>
              {renderStars(stats.averageTaste)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scale 1-5 stars</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Kitchen Cleanliness</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900">{stats.averageCleanliness}</span>
              {renderStars(stats.averageCleanliness)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scale 1-5 stars</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Recent Student Reviews</h3>
        <select
          value={mealTypeFilter}
          onChange={(e) => setMealTypeFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
        >
          <option value="">All Meals</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Snacks">Evening Snacks</option>
          <option value="Dinner">Dinner</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No feedback submissions found</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{fb.studentName}</span>
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {fb.mealType}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{fb.date}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Quality</span>
                  {renderStars(fb.foodQuality)}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Taste</span>
                  {renderStars(fb.taste)}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Hygiene</span>
                  {renderStars(fb.cleanliness)}
                </div>
              </div>

              {fb.comments && (
                <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  "{fb.comments}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
