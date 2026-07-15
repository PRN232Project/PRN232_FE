'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { adminService, AdminStats } from '@/lib/service';
import { useSignalR } from '@/context/SignalRContext';
import { DollarSign, Users, Award, BookOpen, TrendingUp, Star, ArrowRight, ShieldCheck, Landmark, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [paySortOrder, setPaySortOrder] = useState<'desc' | 'asc'>('desc');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const { notifHub, notifConnected } = useSignalR();

  const loadStats = useCallback(async (start?: string, end?: string) => {
    try {
      const data = await adminService.getStats(start, end);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApplyFilter = () => {
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      alert('Vui lòng chọn đầy đủ cả Từ ngày và Đến ngày');
      return;
    }
    setLoading(true);
    loadStats(fromDate || undefined, toDate || undefined);
  };

  const handleResetFilter = () => {
    setFromDate('');
    setToDate('');
    setLoading(true);
    loadStats();
  };

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!notifHub || !notifConnected) return;

    const handleUpdate = () => {
      loadStats();
    };

    notifHub.on('WalletBalanceUpdate', handleUpdate);
    notifHub.on('CoursePendingUpdate', handleUpdate);

    return () => {
      notifHub.off('WalletBalanceUpdate', handleUpdate);
      notifHub.off('CoursePendingUpdate', handleUpdate);
    };
  }, [notifHub, notifConnected, loadStats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-zinc-500 text-xs font-semibold animate-pulse">Đang tải báo cáo hệ thống...</p>
      </div>
    );
  }

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const sortedPayments = stats?.recentPayments
    ? [...stats.recentPayments].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return paySortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      })
    : [];

  const COLORS = ['#3b82f6', '#818cf8', '#34d399'];

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
            Thành công
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-100">
            Thất bại
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100">
            Đang xử lý
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-6 sm:p-8 text-white shadow-xl border border-zinc-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" /> Quản trị viên
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">Báo cáo Tổng Quan Hệ Thống</h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium">Theo dõi doanh thu, tài khoản và hoạt động kiểm duyệt khóa học thời gian thực.</p>
          </div>

          {/* Date Range Selector Widget */}
          <div className="flex flex-wrap items-center gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800 backdrop-blur-sm shrink-0 w-full xl:w-auto">
            <div className="flex items-center gap-2">
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.showPicker();
                }}
                className="flex items-center gap-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs px-2.5 py-1.5 font-bold text-white hover:border-zinc-700 transition-colors cursor-pointer select-none"
              >
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Từ:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-white focus:outline-none cursor-pointer [color-scheme:dark] font-bold text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.showPicker();
                }}
                className="flex items-center gap-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs px-2.5 py-1.5 font-bold text-white hover:border-zinc-700 transition-colors cursor-pointer select-none"
              >
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Đến:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-white focus:outline-none cursor-pointer [color-scheme:dark] font-bold text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pl-0 sm:pl-2">
              <button
                type="button"
                onClick={handleApplyFilter}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-black text-white px-3.5 py-1.5 transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                Lọc
              </button>
              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black text-zinc-300 px-3.5 py-1.5 transition-all active:scale-95 cursor-pointer uppercase tracking-wider border border-zinc-700"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Doanh thu nền tảng</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-950">{formatVND(stats?.totalRevenue || 0)}</h3>
            <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-1 mt-1 bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100 max-w-fit">
              <TrendingUp className="h-3 w-3" />
              +18.7% so với tháng trước
            </span>
          </div>
        </div>

        {/* Học viên */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Học viên hoạt động</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shadow-inner">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-950">{stats?.totalStudents}</h3>
            <span className="text-[10px] text-zinc-400 mt-1.5 block font-medium">Tài khoản vai trò Student</span>
          </div>
        </div>

        {/* Giảng viên */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tổng số giảng viên</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-950">{stats?.totalInstructors}</h3>
            <span className="text-[10px] text-zinc-400 mt-1.5 block font-medium">Tài khoản vai trò Instructor</span>
          </div>
        </div>

        {/* Chờ duyệt */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Khóa học chờ duyệt</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-inner">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-950">{stats?.pendingCoursesCount}</h3>
            {stats?.pendingCoursesCount && stats.pendingCoursesCount > 0 ? (
              <a
                href="/admin/courses"
                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-1 hover:underline cursor-pointer"
              >
                Duyệt ngay bây giờ
                <ArrowRight className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-[10px] text-zinc-400 mt-1.5 block font-medium">Không có yêu cầu kiểm duyệt</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Landmark className="h-4.5 w-4.5 text-zinc-400" /> Biểu đồ doanh thu nền tảng
          </h2>
          <div className="h-72 w-full">
            {mounted && stats && stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyRevenue} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" hide />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}đ`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#3b82f6', fontSize: '12px' }}
                    labelFormatter={(label) => `Thời gian: ${label}`}
                    formatter={(value: any) => [formatVND(value), 'Doanh thu']} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2.5} 
                    dot={false} 
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 text-xs font-semibold">Chưa có dữ liệu giao dịch trong khoảng thời gian này</div>
            )}
          </div>
        </div>

        {/* Account Structure Pie Chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-zinc-400" /> Cơ cấu tài khoản người dùng
            </h2>
            <div className="h-56 w-full flex items-center justify-center">
              {mounted && stats && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-4 border-t border-zinc-100 pt-4">
            {stats?.roleDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-zinc-700 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{entry.name}</span>
                </div>
                <span className="font-bold text-zinc-900">{entry.value} tài khoản</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers and Recent Payments */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Top Performers Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Star className="h-4.5 w-4.5 text-zinc-400" /> Thành tích hàng đầu
          </h2>
          
          <div className="space-y-5">
            {/* Top Course */}
            <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100/50">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Khóa học đăng ký nhiều nhất</p>
              <h4 className="text-sm font-extrabold text-zinc-900 line-clamp-1">{stats?.topCourseTitle || 'Chưa cập nhật'}</h4>
              <p className="text-xs text-zinc-500 font-semibold mt-1">Lượt tham gia: <span className="text-blue-600 font-black">{stats?.topCourseEnrolls || 0}</span> học viên</p>
            </div>

            {/* Top Instructor */}
            <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-100/50">
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Giảng viên xuất sắc nhất</p>
              <h4 className="text-sm font-extrabold text-zinc-900 line-clamp-1">{stats?.topInstructorName || 'Chưa cập nhật'}</h4>
              <p className="text-xs text-zinc-500 font-semibold mt-1">Tổng học viên: <span className="text-teal-600 font-black">{stats?.topInstructorStudents || 0}</span> học viên</p>
            </div>
          </div>
          
          <div className="pt-2 text-center">
            <p className="text-[10px] text-zinc-400 font-medium leading-normal">Báo cáo dựa trên tổng hợp số liệu thanh toán và ghi danh khóa học.</p>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <Landmark className="h-4.5 w-4.5 text-zinc-400" /> Giao dịch gần đây
            </h2>
            <div className="overflow-x-auto">
              {sortedPayments && sortedPayments.length > 0 ? (
                <table className="w-full text-left text-xs font-semibold text-zinc-500">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="pb-3">Học viên</th>
                      <th className="pb-3">Khóa học</th>
                      <th className="pb-3">
                        <button
                          type="button"
                          onClick={() => setPaySortOrder(paySortOrder === 'desc' ? 'asc' : 'desc')}
                          className="flex items-center gap-1 hover:text-zinc-700 transition-colors uppercase font-bold focus:outline-none"
                        >
                          Ngày {paySortOrder === 'desc' ? '▼' : '▲'}
                        </button>
                      </th>
                      <th className="pb-3 text-right">Số tiền</th>
                      <th className="pb-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {sortedPayments.slice(0, 5).map((pay: any, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-3">
                          <p className="font-bold text-zinc-800 line-clamp-1">{pay.studentName || 'Học viên'}</p>
                          <p className="text-[10px] text-zinc-400 leading-normal">{pay.userEmail}</p>
                        </td>
                        <td className="py-3 max-w-[200px] truncate text-zinc-700 font-medium">
                          {pay.courseTitle}
                        </td>
                        <td className="py-3 text-[10px] text-zinc-500 font-semibold">
                          {pay.createdAt ? new Date(pay.createdAt).toLocaleString('vi-VN') : '---'}
                        </td>
                        <td className="py-3 text-right font-bold text-zinc-950">
                          {formatVND(pay.amount)}
                        </td>
                        <td className="py-3 text-center">
                          {getStatusBadge(pay.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-zinc-400 text-xs font-semibold">Chưa có giao dịch mua khóa học nào trên hệ thống.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Rankings Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Courses by Revenue */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <DollarSign className="h-4.5 w-4.5 text-blue-600" /> Khóa học doanh thu cao nhất (Top 5)
            </h2>
            <div className="overflow-x-auto">
              {stats?.topCoursesByRevenue && stats.topCoursesByRevenue.length > 0 ? (
                <table className="w-full text-left text-xs font-semibold text-zinc-500">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="pb-3">Khóa học</th>
                      <th className="pb-3 text-center">Số học viên</th>
                      <th className="pb-3 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stats.topCoursesByRevenue.map((c, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-3 font-bold text-zinc-800 line-clamp-1 max-w-[200px]" title={c.title}>
                          {c.title}
                        </td>
                        <td className="py-3 text-center font-bold text-zinc-900">
                          {c.enrollCount}
                        </td>
                        <td className="py-3 text-right font-black text-blue-600">
                          {formatVND(c.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-zinc-400 text-xs font-semibold">Chưa có số liệu doanh thu khóa học.</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Instructors by Revenue */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Landmark className="h-4.5 w-4.5 text-indigo-600" /> Giảng viên thu nhập cao nhất (Top 5)
            </h2>
            <div className="overflow-x-auto">
              {stats?.topInstructorsByRevenue && stats.topInstructorsByRevenue.length > 0 ? (
                <table className="w-full text-left text-xs font-semibold text-zinc-500">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="pb-3">Giảng viên</th>
                      <th className="pb-3 text-center">Số học viên</th>
                      <th className="pb-3 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stats.topInstructorsByRevenue.map((inst, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-800">{inst.instructorName}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">{inst.email || '---'}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center font-bold text-zinc-900">
                          {inst.studentCount}
                        </td>
                        <td className="py-3 text-right font-black text-indigo-600">
                          {formatVND(inst.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-zinc-400 text-xs font-semibold">Chưa có số liệu thu nhập giảng viên.</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Courses by Enrollment (Bán chạy nhất) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Award className="h-4.5 w-4.5 text-emerald-600" /> Khóa học bán chạy nhất (Top 5)
            </h2>
            <div className="overflow-x-auto">
              {stats?.topCoursesByEnrollment && stats.topCoursesByEnrollment.length > 0 ? (
                <table className="w-full text-left text-xs font-semibold text-zinc-500">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="pb-3">Khóa học</th>
                      <th className="pb-3 text-center">Số lượt đăng ký</th>
                      <th className="pb-3 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stats.topCoursesByEnrollment.map((c, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-3 font-bold text-zinc-800 line-clamp-1 max-w-[200px]" title={c.title}>
                          {c.title}
                        </td>
                        <td className="py-3 text-center font-black text-emerald-600">
                          {c.enrollCount}
                        </td>
                        <td className="py-3 text-right font-bold text-zinc-900">
                          {formatVND(c.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-zinc-400 text-xs font-semibold">Chưa có số liệu ghi danh khóa học.</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Instructors by Enrollment (Xuất sắc nhất) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Users className="h-4.5 w-4.5 text-amber-500" /> Giảng viên xuất sắc nhất (Top 5)
            </h2>
            <div className="overflow-x-auto">
              {stats?.topInstructorsByEnrollment && stats.topInstructorsByEnrollment.length > 0 ? (
                <table className="w-full text-left text-xs font-semibold text-zinc-500">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="pb-3">Giảng viên</th>
                      <th className="pb-3 text-center">Tổng học viên</th>
                      <th className="pb-3 text-right">Tổng doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stats.topInstructorsByEnrollment.map((inst, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-800">{inst.instructorName}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">{inst.email || '---'}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center font-black text-amber-600">
                          {inst.studentCount}
                        </td>
                        <td className="py-3 text-right font-bold text-zinc-900">
                          {formatVND(inst.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-zinc-400 text-xs font-semibold">Chưa có số liệu tổng hợp học viên giảng viên.</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Students by Spending (Mua khóa học nhiều nhất) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <DollarSign className="h-4.5 w-4.5 text-rose-500" /> Học viên mua nhiều nhất (Top 5)
            </h2>
            <div className="overflow-x-auto">
              {stats?.topStudentsBySpending && stats.topStudentsBySpending.length > 0 ? (
                <table className="w-full text-left text-xs font-semibold text-zinc-500">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="pb-3">Học viên</th>
                      <th className="pb-3 text-center">Số khóa mua</th>
                      <th className="pb-3 text-right">Đã thanh toán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stats.topStudentsBySpending.map((s, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-3">
                          <p className="font-bold text-zinc-800">{s.fullName}</p>
                          <p className="text-[10px] text-zinc-400 font-semibold">{s.email}</p>
                        </td>
                        <td className="py-3 text-center font-bold text-zinc-900">
                          {s.courseCount}
                        </td>
                        <td className="py-3 text-right font-black text-rose-500">
                          {formatVND(s.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-zinc-400 text-xs font-semibold">Chưa có số liệu mua khóa học của học viên.</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Students by Enrollment (Join khóa học nhiều nhất) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Users className="h-4.5 w-4.5 text-violet-500" /> Học viên tham gia nhiều nhất (Top 5)
            </h2>
            <div className="overflow-x-auto">
              {stats?.topStudentsByEnrollment && stats.topStudentsByEnrollment.length > 0 ? (
                <table className="w-full text-left text-xs font-semibold text-zinc-500">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="pb-3">Học viên</th>
                      <th className="pb-3 text-center">Số khóa tham gia</th>
                      <th className="pb-3 text-right">Tổng chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stats.topStudentsByEnrollment.map((s, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-3">
                          <p className="font-bold text-zinc-800">{s.fullName}</p>
                          <p className="text-[10px] text-zinc-400 font-semibold">{s.email}</p>
                        </td>
                        <td className="py-3 text-center font-black text-violet-600">
                          {s.courseCount}
                        </td>
                        <td className="py-3 text-right font-bold text-zinc-900">
                          {formatVND(s.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-zinc-400 text-xs font-semibold">Chưa có số liệu tham gia khóa học của học viên.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
