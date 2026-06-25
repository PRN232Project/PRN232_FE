'use client';

import React, { useEffect, useState } from 'react';
import { Course, courseService } from '@/lib/service';
import { Search, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
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
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Column */}
            <div className="flex flex-col justify-center">
              <span className="inline-flex max-w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 mb-6">
                Học tập không giới hạn
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                Nâng tầm tri thức <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  OLP Academy
                </span>
              </h1>
              <p className="mt-6 text-lg text-zinc-600 max-w-lg leading-relaxed">
                Học trực tuyến chuyên nghiệp. Trải nghiệm hệ thống bài giảng video, bài tập trắc nghiệm tự động và nhận chứng chỉ chuẩn đầu ra.
              </p>

              {/* Search Bar */}
              <div className="mt-8 max-w-md">
                <form action="/courses" method="GET" className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-zinc-400" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Tìm kiếm khóa học..."
                    className="w-full rounded-xl border border-zinc-200 bg-white py-3.5 pl-12 pr-4 text-sm shadow-md shadow-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Tìm
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column (Hero Graphic) */}
            <div className="hidden lg:block relative">
              <div className="relative mx-auto w-full max-w-md">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop"
                  alt="Students learning together"
                  className="rounded-2xl shadow-2xl object-cover border-4 border-white"
                />
                {/* Micro Cards */}
                <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-4 shadow-xl border border-zinc-100 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Tổng khóa học</p>
                    <p className="text-sm font-bold text-zinc-800">100+ Khóa</p>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 rounded-xl bg-white p-4 shadow-xl border border-zinc-100 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Học viên tích cực</p>
                    <p className="text-sm font-bold text-zinc-800">5,000+ Bạn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Các khóa học nổi bật
            </h2>
            <p className="mt-2 text-zinc-500">
              Khám phá các khóa học được thiết kế bài bản từ giảng viên giàu kinh nghiệm
            </p>
          </div>
          <a
            href="/courses"
            className="group flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-4 md:mt-0 transition-colors"
          >
            Xem tất cả khóa học
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse border border-zinc-200 rounded-2xl p-4">
                <div className="bg-zinc-200 h-48 rounded-xl w-full mb-4"></div>
                <div className="h-4 bg-zinc-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-zinc-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-zinc-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  
                  {/* Instructor name */}
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
                        <span>{course.enrollmentCount} học viên</span>
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
      </section>
    </div>
  );
}
