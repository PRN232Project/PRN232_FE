'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, User as UserIcon, LogOut, ChevronDown, Search, Bell, Award, PlayCircle, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isInstructor, isStudent } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when user presses Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isInstructor) return '/instructor/dashboard';
    return '/dashboard';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/courses');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-250/60 bg-white/85 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-6">
        
        {/* Left Area: Logo & Navigation */}
        <div className="flex items-center gap-6 shrink-0">
          <a href="/" className="flex items-center gap-2.5 font-bold text-xl group select-none">
            <div className="w-8 h-8 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-indigo-600 transition-all shadow-sm">
              <BookOpen className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">OLP Academy</span>
          </a>
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
            <a
              href="/courses"
              className="px-3.5 py-2 text-zinc-650 hover:text-zinc-950 hover:bg-zinc-100/70 rounded-lg transition-all"
            >
              Khám Phá
            </a>
            {isStudent && (
              <a
                href="/dashboard"
                className="px-3.5 py-2 text-zinc-650 hover:text-zinc-950 hover:bg-zinc-100/70 rounded-lg transition-all"
              >
                Học Tập Của Tôi
              </a>
            )}
            {isInstructor && (
              <a
                href="/instructor/courses/create"
                className="px-3.5 py-2 text-zinc-650 hover:text-zinc-950 hover:bg-zinc-100/70 rounded-lg transition-all"
              >
                Tạo Khóa Học
              </a>
            )}
          </nav>
        </div>

        {/* Center Area: Premium Search Input */}
        <div className="hidden lg:flex flex-1 max-w-md mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khóa học, kỹ năng..."
              className="w-full pl-10 pr-16 py-2 text-xs text-zinc-800 bg-zinc-100/80 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] text-zinc-400 font-mono font-medium bg-white">Ctrl</span>
              <span className="px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] text-zinc-400 font-mono font-medium bg-white">K</span>
            </div>
          </form>
        </div>

        {/* Right Area: Notifications & Profile Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              {isInstructor && (
                <a
                  href="/instructor/dashboard"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-650 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  Giảng viên
                </a>
              )}

              {/* Notification Bell */}
              <button className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-all relative">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white ring-1 ring-white/50 animate-pulse"></span>
              </button>

              {/* Profile Menu Trigger */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-100 transition-all border border-zinc-200 text-left cursor-pointer"
                >
                  <img
                    src={user.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop'}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover shadow-sm ring-1 ring-zinc-200"
                  />
                  <ChevronDown className="h-4 w-4 hidden md:inline text-zinc-500" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2.5 w-64 origin-top-right rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-black/5 z-40 border border-zinc-100 divide-y divide-zinc-100/80">
                      
                      {/* Header account info */}
                      <div className="px-4 py-3.5 flex items-center gap-3">
                        <img
                          src={user.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop'}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-950 truncate leading-tight">{user.fullName}</p>
                          <p className="text-[10px] font-medium text-zinc-400 truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>

                      {/* Navigation links based on role */}
                      <div className="p-1.5 space-y-0.5">
                        {isStudent && (
                          <>
                            <a
                              href="/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-zinc-650 hover:text-blue-600 hover:bg-zinc-50 rounded-xl transition-all"
                            >
                              <div className="w-6.5 h-6.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                                <PlayCircle className="w-3.5 h-3.5" />
                              </div>
                              Học tập của tôi
                            </a>
                            <a
                              href="/certificates"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-zinc-650 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            >
                              <div className="w-6.5 h-6.5 rounded-lg bg-zinc-50 border border-amber-50 flex items-center justify-center text-amber-500">
                                <Award className="w-3.5 h-3.5" />
                              </div>
                              Chứng chỉ của tôi
                            </a>
                            <a
                              href="/messages"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-zinc-650 hover:text-indigo-650 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                              <div className="w-6.5 h-6.5 rounded-lg bg-zinc-50 border border-indigo-50 flex items-center justify-center text-indigo-500">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </div>
                              Trò chuyện giảng viên
                            </a>
                          </>
                        )}
                        <a
                          href={getDashboardLink()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-zinc-650 hover:text-blue-600 hover:bg-zinc-50 rounded-xl transition-all"
                        >
                          <div className="w-6.5 h-6.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                            <UserIcon className="w-3.5 h-3.5" />
                          </div>
                          Trang cá nhân & Dashboard
                        </a>
                      </div>

                      {/* Logout option */}
                      <div className="p-1.5">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-3 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-left cursor-pointer"
                        >
                          <div className="w-6.5 h-6.5 rounded-lg bg-white border border-rose-100 flex items-center justify-center text-rose-400 shrink-0">
                            <LogOut className="w-3.5 h-3.5" />
                          </div>
                          Đăng xuất
                        </button>
                      </div>
                      
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <a
                href="/auth/login"
                className="px-4 py-2 text-sm font-bold text-zinc-650 hover:text-zinc-950 transition-colors"
              >
                Đăng nhập
              </a>
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer"
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
