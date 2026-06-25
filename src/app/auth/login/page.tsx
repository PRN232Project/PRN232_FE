'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null);
    setEmail(demoEmail);
    try {
      await login(demoEmail, 'password123');
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900">
          Đăng nhập vào OLP
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-650">
          Nhập tài khoản để tiếp tục học tập hoặc giảng dạy
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-755">
            {error}
          </div>
        )}

        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-zinc-700 mb-1">
              Địa chỉ Email
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="nhap@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Đăng nhập'
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-200">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
          Tài khoản dùng thử nhanh (Quick Login)
        </h3>
        <div className="mt-4 space-y-2">
          <button
            onClick={() => handleQuickLogin('student@olp.com')}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/80 p-3 text-sm text-zinc-700 transition-all text-left cursor-pointer"
          >
            <div>
              <span className="font-semibold block">Học viên (Student)</span>
              <span className="text-xs text-zinc-550">student@olp.com</span>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
          </button>

          <button
            onClick={() => handleQuickLogin('teacher@olp.com')}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/80 p-3 text-sm text-zinc-700 transition-all text-left cursor-pointer"
          >
            <div>
              <span className="font-semibold block">Giảng viên (Instructor)</span>
              <span className="text-xs text-zinc-550">teacher@olp.com</span>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
          </button>

          <button
            onClick={() => handleQuickLogin('admin@olp.com')}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/80 p-3 text-sm text-zinc-700 transition-all text-left cursor-pointer"
          >
            <div>
              <span className="font-semibold block">Quản trị viên (Admin)</span>
              <span className="text-xs text-zinc-555">admin@olp.com</span>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <a href="/auth/register" className="text-xs text-blue-600 hover:underline">Chưa có tài khoản? Đăng ký ngay</a>
      </div>
    </>
  );
}
