'use client';

import React, { useEffect, useState } from 'react';
import { Course, adminService } from '@/lib/service';
import { BookOpen, CheckCircle, XCircle, ChevronRight, User, Search, X } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection Modal States
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectCourseId, setRejectCourseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const loadPendingCourses = async () => {
    try {
      const data = await adminService.getPendingCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCourses();
  }, []);

  const handleApprove = async (courseId: string) => {
    const confirmApprove = window.confirm('Bạn có chắc chắn muốn phê duyệt và xuất bản khóa học này không?');
    if (!confirmApprove) return;

    try {
      await adminService.reviewCourse(courseId, true, '');
      setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
      alert('Đã phê duyệt và xuất bản khóa học thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phê duyệt khóa học');
    }
  };

  const openRejectModal = (courseId: string) => {
    setRejectCourseId(courseId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectCourseId) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối khóa học.');
      return;
    }

    setSubmittingReject(true);
    try {
      await adminService.reviewCourse(rejectCourseId, false, rejectReason.trim());
      setCourses((prev) => prev.filter((c) => c.courseId !== rejectCourseId));
      setRejectModalOpen(false);
      setRejectCourseId(null);
      alert('Đã từ chối khóa học và gửi ý kiến phản hồi tới giảng viên.');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi từ chối khóa học');
    } finally {
      setSubmittingReject(false);
    }
  };

  const formatVND = (num: number) => {
    if (num === 0) return 'Miễn phí';
    return num.toLocaleString('vi-VN') + ' đ';
  };

  // Filter courses locally
  const filteredCourses = courses.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      c.instructorName?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <div className="text-zinc-500 text-center py-20 bg-white rounded-xl border border-zinc-200">Đang tải danh sách khóa học chờ duyệt...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Duyệt Khóa Học Chờ Xuất Bản</h1>
          <p className="text-xs text-zinc-500">Xem xét và đánh giá giáo án từ giảng viên trước khi xuất bản lên nền tảng.</p>
        </div>
        
        {courses.length > 0 && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc giảng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-350 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 font-bold focus:border-indigo-500 outline-none placeholder:text-zinc-500"
            />
          </div>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-16 text-center bg-white shadow-sm">
          <BookOpen className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="font-bold text-zinc-800 text-sm">Hộp thư duyệt trống</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'Không tìm thấy khóa học nào phù hợp với từ khóa.' : 'Hiện không có yêu cầu phê duyệt khóa học mới nào từ các giảng viên.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.courseId}
              className="rounded-xl border border-zinc-205 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center"
            >
              <div className="flex gap-4 items-start flex-1 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-24 w-40 rounded-lg object-cover border border-zinc-200 shrink-0 shadow-sm"
                />
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-bold text-zinc-950 text-base truncate">{course.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 pt-2 font-semibold">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-zinc-400 animate-pulse" />
                      Giảng viên: <span className="font-bold text-zinc-700">{course.instructorName}</span>
                    </span>
                    <span>•</span>
                    <span>Học phần: {course.modules?.length || 0} chương</span>
                    <span>•</span>
                    <span>Học phí: <span className="font-bold text-blue-600">{formatVND(course.price)}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 shrink-0 w-full lg:w-auto border-t lg:border-t-0 border-zinc-100 pt-4 lg:pt-0">
                <a
                  href={`/courses/${course.courseId}`}
                  target="_blank"
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 py-2.5 px-4 text-xs font-semibold text-zinc-700 transition-colors shadow-sm"
                >
                  Xem đề cương
                  <ChevronRight className="h-4 w-4" />
                </a>
                <button
                  onClick={() => openRejectModal(course.courseId)}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 py-2.5 px-4 text-xs font-semibold text-red-600 transition-colors border border-red-200 shadow-sm cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  Từ chối
                </button>
                <button
                  onClick={() => handleApprove(course.courseId)}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 py-2.5 px-4 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  Phê duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Rejection Modal Overlay */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Close */}
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2 mb-3">
              <XCircle className="h-5 w-5 text-red-500" />
              Từ chối bài duyệt khóa học
            </h3>
            
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Vui lòng nhập lý do từ chối khóa học này. Giảng viên sẽ nhận được phản hồi chi tiết để tiến hành chỉnh sửa và nộp lại.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Đề cương chương 2 thiếu bài thực hành, video 1.1 bị lỗi âm thanh..."
                className="w-full text-xs rounded-xl border border-zinc-300 p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="rounded-lg border border-zinc-200 py-2 px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="rounded-lg bg-red-600 hover:bg-red-700 py-2 px-4 text-xs font-semibold text-white shadow transition-all disabled:bg-red-400 cursor-pointer"
                >
                  {submittingReject ? 'Đang gửi...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
