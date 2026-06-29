'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Wallet, WalletTransaction, instructorService } from '@/lib/service';
import { Landmark, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function InstructorWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('Vietcombank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const loadWalletData = async () => {
    if (!user) return;
    try {
      const w = await instructorService.getWallet(user.userId);
      setWallet(w);
      const tx = await instructorService.getTransactions(w.walletId);
      setTransactions(tx);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;

    const parsedAmount = parseInt(amount);
    if (!parsedAmount || parsedAmount < 50000) {
      alert('Số tiền rút tối thiểu là 50.000 đ');
      return;
    }
    if (parsedAmount > wallet.balance) {
      alert('Số dư ví không đủ để rút');
      return;
    }

    setActionLoading(true);
    try {
      const note = `Rút về ngân hàng ${bankName} - STK: ${accountNumber} - Tên: ${accountName}`;
      await instructorService.requestPayout(wallet.walletId, parsedAmount, note);
      
      setAmount('');
      setAccountNumber('');
      setAccountName('');

      await loadWalletData();
      alert('Yêu cầu rút tiền của bạn đã gửi thành công và đang chờ Admin duyệt!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi yêu cầu rút tiền');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            <Clock className="h-3 w-3" /> Đang duyệt
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            <CheckCircle2 className="h-3 w-3" /> Thành công
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            <XCircle className="h-3 w-3" /> Thất bại
          </span>
        );
      default:
        return null;
    }
  };

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  if (loading) {
    return <div className="text-zinc-50/80 text-center py-10">Đang tải thông tin ví...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl bg-zinc-900 p-6 text-white shadow-lg border border-zinc-800/85">
            <div className="flex items-center gap-2 text-zinc-400">
              <Landmark className="h-5 w-5 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Số dư khả dụng</span>
            </div>
            <h2 className="text-3xl font-extrabold mt-4 text-white">
              {wallet ? formatVND(wallet.balance) : '0 đ'}
            </h2>
            <p className="text-[10px] text-zinc-500 mt-2">Ví cập nhật tự động khi có học viên đăng ký học.</p>
          </div>

          <form onSubmit={handleWithdraw} className="rounded-xl border border-zinc-300 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-3">Yêu cầu rút tiền</h3>
            
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Chọn ngân hàng</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-lg border border-zinc-350 px-3 py-2 text-xs text-zinc-900 font-bold bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Vietcombank">Vietcombank</option>
                <option value="Techcombank">Techcombank</option>
                <option value="Agribank">Agribank</option>
                <option value="MB Bank">MB Bank</option>
                <option value="ACB">ACB</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Số tài khoản</label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Ví dụ: 1023904..."
                className="w-full rounded-lg border border-zinc-350 px-3 py-2 text-xs text-zinc-900 font-bold focus:outline-none focus:border-indigo-500 placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Tên chủ tài khoản</label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                placeholder="NGUYEN VAN A"
                className="w-full rounded-lg border border-zinc-350 px-3 py-2 text-xs text-zinc-900 font-bold focus:outline-none focus:border-indigo-500 placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Số tiền rút (đ)</label>
              <input
                type="number"
                required
                min={50000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Tối thiểu 50.000đ"
                className="w-full rounded-lg border border-zinc-350 px-3 py-2 text-xs text-zinc-900 font-bold focus:outline-none focus:border-indigo-500 placeholder:text-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading || !wallet || wallet.balance < 50000}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-semibold text-white shadow-md transition-all cursor-pointer text-center disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              {actionLoading ? 'Đang thực hiện...' : 'Gửi yêu cầu rút tiền'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-200 pb-3 mb-4">Lịch sử giao dịch</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 text-xs">Chưa có lịch sử giao dịch nào phát sinh.</div>
          ) : (
            <div className="divide-y divide-zinc-200 overflow-y-auto max-h-[500px]">
              {transactions.map((tx) => (
                <div key={tx.walletTransactionId} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      tx.type === 2 
                        ? 'bg-green-50 text-green-600 border border-green-100' 
                        : 'bg-red-50 text-red-500 border border-red-100'
                    }`}>
                      {tx.type === 2 ? <ArrowDownLeft className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-800">{tx.description || (tx.type === 2 ? 'Cộng doanh thu' : 'Yêu cầu rút tiền')}</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-1">Giao dịch: {new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-extrabold ${tx.type === 2 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 2 ? '+' : '-'}{formatVND(tx.amount)}
                    </span>
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
