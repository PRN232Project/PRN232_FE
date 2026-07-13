'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reviewService, ReviewItem, CourseReviewSummary } from '@/lib/service/review';

interface CourseReviewsProps {
  courseId: string;
  isEnrolled: boolean;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' };
  const cls = sizes[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}
        >
          <Star
            className={`${cls} ${
              star <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-zinc-200 text-zinc-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-zinc-500 font-medium">{star}</span>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-zinc-400">{count}</span>
    </div>
  );
}

export default function CourseReviews({ courseId, isEnrolled }: CourseReviewsProps) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<CourseReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await reviewService.getReviews(courseId);
      setSummary(data);
      if (data.myReview) {
        setMyRating(data.myReview.rating);
        setMyComment(data.myReview.comment ?? '');
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await reviewService.submitReview(courseId, myRating, myComment.trim() || undefined);
      showToast('success', 'Đánh giá của bạn đã được lưu!');
      setShowForm(false);
      await load();
    } catch {
      showToast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      showToast('success', 'Đã xóa đánh giá.');
      await load();
    } catch {
      showToast('error', 'Có lỗi xảy ra.');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (loading) return (
    <div className="py-12 text-center text-zinc-400 text-sm animate-pulse">Đang tải đánh giá...</div>
  );

  const hasMyReview = !!summary?.myReview;

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl text-xs font-bold shadow-xl text-white transition-all ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header + Summary */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-1 bg-amber-400 rounded-full" />
        <h2 className="text-lg sm:text-xl font-black text-zinc-950">Đánh giá từ học viên</h2>
      </div>

      {summary && summary.totalReviews > 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Big score */}
            <div className="flex flex-col items-center justify-center min-w-[120px] bg-amber-50 rounded-2xl border border-amber-100 px-6 py-5">
              <span className="text-5xl font-black text-amber-500">{summary.averageRating.toFixed(1)}</span>
              <StarRating value={Math.round(summary.averageRating)} readonly size="sm" />
              <span className="text-[10px] text-zinc-400 mt-1.5 font-medium">{summary.totalReviews} đánh giá</span>
            </div>
            {/* Distribution bars */}
            <div className="flex-1 space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  star={star}
                  count={summary.ratingDistribution[String(star)] ?? 0}
                  total={summary.totalReviews}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center bg-zinc-50/50">
          <ThumbsUp className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      )}

      {/* My Review / Form */}
      {isEnrolled && user && (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">
              {hasMyReview ? 'Đánh giá của bạn' : 'Viết đánh giá'}
            </h3>
            {hasMyReview && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Sửa đánh giá
              </button>
            )}
          </div>

          {hasMyReview && !showForm ? (
            <div className="p-6 flex gap-4">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <StarRating value={summary!.myReview!.rating} readonly size="sm" />
                  <span className="text-[10px] text-zinc-400">{formatDate(summary!.myReview!.createdAt)}</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">{summary?.myReview?.comment || <em className="text-zinc-400">Không có nhận xét</em>}</p>
              </div>
            </div>
          ) : isEnrolled && (showForm || !hasMyReview) ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Chọn số sao</label>
                <StarRating value={myRating} onChange={setMyRating} size="lg" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Nhận xét (tùy chọn)</label>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  rows={3}
                  placeholder="Chia sẻ trải nghiệm học tập của bạn..."
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Đang gửi...' : hasMyReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                </button>
                {hasMyReview && (
                  <button type="button" onClick={() => setShowForm(false)} className="text-xs text-zinc-500 hover:text-zinc-700 cursor-pointer">
                    Hủy
                  </button>
                )}
              </div>
            </form>
          ) : null}
        </div>
      )}

      {/* Review List */}
      {summary && summary.reviews.length > 0 && (
        <div className="space-y-4">
          {summary.reviews.map((r) => (
            <div key={r.reviewId} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                  {r.studentAvatar ? (
                    <img src={r.studentAvatar} alt={r.studentName} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{r.studentName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating value={r.rating} readonly size="sm" />
                        <span className="text-[10px] text-zinc-400">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                    {/* Delete if owner or admin */}
                    {user && (user.userId === r.userId || user.role === 0) && (
                      <button
                        onClick={() => handleDelete(r.reviewId)}
                        className="text-[10px] text-red-400 hover:text-red-600 font-medium cursor-pointer"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  {r.comment && (
                    <p className="mt-3 text-xs text-zinc-600 leading-relaxed">{r.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
