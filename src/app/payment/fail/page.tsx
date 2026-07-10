'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderCode = searchParams.get('orderCode');

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-xl shadow-zinc-200/20 max-w-md w-full p-10 text-center">
        
        {/* Fail Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
          <XCircle className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-2xl font-black text-zinc-900 mb-2">Thanh toán thất bại</h1>
        <p className="text-sm text-zinc-500 mb-2 font-medium">Giao dịch của bạn đã bị hủy hoặc không thành công.</p>
        
        {orderCode && (
          <p className="text-xs text-zinc-400 mb-6">
            Mã đơn hàng: <span className="font-mono font-bold text-zinc-600">{orderCode}</span>
          </p>
        )}

        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1.5 text-[10px] font-bold text-red-700 uppercase tracking-wider mb-6">
          <XCircle className="h-3 w-3" />
          Thanh toán không thành công
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => router.back()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Thử thanh toán lại
          </button>

          <button
            onClick={() => router.push('/courses')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 py-3 text-xs font-bold text-zinc-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách khóa học
          </button>
        </div>
      </div>
    </div>
  );
}
