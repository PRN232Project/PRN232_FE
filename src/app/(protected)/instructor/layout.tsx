'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import RoleNavMenu from '@/components/layout/role-nav-menu';
import { UserRole } from '@/lib/service';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes('/courses')) return 'Quản lý khóa học';
    if (pathname.includes('/wallet')) return 'Ví tiền & Doanh thu';
    if (pathname.includes('/messages')) return 'Hộp thư Giảng viên';
    return 'Dashboard Giảng viên';
  };

  return (
    <DashboardLayout
      title={getPageTitle()}
      sidebarContent={<RoleNavMenu role={UserRole.Instructor} />}
    >
      {children}
    </DashboardLayout>
  );
}
