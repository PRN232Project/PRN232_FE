'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/service';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(fullName, email, role);
      // Redirect to OTP verification page
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại, vui lòng thử lại');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900">
          Đăng ký tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Tham gia học tập hoặc bắt đầu giảng dạy ngay hôm nay
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
              Họ và Tên
            </label>
            <input
              id="name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="nva@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Bạn đăng ký với vai trò gì?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                role === UserRole.Student 
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold' 
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value={UserRole.Student}
                  checked={role === UserRole.Student}
                  onChange={() => setRole(UserRole.Student)}
                  className="sr-only"
                />
                <span className="text-sm">Học viên</span>
                <span className="text-[10px] text-zinc-500 font-normal mt-0.5">Muốn học tập</span>
              </label>

              <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                role === UserRole.Instructor 
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold' 
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value={UserRole.Instructor}
                  checked={role === UserRole.Instructor}
                  onChange={() => setRole(UserRole.Instructor)}
                  className="sr-only"
                />
                <span className="text-sm">Giảng viên</span>
                <span className="text-[10px] text-zinc-500 font-normal mt-0.5">Muốn mở lớp dạy</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Đăng ký tài khoản'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <a href="/auth/login" className="text-xs text-indigo-600 hover:underline">Đã có tài khoản? Đăng nhập ngay</a>
      </div>
    </>
  );
}
