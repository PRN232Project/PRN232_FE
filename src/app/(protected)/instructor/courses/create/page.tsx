'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { instructorService } from '@/lib/service';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [languageId, setLanguageId] = useState('lang-vi');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await instructorService.createCourse(user.userId, {
        title,
        description,
        price,
        languageId,
        image: image || undefined
      });
      router.push('/instructor/courses');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo khóa học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/instructor/courses')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Tạo khóa học mới</h1>
          <p className="text-xs text-zinc-500">Nhập các thông tin cơ bản để xây dựng khóa học</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Tiêu đề khóa học
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Lập trình C# cơ bản từ zero..."
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-955/80 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Mô tả khóa học
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Viết mô tả tóm tắt nội dung học tập và kỹ năng đạt được sau khóa học..."
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-955/80 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Giá khóa học (VND)
            </label>
            <input
              type="number"
              required
              min={0}
              step={1000}
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-955/80 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Ngôn ngữ
            </label>
            <select
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)}
              className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-700 bg-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="lang-vi">Tiếng Việt</option>
              <option value="lang-en">Tiếng Anh</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Ảnh bìa khóa học (URL)
          </label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Link ảnh bìa từ Unsplash..."
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-955/80 focus:border-indigo-500 focus:outline-none"
          />
          <p className="text-[10px] text-zinc-400 mt-1">Để trống để sử dụng ảnh mặc định của hệ thống.</p>
        </div>

        <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/instructor/courses')}
            className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100/10 px-4 py-2.5 text-xs font-semibold text-zinc-600 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow transition-all disabled:bg-indigo-400 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Tạo khóa học'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
