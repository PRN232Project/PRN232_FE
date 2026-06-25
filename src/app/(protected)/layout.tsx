'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/shared/Navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      // Enforce role-based routing
      if (user.role === 0 && !pathname.startsWith('/admin')) {
        // Admin must be inside /admin routes
        router.replace('/admin/dashboard');
      } else if (user.role === 1 && !pathname.startsWith('/instructor')) {
        // Instructor must be inside /instructor routes
        router.replace('/instructor/dashboard');
      } else if (user.role === 2 && (pathname.startsWith('/admin') || pathname.startsWith('/instructor'))) {
        // Student cannot access admin/instructor routes
        router.replace('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500 text-sm">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // If user is Admin (0) or Instructor (1), render children directly.
  // Their nested layout files under /admin/layout.tsx and /instructor/layout.tsx
  // will wrap them inside the DashboardLayout with Sidebar.
  if (user.role === 0 || user.role === 1) {
    return <>{children}</>;
  }

  // For Student (role === 2): Render top Navbar and a clean, centered interface
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
