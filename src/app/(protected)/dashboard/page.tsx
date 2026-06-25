'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Enrollment, Certificate, studentService } from '@/lib/service';
import { GraduationCap, Award, BookOpen, Clock, ChevronRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadDashboardData = async () => {
      try {
        const myCourses = await studentService.getMyCourses(user.userId);
        setEnrollments(myCourses);

        const myCerts = await studentService.getCertificates(user.userId);
        setCertificates(myCerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  if (loading) {
    return <div className="text-zinc-505/80 text-center py-10">Đang tải thông tin trang cá nhân...</div>;
  }

  const completedCoursesCount = enrollments.filter((e) => e.progressPercent === 100).length;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold">Chào mừng trở lại, {user?.fullName}!</h1>
        <p className="mt-2 text-blue-100 text-sm max-w-xl">
          Hôm nay là một ngày tuyệt vời để học tập những kiến thức mới. Hãy tiếp tục hoàn thành các mục tiêu học tập của bạn nhé.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Khóa học đăng ký</p>
            <p className="text-xl font-bold text-zinc-800">{enrollments.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Khóa học đã xong</p>
            <p className="text-xl font-bold text-zinc-800">{completedCoursesCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Chứng chỉ nhận được</p>
            <p className="text-xl font-bold text-zinc-800">{certificates.length}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-zinc-950 mb-4">Tiến trình học tập</h2>
        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center bg-white">
            <BookOpen className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm font-medium">Bạn chưa đăng ký khóa học nào</p>
            <a
              href="/courses"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Khám phá danh sách khóa học ngay
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {enrollments.map((enroll) => {
              const c = enroll.course;
              if (!c) return null;
              return (
                <div
                  key={enroll.enrollmentId}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
                >
                  <img src={c.image} alt={c.title} className="h-40 w-full object-cover" />
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-zinc-900 text-base line-clamp-1">{c.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">Giảng viên: {c.instructorName}</p>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium text-zinc-650">
                        <span>Tiến độ học tập</span>
                        <span className="text-blue-600 font-semibold">{enroll.progressPercent}%</span>
                      </div>
                      
                      <div className="w-full bg-zinc-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${enroll.progressPercent}%` }}
                        />
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Mở khóa 100%</span>
                        </div>
                        <a
                          href={`/learning/${c.courseId}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 text-xs font-semibold transition-colors"
                        >
                          Học tiếp
                          <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
