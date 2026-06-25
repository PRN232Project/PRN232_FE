'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/dashboard-layout';
import RoleNavMenu from '@/components/layout/role-nav-menu';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500 text-sm">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // Compute title label dynamically based on path
  const getPageTitle = () => {
    if (pathname.startsWith('/admin')) {
      if (pathname.includes('/users')) return 'Quản lý Người dùng';
      if (pathname.includes('/courses')) return 'Duyệt Khóa Học';
      if (pathname.includes('/payouts')) return 'Yêu cầu rút tiền';
      return 'Tổng quan Quản trị';
    }
    if (pathname.startsWith('/instructor')) {
      if (pathname.includes('/courses')) return 'Quản lý khóa học';
      if (pathname.includes('/wallet')) return 'Ví tiền & Doanh thu';
      if (pathname.includes('/messages')) return 'Hộp thư Giảng viên';
      return 'Dashboard Giảng viên';
    }
    if (pathname.startsWith('/messages')) return 'Hộp thư của tôi';
    if (pathname.startsWith('/certificates')) return 'Chứng chỉ của tôi';
    return 'Khóa học của tôi';
  };

  return (
    <DashboardLayout
      title={getPageTitle()}
      sidebarContent={<RoleNavMenu role={user.role} />}
    >
      {children}
    </DashboardLayout>
  );
}
