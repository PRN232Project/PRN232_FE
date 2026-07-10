'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, BookOpen, Home } from 'lucide-react';
import apiClient from '@/lib/api-client/config';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [syncing, setSyncing] = useState(true);
  const [synced, setSynced] = useState(false);

  const code = searchParams.get('code');
  const status = searchParams.get('status');
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const syncPayment = async () => {
      if (code === '00' && orderCode) {
        try {
          await apiClient.post(`/student/courses/payment-sync/${orderCode}`);
          setSynced(true);
        } catch (err: any) {
          console.error('Sync payment error:', err);
          // Even if sync fails, the webhook might have already processed it
          setSynced(true);
        }
      } else {
        setSynced(true);
      }
      setSyncing(false);
    };

    syncPayment();
  }, [code, orderCode]);

  if (syncing) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-zinc-500">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-xl shadow-zinc-200/20 max-w-md w-full p-10 text-center">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-2xl font-black text-zinc-900 mb-2">Thanh toán thành công!</h1>
        <p className="text-sm text-zinc-500 mb-2 font-medium">Ghi danh của bạn đã được xác nhận.</p>
        
        {orderCode && (
          <p className="text-xs text-zinc-400 mb-6">
            Mã đơn hàng: <span className="font-mono font-bold text-zinc-600">{orderCode}</span>
          </p>
        )}

        {status === 'PAID' && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-6">
            <CheckCircle2 className="h-3 w-3" />
            Đã thanh toán
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => router.push('/student/courses')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            Vào lớp học của tôi
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => router.push('/courses')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 py-3 text-xs font-bold text-zinc-700 transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-zinc-500">Đang tải...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
