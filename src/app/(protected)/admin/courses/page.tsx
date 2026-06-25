'use client';

import React, { useEffect, useState } from 'react';
import { Course, adminService } from '@/lib/service';
import { BookOpen, CheckCircle, XCircle, ChevronRight, User } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleReview = async (courseId: string, approve: boolean) => {
    let comment = '';
    if (!approve) {
      const reason = prompt('Nhập lý do từ chối khóa học này:');
      if (reason === null) return;
      comment = reason || 'Nội dung chưa đạt yêu cầu kiểm duyệt';
    }

    try {
      await adminService.reviewCourse(courseId, approve, comment);
      setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
      alert(approve ? 'Đã phê duyệt khóa học thành công!' : 'Đã từ chối khóa học.');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi kiểm duyệt khóa học');
    }
  };

  const formatVND = (num: number) => {
    if (num === 0) return 'Miễn phí';
    return num.toLocaleString('vi-VN') + ' đ';
  };

  if (loading) {
    return <div className="text-zinc-500 text-center py-10">Đang tải danh sách khóa học chờ duyệt...</div>;
  }

  return (
    <div className="space-y-8">
      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-16 text-center bg-white">
          <BookOpen className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="font-bold text-zinc-800 text-sm">Hộp thư duyệt trống</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Hiện không có yêu cầu phê duyệt khóa học mới nào từ các giảng viên.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course.courseId}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
            >
              <div className="flex gap-4 items-start flex-1 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-24 w-40 rounded-lg object-cover border border-zinc-200 shrink-0"
                />
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-bold text-zinc-900 text-base truncate">{course.title}</h3>
                  <p className="text-xs text-zinc-450 mt-1 line-clamp-2 leading-relaxed">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 pt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Giảng viên: <span className="font-semibold text-zinc-650">{course.instructorName}</span>
                    </span>
                    <span>•</span>
                    <span>Học phần: {course.modules?.length || 0} chương</span>
                    <span>•</span>
                    <span>Học phí: <span className="font-semibold text-zinc-755">{formatVND(course.price)}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0">
                <a
                  href={`/courses/${course.courseId}`}
                  target="_blank"
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-55/10 py-2.5 px-4 text-xs font-semibold text-zinc-650 transition-colors"
                >
                  Xem đề cương
                  <ChevronRight className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleReview(course.courseId, false)}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 py-2.5 px-4 text-xs font-semibold text-red-650 transition-colors cursor-pointer border border-red-200"
                >
                  <XCircle className="h-4 w-4" />
                  Từ chối
                </button>
                <button
                  onClick={() => handleReview(course.courseId, true)}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 hover:bg-green-700 py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  Phê duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
