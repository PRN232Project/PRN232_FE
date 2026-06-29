'use client';

import React, { useEffect, useState } from 'react';
import { User, UserRole, adminService } from '@/lib/service';
import { Search, Lock, Unlock, ArrowUpDown, Shield, UserCheck, BookOpen, Filter } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'fullName' | 'email'>('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
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
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đổi vai trò');
    }
  };

  // Toggle sorting order
  const handleSort = (field: 'fullName' | 'email') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Client-side filtering & sorting
  const filteredUsers = users
    .filter((u) => {
      // 1. Search Query filter
      const query = search.toLowerCase();
      const matchesSearch =
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query);

      // 2. Role filter
      const matchesRole =
        roleFilter === 'all' || u.role.toString() === roleFilter;

      // 3. Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !u.isDeleted) ||
        (statusFilter === 'locked' && u.isDeleted);

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      const fieldA = (a[sortBy] || '').toString().toLowerCase();
      const fieldB = (b[sortBy] || '').toString().toLowerCase();

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getRoleIconAndBadge = (role: number) => {
    if (role === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 border border-purple-100 shadow-sm">
          <Shield className="h-3 w-3" /> Admin
        </span>
      );
    }
    if (role === 1) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100 shadow-sm">
          <BookOpen className="h-3 w-3" /> Giảng viên
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-100 shadow-sm">
        <UserCheck className="h-3 w-3" /> Học viên
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Quản trị Người dùng</h1>
          <p className="text-xs text-zinc-500">Xem danh sách thành viên, phân quyền hoặc khóa/mở khóa tài khoản người dùng.</p>
        </div>
      </div>

      {/* Filter and search controls bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-350 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 font-bold focus:border-indigo-500 outline-none placeholder:text-zinc-500"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 px-3 text-xs text-zinc-700 focus:border-blue-500 outline-none"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="0">Quản trị viên (Admin)</option>
            <option value="1">Giảng viên (Instructor)</option>
            <option value="2">Học viên (Student)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 px-3 text-xs text-zinc-700 focus:border-blue-500 outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Bình thường (Đang chạy)</option>
            <option value="locked">Đã khóa</option>
          </select>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-end text-xs font-semibold text-zinc-500 px-2 gap-1 bg-zinc-50 rounded-lg border border-zinc-200/70 py-2 sm:py-0">
          <Filter className="h-3.5 w-3.5 text-zinc-400" />
          Hiển thị: <span className="text-zinc-800 font-bold">{filteredUsers.length}</span> / {users.length} thành viên
        </div>
        
      </div>

      {loading ? (
        <div className="text-zinc-500 text-center py-20 bg-white rounded-xl border border-zinc-200 shadow-sm">
          Đang tải danh sách người dùng...
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider select-none">
                  <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/80 transition-colors" onClick={() => handleSort('fullName')}>
                    <span className="flex items-center gap-1.5">
                      Họ và tên <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
                    </span>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/80 transition-colors" onClick={() => handleSort('email')}>
                    <span className="flex items-center gap-1.5">
                      Địa chỉ Email <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
                    </span>
                  </th>
                  <th className="px-6 py-4">Vai trò hiện tại</th>
                  <th className="px-6 py-4">Thay đổi vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Khóa / Mở khóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredUsers.map((item) => (
                  <tr key={item.userId} className="hover:bg-zinc-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 font-semibold text-zinc-900 flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop'}
                        alt={item.fullName}
                        className="h-8 w-8 rounded-full object-cover border border-zinc-200"
                      />
                      {item.fullName}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">{item.email}</td>
                    <td className="px-6 py-4">{getRoleIconAndBadge(item.role)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={item.role}
                        onChange={(e) => handleRoleChange(item.userId, parseInt(e.target.value))}
                        className="rounded-lg border border-zinc-300 py-1 px-2.5 text-xs text-zinc-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value={0}>Admin</option>
                        <option value={1}>Instructor</option>
                        <option value={2}>Student</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {item.isDeleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 shadow-sm">
                          Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 shadow-sm">
                          Bình thường
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleLock(item.userId)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer shadow-sm border ${
                          item.isDeleted
                            ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
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
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-zinc-400 font-medium">
                      Không tìm thấy người dùng nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
