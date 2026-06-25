'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import RoleNavMenu from '@/components/layout/role-nav-menu';
import { UserRole } from '@/lib/service';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes('/users')) return 'Quản lý Người dùng';
    if (pathname.includes('/courses')) return 'Duyệt Khóa Học';
    if (pathname.includes('/payouts')) return 'Yêu cầu rút tiền';
    return 'Tổng quan Quản trị';
  };

  return (
    <DashboardLayout
      title={getPageTitle()}
      sidebarContent={<RoleNavMenu role={UserRole.Admin} />}
    >
      {children}
    </DashboardLayout>
  );
}
