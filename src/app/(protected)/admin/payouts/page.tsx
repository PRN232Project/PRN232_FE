'use client';

import React, { useEffect, useState } from 'react';
import { WalletTransaction, adminService } from '@/lib/service';
import { CreditCard, Landmark, CheckCircle } from 'lucide-react';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingPayouts = async () => {
    try {
      const data = await adminService.getPendingPayouts();
      setPayouts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPayouts();
  }, []);

  const handleApprove = async (txId: string) => {
    try {
      await adminService.approvePayout(txId);
      setPayouts((prev) => prev.filter((p) => p.walletTransactionId !== txId));
      alert('Đã phê duyệt lệnh rút tiền và thực hiện chuyển khoản thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi duyệt yêu cầu rút tiền');
    }
  };

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  if (loading) {
    return <div className="text-zinc-50/80 text-center py-10">Đang tải danh sách yêu cầu rút tiền...</div>;
  }

  return (
    <div className="space-y-8">
      {payouts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-16 text-center bg-white">
          <CreditCard className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="font-bold text-zinc-800 text-sm">Hộp thư giao dịch trống</h3>
          <p className="text-xs text-zinc-50/90 mt-1 max-w-sm mx-auto">
            Hiện không có yêu cầu thanh toán/rút tiền nào đang chờ xử lý từ các giảng viên.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {payouts.map((tx) => (
            <div
              key={tx.walletTransactionId}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
            >
              <div className="flex gap-4 items-start flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                  <Landmark className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-800 text-sm">
                    Yêu cầu rút tiền từ Giảng viên
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    Nội dung chuyển khoản: <span className="font-semibold text-zinc-700">{tx.description}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3.5 text-[10px] text-zinc-400 pt-1">
                    <span>Mã GD: <span className="font-mono">{tx.walletTransactionId}</span></span>
                    <span>•</span>
                    <span>Thời gian: {new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3 shrink-0 w-full md:w-auto border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0">
                <span className="text-lg font-extrabold text-red-600">
                  -{formatVND(tx.amount)}
                </span>
                <button
                  onClick={() => handleApprove(tx.walletTransactionId)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle className="h-4.5 w-4.5" />
                  Phê duyệt thanh toán
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
