'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Course, CourseStatus, instructorService } from '@/lib/service';
import { Plus, BookOpen, Users, Edit, GraduationCap, AlertCircle, CheckCircle2, FileEdit } from 'lucide-react';

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadCourses = async () => {
      try {
        const data = await instructorService.getInstructorCourses(user.userId);
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [user]);

  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.Draft:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-105/85 bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 border border-zinc-200">
             Bản nháp
          </span>
        );
      case CourseStatus.Pending:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-205/80 border-amber-200">
            <AlertCircle className="h-3.5 w-3.5" /> Chờ duyệt
          </span>
        );
      case CourseStatus.Published:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-250">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã xuất bản
          </span>
        );
      case CourseStatus.Rejected:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800 border border-red-200">
             Bị từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const formatVND = (num: number) => {
    if (num === 0) return 'Miễn phí';
    return num.toLocaleString('vi-VN') + ' đ';
  };

  if (loading) {
    return <div className="text-zinc-55/80 text-center py-10">Đang tải danh sách khóa học...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Quản lý khóa học</h1>
          <p className="text-xs text-zinc-500">
            Quản lý nội dung bài giảng, thêm giáo trình học tập cho sinh viên
          </p>
        </div>
        <a
          href="/instructor/courses/create"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Tạo khóa học mới
        </a>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-350 p-16 text-center bg-white">
          <BookOpen className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="font-bold text-zinc-800 text-sm">Chưa có khóa học nào</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Bắt đầu tạo khóa học đầu tiên của bạn để chia sẻ kiến thức hữu ích đến cộng đồng sinh viên OLP.
          </p>
          <a
            href="/instructor/courses/create"
            className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition-all"
          >
            Bắt đầu ngay
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <div
              key={course.courseId}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm"
            >
              <div className="relative h-44 w-full bg-zinc-100">
                <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(course.status)}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-zinc-900 text-base line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-zinc-450 mt-1 line-clamp-2 leading-relaxed">{course.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-zinc-400" />
                    <span>{course.enrollmentCount} học viên</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-zinc-400" />
                    <span>{course.languageName}</span>
                  </div>
                  <div className="ml-auto font-bold text-zinc-900">
                    {formatVND(course.price)}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => alert('Chức năng sửa thông tin chi tiết: ' + course.title)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 py-2 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    Thông tin
                  </button>
                  <button
                    onClick={() => alert('Giao diện chỉnh sửa Modules/Lessons/Quizzes đang được liên kết!')}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-150 py-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Đề cương
                  </button>
                  <a
                    href={`/courses/${course.courseId}`}
                    className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 p-2 text-zinc-500 hover:text-zinc-700 transition-colors"
                    title="Xem trước khóa học"
                  >
                    <BookOpen className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
