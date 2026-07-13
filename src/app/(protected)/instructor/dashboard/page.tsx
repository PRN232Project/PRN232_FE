'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { instructorService, InstructorStats } from '@/lib/service';
import { DollarSign, Users, BookOpen, Star, TrendingUp, Sparkles, BookOpenCheck, Medal, Landmark } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      try {
        const data = await instructorService.getStats(user.userId);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-zinc-500 text-xs font-semibold animate-pulse">Đang tải phân tích dữ liệu giảng viên...</p>
      </div>
    );
  }

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-6 sm:p-8 text-white shadow-xl border border-zinc-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Bảng điều khiển giảng viên
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
              Xin chào, {user?.fullName || 'Giảng viên'}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium">
              Theo dõi hiệu suất doanh thu, số học viên ghi danh và đánh giá khóa học của bạn.
            </p>
          </div>
          <a
            href="/instructor/courses/create"
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md hover:bg-zinc-100 active:scale-95 transition-all cursor-pointer border border-zinc-200"
          >
            <BookOpenCheck className="mr-2 h-4 w-4 text-indigo-600" /> Tạo khóa học mới
          </a>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu (Nhận 90%) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Doanh thu thực nhận</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-950">{formatVND(stats?.totalEarnings || 0)}</h3>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-1 bg-emerald-50/50 px-2 py-0.5 rounded-md border border-emerald-100 max-w-fit">
              <TrendingUp className="h-3 w-3" />
              Đã trừ 10% phí nền tảng
            </span>
          </div>
        </div>

        {/* Tổng học viên */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tổng số học viên</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-950">{stats?.totalStudents}</h3>
            <span className="text-[10px] text-zinc-400 mt-1.5 block font-medium">Học viên đang theo học các khóa</span>
          </div>
        </div>

        {/* Khóa học xuất bản */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Khóa học đã xuất bản</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-950">{stats?.activeCoursesCount}</h3>
            <span className="text-[10px] text-zinc-400 mt-1.5 block font-medium">Khóa học hiển thị trên hệ thống</span>
          </div>
        </div>

        {/* Đánh giá trung bình */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Đánh giá trung bình</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 border border-amber-100 shadow-inner">
              <Star className="h-5 w-5 fill-current" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-950">{stats?.averageRating} / 5.0</h3>
            <span className="text-[10px] text-zinc-400 mt-1.5 block font-medium">Tính trên đánh giá của các khóa học</span>
          </div>
        </div>
      </div>

      {/* Charts & Popular Courses */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Monthly Earnings Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Landmark className="h-4.5 w-4.5 text-zinc-400" /> Doanh thu 6 tháng gần nhất (VND)
          </h2>
          <div className="h-72 w-full">
            {mounted && stats && stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000000}M`} />
                  <Tooltip formatter={(value: any) => [formatVND(value), 'Doanh thu thực nhận']} />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 text-xs font-semibold">Chưa phát sinh doanh thu từ ghi danh khóa học</div>
            )}
          </div>
        </div>

        {/* Popular Courses */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Medal className="h-4.5 w-4.5 text-zinc-400" /> Khóa học phổ biến nhất
            </h2>
            <div className="divide-y divide-zinc-100">
              {stats?.popularCourses && stats.popularCourses.length > 0 ? (
                stats.popularCourses.map((c, i) => (
                  <div key={i} className="py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50/30 px-1 rounded-lg transition-colors">
                    <div className="overflow-hidden space-y-0.5">
                      <p className="text-xs font-bold text-zinc-800 truncate">{c.title}</p>
                      <p className="text-[10px] text-zinc-500 font-semibold">{c.enrollments} lượt học viên đăng ký</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-zinc-950 block">{formatVND(c.revenue)}</span>
                      <span className="text-[9px] text-zinc-400 font-bold">Thực nhận</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-zinc-400 text-xs font-semibold">Chưa có số liệu về mức độ phổ biến của khóa học</div>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-4 mt-4 text-[10px] text-zinc-400 leading-normal font-semibold">
            Báo cáo được tự động cập nhật dựa trên ghi nhận giao dịch thanh toán mua khóa học thành công trên nền tảng.
          </div>
        </div>
      </div>
    </div>
  );
}
