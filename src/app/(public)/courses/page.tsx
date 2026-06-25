'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Course, courseService } from '@/lib/service';
import { Search, BookOpen, Clock, Users, SlidersHorizontal } from 'lucide-react';

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || 'all');
  const [priceFilter, setPriceFilter] = useState(searchParams.get('price') || 'all');

  const fetchFilteredCourses = async () => {
    setLoading(true);
    try {
      const maxPrice = priceFilter === 'free' ? 0 : undefined;
      const data = await courseService.getCourses(search, language, maxPrice);
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredCourses();
  }, [searchParams]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (language !== 'all') params.set('language', language);
    if (priceFilter !== 'all') params.set('price', priceFilter);
    router.push(`/courses?${params.toString()}`);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return price.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-950">Tất cả khóa học</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Tìm kiếm bài học và mở rộng năng lực của bạn
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Column: Sidebar Filters */}
        <form onSubmit={handleFilterSubmit} className="space-y-6 rounded-xl border border-zinc-200 p-6 bg-white self-start">
          <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm border-b border-zinc-150 pb-3">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            Bộ lọc tìm kiếm
          </div>

          {/* Keyword Search */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Từ khóa
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tên khóa học..."
                className="w-full rounded-lg border border-zinc-300 py-2 pl-3 pr-8 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Language filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Ngôn ngữ
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 py-2 px-3 text-xs text-zinc-700 bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tất cả ngôn ngữ</option>
              <option value="lang-vi">Tiếng Việt</option>
              <option value="lang-en">Tiếng Anh</option>
            </select>
          </div>

          {/* Price filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Giá khóa học
            </label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 py-2 px-3 text-xs text-zinc-700 bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tất cả các mức giá</option>
              <option value="free">Miễn phí</option>
              <option value="paid">Có phí</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-semibold text-white shadow transition-all cursor-pointer text-center"
          >
            Áp dụng bộ lọc
          </button>
        </form>

        {/* Right Column: Course Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[1, 2, 4].map((n) => (
                <div key={n} className="animate-pulse border border-zinc-200 rounded-2xl p-4">
                  <div className="bg-zinc-200 h-44 rounded-xl w-full mb-4"></div>
                  <div className="h-4 bg-zinc-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-zinc-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-zinc-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 border border-zinc-200 rounded-xl bg-zinc-50">
              <BookOpen className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Không tìm thấy khóa học nào phù hợp</p>
              <p className="text-xs text-zinc-400 mt-1">Vui lòng thử lại với từ khóa hoặc bộ lọc khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {courses.map((course) => (
                <a
                  key={course.courseId}
                  href={`/courses/${course.courseId}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {course.languageName}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                    
                    <p className="text-xs text-zinc-400 mt-4">
                      Giảng viên: <span className="font-medium text-zinc-600">{course.instructorName}</span>
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-zinc-400" />
                          <span>12h học</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-zinc-400" />
                          <span>{course.enrollmentCount}</span>
                        </div>
                      </div>
                      <span className="text-base font-bold text-zinc-900">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Đang tải danh sách khóa học...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
