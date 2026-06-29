'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Course, CourseStatus, instructorService } from '@/lib/service';
import { Plus, BookOpen, Users, Edit, GraduationCap, AlertCircle, CheckCircle2, FileEdit, Search, ArrowUpDown, Filter } from 'lucide-react';

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'enrollmentCount'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const handleSort = (field: 'title' | 'price' | 'enrollmentCount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.Draft:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 border border-zinc-200 shadow-sm">
             Bản nháp
          </span>
        );
      case CourseStatus.Pending:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 shadow-sm">
            <AlertCircle className="h-3.5 w-3.5" /> Chờ duyệt
          </span>
        );
      case CourseStatus.Published:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã xuất bản
          </span>
        );
      case CourseStatus.Rejected:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200 shadow-sm">
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

  // Filter and sort instructor courses locally
  const filteredCourses = courses
    .filter((c) => {
      // 1. Search title & description
      const query = search.toLowerCase();
      const matchesSearch =
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query);

      // 2. Status filter
      const matchesStatus =
        statusFilter === 'all' || c.status.toString() === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return <div className="text-zinc-500 text-center py-20 bg-white rounded-xl border border-zinc-200">Đang tải danh sách khóa học...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Quản lý khóa học</h1>
          <p className="text-xs text-zinc-500">
            Quản lý nội dung bài giảng, thêm giáo trình học tập và xem tiến độ học viên của bạn.
          </p>
        </div>
        <a
          href="/instructor/courses/create"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer hover:shadow-lg"
        >
          <Plus className="h-4.5 w-4.5" />
          Tạo khóa học mới
        </a>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-400 p-16 text-center bg-white shadow-sm">
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
        <>
          {/* Filters & Sorting Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm tên khóa học..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-350 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 font-bold focus:border-indigo-500 outline-none placeholder:text-zinc-500"
              />
            </div>

            {/* Status Selector */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-zinc-350 bg-white py-2 px-3 text-xs text-zinc-800 font-bold focus:border-indigo-500 outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="0">Bản nháp</option>
                <option value="1">Chờ duyệt</option>
                <option value="2">Đã xuất bản</option>
                <option value="3">Bị từ chối</option>
              </select>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('title')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-xs font-bold transition-colors ${
                  sortBy === 'title' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-350 text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                Tên <ArrowUpDown className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleSort('enrollmentCount')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-xs font-bold transition-colors ${
                  sortBy === 'enrollmentCount' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-350 text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                Học viên <ArrowUpDown className="h-3 w-3" />
              </button>
            </div>

            {/* Counter display */}
            <div className="flex items-center justify-end text-xs font-semibold text-zinc-500 px-2 gap-1 bg-zinc-50 rounded-lg border border-zinc-200 py-2 sm:py-0">
              <Filter className="h-3.5 w-3.5 text-zinc-400" />
              Kết quả: <span className="text-zinc-800 font-bold">{filteredCourses.length}</span> / {courses.length} khóa học
            </div>
          </div>

          {/* Grid Area */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredCourses.map((course) => (
              <div
                key={course.courseId}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{course.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-100 font-medium">
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
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100/10 py-2 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
                    >
                      <FileEdit className="h-3.5 w-3.5" />
                      Thông tin
                    </button>
                    <a
                      href={`/instructor/courses/${course.courseId}/curriculum`}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Đề cương
                    </a>
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
            {filteredCourses.length === 0 && (
              <div className="col-span-full py-16 text-center text-zinc-400 font-medium bg-white rounded-xl border border-zinc-200 shadow-sm">
                Không tìm thấy khóa học nào phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
