'use client';

import React, { useEffect, useState } from 'react';
import { User, UserRole, adminService } from '@/lib/service';
import { Search, Lock, Unlock } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async (query?: string) => {
    try {
      const data = await adminService.getUsers(query);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleToggleLock = async (userId: string) => {
    try {
      const updatedUser = await adminService.toggleUserLock(userId);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, isDeleted: updatedUser.isDeleted } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi khi khóa tài khoản');
    }
  };

  const handleRoleChange = async (userId: string, newRole: number) => {
    try {
      await adminService.changeUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, role: newRole } : u))
      );
      alert('Thay đổi vai trò người dùng thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đổi vai trò');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Quản trị Người dùng</h1>
          <p className="text-xs text-zinc-500">Xem danh sách thành viên, phân quyền hoặc khóa tài khoản</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-sm w-full">
          <Search className="absolute left-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-4 text-xs focus:border-blue-500 focus:outline-none"
          />
        </form>
      </div>

      {loading ? (
        <div className="text-zinc-500 text-center py-10">Đang tải danh sách người dùng...</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Họ và tên</th>
                  <th className="px-6 py-4">Địa chỉ Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {users.map((item) => (
                  <tr key={item.userId} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4 font-semibold text-zinc-900 flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop'}
                        alt={item.fullName}
                        className="h-8 w-8 rounded-full object-cover border border-zinc-200"
                      />
                      {item.fullName}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">{item.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={item.role}
                        onChange={(e) => handleRoleChange(item.userId, parseInt(e.target.value))}
                        className="rounded border border-zinc-300 py-1 px-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value={0}>Quản trị viên (Admin)</option>
                        <option value={1}>Giảng viên (Instructor)</option>
                        <option value={2}>Học viên (Student)</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {item.isDeleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-650 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-250">
                          Bình thường
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleLock(item.userId)}
                        className={`inline-flex items-center gap-1 rounded px-3 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                          item.isDeleted
                            ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-50 hover:bg-red-100 text-red-650 border border-red-200'
                        }`}
                      >
                        {item.isDeleted ? (
                          <>
                            <Unlock className="h-3.5 w-3.5" /> Mở khóa
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5" /> Khóa tài khoản
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
