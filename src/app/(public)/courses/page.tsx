'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Course, courseService } from '@/lib/service';
import { Search, BookOpen, Clock, Users, SlidersHorizontal, ArrowRight, Star, Sparkles } from 'lucide-react';

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
    <div className="bg-zinc-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header section with light/subtle gradient accent */}
        <div className="relative rounded-3xl bg-slate-950 p-8 sm:p-12 text-white overflow-hidden shadow-2xl mb-12 border border-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="max-w-xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Khám phá học thuật
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              Thư viện khóa học
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
              Mở khóa tương lai của bạn với lộ trình học bài bản. Luyện tập các kỹ năng, thi thử tự động và nhận đánh giá từ AI.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
          
          {/* Left Column: Glassmorphic Sidebar Filters */}
          <form onSubmit={handleFilterSubmit} className="space-y-6 rounded-3xl border border-zinc-200/60 p-6 bg-white shadow-lg shadow-zinc-100/50 sticky top-24">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2 font-black text-zinc-900 text-sm">
                <SlidersHorizontal className="h-4.5 w-4.5 text-blue-600" />
                Bộ lọc tìm kiếm
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setSearch('');
                  setLanguage('all');
                  setPriceFilter('all');
                  router.push('/courses');
                }}
                className="text-[10px] font-bold text-zinc-400 hover:text-blue-600 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Tìm kiếm từ khóa
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tên khóa học..."
                  className="w-full rounded-xl border border-zinc-200/80 py-2.5 pl-3 pr-8 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-zinc-400 bg-zinc-50"
                />
              </div>
            </div>

            {/* Language filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Ngôn ngữ giảng dạy
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-zinc-200/80 py-2.5 px-3 text-xs text-zinc-700 bg-zinc-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              >
                <option value="all">Tất cả ngôn ngữ</option>
                <option value="lang-vi">Tiếng Việt</option>
                <option value="lang-en">Tiếng Anh</option>
              </select>
            </div>

            {/* Price filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Phân loại chi phí
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full rounded-xl border border-zinc-200/80 py-2.5 px-3 text-xs text-zinc-700 bg-zinc-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              >
                <option value="all">Tất cả các mức giá</option>
                <option value="free">Miễn phí</option>
                <option value="paid">Có phí</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer text-center"
            >
              Áp dụng lọc
            </button>
          </form>

          {/* Right Column: Course Grid with gorgeous cards */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {[1, 2, 4].map((n) => (
                  <div key={n} className="animate-pulse border border-zinc-200 bg-white rounded-3xl p-5 space-y-4">
                    <div className="bg-zinc-100 h-48 rounded-2xl w-full"></div>
                    <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
                    <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
                    <div className="h-10 bg-zinc-200 rounded w-1/3 pt-4"></div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-zinc-300 rounded-3xl bg-zinc-50/50">
                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <BookOpen className="h-8 w-8" />
                </div>
                <p className="text-zinc-700 font-bold text-base">Không tìm thấy khóa học</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Vui lòng thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc để thử lại.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {courses.map((course) => (
                  <a
                    key={course.courseId}
                    href={`/courses/${course.courseId}`}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200/60 bg-white hover:shadow-2xl hover:shadow-zinc-200/35 hover:-translate-y-1.5 transition-all duration-300 shadow-sm h-full"
                  >
                    {/* Course Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-50">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-555 group-hover:scale-103"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Body content */}
                    <div className="flex flex-1 flex-col p-6 space-y-3.5">
                      <span className="inline-flex max-w-fit items-center rounded bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 border border-blue-100 uppercase tracking-wider">
                        {course.languageName}
                      </span>
                      
                      <h3 className="text-base font-extrabold text-zinc-950 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      
                      <p className="flex-1 text-xs text-zinc-500 line-clamp-3 leading-relaxed font-medium">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-2 pt-2 text-[10px] text-zinc-400 border-t border-zinc-100">
                        <span className="font-semibold text-zinc-500">Giảng viên:</span>
                        <span className="font-bold text-zinc-700 truncate max-w-[150px]">{course.instructorName}</span>
                      </div>

                      {/* Footer pricing */}
                      <div className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-zinc-400 animate-pulse" />
                            <span>12h học</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-zinc-400" />
                            <span>{course.enrollmentCount}</span>
                          </div>
                        </div>
                        <span className="text-sm sm:text-base font-black text-zinc-950 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
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
