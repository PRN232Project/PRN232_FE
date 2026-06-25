'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Users, BookOpenCheck, CreditCard, BookOpen, Wallet, MessageSquare, Award, LogOut, Home } from 'lucide-react';
import { UserRole } from '@/lib/service/auth/type';

interface RoleNavMenuProps {
  role: UserRole;
}

export const RoleNavMenu: React.FC<RoleNavMenuProps> = ({ role }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  // 1. Admin Menu Items
  const adminMenu = [
    { name: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Người dùng', href: '/admin/users', icon: Users },
    { name: 'Duyệt khóa học', href: '/admin/courses', icon: BookOpenCheck },
    { name: 'Yêu cầu rút tiền', href: '/admin/payouts', icon: CreditCard },
  ];

  // 2. Instructor Menu Items
  const instructorMenu = [
    { name: 'Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
    { name: 'Khóa học của tôi', href: '/instructor/courses', icon: BookOpen },
    { name: 'Ví & Doanh thu', href: '/instructor/wallet', icon: Wallet },
    { name: 'Tin nhắn', href: '/instructor/messages', icon: MessageSquare },
  ];

  // 3. Student Menu Items
  const studentMenu = [
    { name: 'Khóa học của tôi', href: '/dashboard', icon: BookOpen },
    { name: 'Chứng chỉ của tôi', href: '/certificates', icon: Award },
    { name: 'Trò chuyện', href: '/messages', icon: MessageSquare },
  ];

  const getMenu = () => {
    if (role === UserRole.Admin) return adminMenu;
    if (role === UserRole.Instructor) return instructorMenu;
    return studentMenu;
  };

  const menuItems = getMenu();

  return (
    <div className="flex flex-col h-full justify-between">
      <nav className="space-y-1.5 px-4 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href.startsWith('/instructor/courses') && pathname.startsWith('/instructor/courses'));
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? role === UserRole.Admin 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                    : role === UserRole.Instructor 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                  : 'hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* Footer controls inside sidebar */}
      <div className="border-t border-zinc-850 p-4 bg-zinc-950/60 space-y-2.5">
        <a
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 py-2 text-xs font-semibold border border-zinc-700 text-zinc-300 transition-colors"
        >
          <Home className="h-4 w-4" />
          Về Trang chủ
        </a>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 hover:bg-red-900/25 hover:text-red-400 py-2 text-xs font-bold border border-zinc-700 transition-colors text-left"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default RoleNavMenu;
