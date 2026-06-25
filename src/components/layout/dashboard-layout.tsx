'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, ChevronDown, Bell } from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  title: string;
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  sidebarContent,
  children,
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleLabel = (role?: number) => {
    if (role === 0) return 'Admin';
    if (role === 1) return 'Giảng viên';
    return 'Học viên';
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* 1. Left Sidebar Wrapper */}
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-zinc-200 bg-zinc-900 text-zinc-300">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-zinc-800 shrink-0">
          <GraduationCap className="h-7 w-7 text-blue-400" />
          <span className="text-base font-bold text-white tracking-wide">OLP Academy</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {/* 2. Right Main Viewport */}
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8 shrink-0">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
            {title}
          </h2>

          <div className="flex items-center gap-4">
            <button className="relative p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition-colors">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
            </button>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-100 transition-all border border-zinc-200 text-left"
                >
                  <img
                    src={user.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop'}
                    alt={user.fullName}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-zinc-700 hidden sm:inline">{user.fullName}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-450 hidden sm:inline" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5 z-40 border border-zinc-100">
                      <div className="px-3 py-2 border-b border-zinc-150 mb-1">
                        <p className="text-[10px] text-zinc-450 font-semibold">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
