'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/service';
import { ShieldAlert, Loader2 } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Thiếu thông tin email để xác thực');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.verifyEmail(email, otpCode);
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-600 text-white shadow-md">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900">
          Xác thực tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Mã OTP đã được gửi đến email: <span className="font-semibold text-zinc-800">{email}</span>
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200 text-sm text-green-700">
            Kích hoạt tài khoản thành công! Bạn đang được chuyển hướng sang trang đăng nhập...
          </div>
        )}

        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-zinc-700 mb-1 text-center">
            Mã OTP (6 chữ số)
          </label>
          <input
            id="otp"
            type="text"
            required
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className="block w-full text-center tracking-widest text-2xl rounded-lg border border-zinc-300 px-3 py-3 text-zinc-950 placeholder-zinc-300 focus:border-teal-500 focus:outline-none focus:ring-teal-500"
            placeholder="123456"
          />
          <p className="text-[11px] text-zinc-500 text-center mt-2">
            Mẹo: Nhập mã bất kỳ (ví dụ: 123456) để xác thực giả lập.
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || success}
            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-teal-400 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Kích hoạt tài khoản'
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Đang tải trang xác thực...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
