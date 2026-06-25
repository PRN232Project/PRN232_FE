'use client';

import React from 'react';
import Link from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isInstructor } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isInstructor) return '/instructor/dashboard';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <BookOpen className="h-6 w-6" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">OLP Academy</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <a href="/courses" className="hover:text-blue-600 transition-colors">Khóa Học</a>
          </nav>
        </div>

        {/* Auth status / actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-100 transition-all border border-zinc-200 text-left"
              >
                <img
                  src={user.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop'}
                  alt={user.fullName}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden md:inline text-sm font-medium pr-1 text-zinc-700">{user.fullName}</span>
                <ChevronDown className="h-4 w-4 hidden md:inline text-zinc-500" />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-40 border border-zinc-100">
                    <div className="px-3 py-2 border-b border-zinc-150 mb-1">
                      <p className="text-xs text-zinc-500">Đang đăng nhập với tư cách</p>
                      <p className="text-sm font-semibold text-zinc-800 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                        {user.role === 0 ? 'Quản trị viên' : user.role === 1 ? 'Giảng viên' : 'Học viên'}
                      </span>
                    </div>

                    <a
                      href={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-zinc-500" />
                      Trang cá nhân & Dashboard
                    </a>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-left border-t border-zinc-100 mt-1 pt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a
                href="/auth/login"
                className="text-sm font-medium text-zinc-700 hover:text-blue-600 transition-colors"
              >
                Đăng nhập
              </a>
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Đăng ký
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
