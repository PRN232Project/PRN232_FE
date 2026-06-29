'use client';

import React, { useEffect, useState } from 'react';
import { Course, courseService } from '@/lib/service';
import { Search, BookOpen, Clock, Users, ArrowRight, Star, Sparkles, ShieldCheck, GraduationCap } from 'lucide-react';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return price.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="bg-zinc-50/50 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-24 lg:py-32">
        {/* Decorative glowing background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
            
            {/* Left Column: Title & Search */}
            <div className="flex flex-col justify-center lg:col-span-7 space-y-6">
              <span className="inline-flex max-w-fit items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 text-xs font-semibold text-blue-400 select-none animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                Học tập thông minh cùng Trí Tuệ Nhân Tạo (AI)
              </span>
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.15] text-white">
                Nâng tầm tri thức <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  OLP Academy
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-zinc-400 max-w-lg leading-relaxed font-medium">
                Hệ thống học tập chuyên nghiệp hàng đầu. Trải nghiệm đề cương bài học bài bản, tự động chấm điểm trắc nghiệm và luyện đề Speaking & Writing bằng AI thông minh.
              </p>

              {/* Search Bar Widget */}
              <div className="pt-2 max-w-md">
                <form action="/courses" method="GET" className="relative flex items-center p-1 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/40 group focus-within:border-blue-500/40 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
                  <Search className="absolute left-4 h-5 w-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Tìm kiếm khóa học lập trình, kỹ năng..."
                    className="w-full rounded-xl bg-transparent py-3.5 pl-12 pr-4 text-xs font-medium text-white focus:outline-none placeholder:text-zinc-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Tìm kiếm
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Premium Interactive Showcase Cards */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md animate-float">
                
                {/* Main Glass Image Container */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 p-3 shadow-2xl backdrop-blur-md">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop"
                    alt="Students learning together"
                    className="rounded-2xl object-cover border border-white/5 aspect-[4/3] w-full"
                  />
                </div>

                {/* Floating Card 1: Total Courses */}
                <div className="absolute -bottom-6 -left-8 rounded-2xl bg-slate-900/80 backdrop-blur-lg p-4 shadow-2xl border border-white/10 flex items-center gap-3.5 select-none transform hover:scale-[1.05] transition-transform duration-300">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Tổng khóa học</p>
                    <p className="text-base font-extrabold text-white">120+ Học phần</p>
                  </div>
                </div>

                {/* Floating Card 2: AI Evaluator */}
                <div className="absolute -top-8 -right-6 rounded-2xl bg-slate-900/85 backdrop-blur-lg p-4 shadow-2xl border border-white/10 flex items-center gap-3.5 select-none transform hover:scale-[1.05] transition-transform duration-300">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <ShieldCheck className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Khảo thí tự động</p>
                    <p className="text-base font-extrabold text-white">AWS AI Evaluator</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Counter Banner Section */}
      <section className="py-12 bg-white border-b border-zinc-200/60 shadow-sm relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
            
            {/* Stat Item 1 */}
            <div className="flex items-center gap-5 sm:justify-center py-4 sm:py-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-900">5,000+</h3>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Học viên tích cực</p>
              </div>
            </div>

            {/* Stat Item 2 */}
            <div className="flex items-center gap-5 sm:justify-center py-6 sm:py-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-900">100%</h3>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Giảng viên chất lượng</p>
              </div>
            </div>

            {/* Stat Item 3 */}
            <div className="flex items-center gap-5 sm:justify-center py-4 sm:py-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-900">4.9 / 5.0</h3>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Đánh giá hài lòng</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Courses Grid Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Group */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
              Các khóa học nổi bật
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-medium">
              Chương trình học tập chất lượng cao thiết kế bởi giảng viên dày dặn kinh nghiệm chuẩn đầu ra.
            </p>
          </div>
          <a
            href="/courses"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors mt-4 md:mt-0 hover:underline decoration-2"
          >
            Xem tất cả khóa học
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-4">
                <div className="bg-zinc-200 h-48 rounded-2xl w-full"></div>
                <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
                <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
                <div className="h-10 bg-zinc-200 rounded w-1/3 pt-4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <a
                key={course.courseId}
                href={`/courses/${course.courseId}`}
                className="group flex flex-col rounded-3xl border border-zinc-200/60 bg-white hover:shadow-2xl hover:shadow-zinc-300/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden shadow-sm h-full"
              >
                
                {/* Image Container with zoom */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Content body */}
                <div className="flex flex-1 flex-col p-6 space-y-3.5">
                  <span className="inline-flex max-w-fit items-center rounded bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 border border-blue-100 uppercase tracking-wider">
                    {course.languageName}
                  </span>
                  
                  <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {course.title}
                  </h3>
                  
                  <p className="flex-1 text-xs text-zinc-500 line-clamp-3 leading-relaxed font-medium">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-2 pt-2 text-[10px] text-zinc-400 border-t border-zinc-100">
                    <span className="font-semibold text-zinc-500">Giảng viên:</span>
                    <span className="font-bold text-zinc-700 truncate max-w-[150px]">{course.instructorName}</span>
                  </div>

                  {/* Pricing footer */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span>12h học</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-zinc-400" />
                        <span>{course.enrollmentCount} học viên</span>
                      </div>
                    </div>
                    <span className="text-sm sm:text-base font-black text-zinc-900 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                </div>

              </a>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
