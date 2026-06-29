'use client';

import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-zinc-400 border-t border-white/10 relative overflow-hidden">
      {/* Subtle glow background */}
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-16">
          
          {/* Column 1: Logo and Bio */}
          <div className="space-y-5">
            <a href="/" className="flex items-center gap-2.5 font-bold text-xl group select-none">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-white tracking-tight">OLP Academy</span>
            </a>
            <p className="text-xs leading-relaxed text-zinc-500 font-medium">
              Nền tảng học trực tuyến chất lượng cao. Cung cấp đề cương học tập thông minh, luyện thi nói & viết tự động và chấm điểm khảo thí bằng Trí Tuệ Nhân Tạo (AWS AI).
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors p-1.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors p-1.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.48-10-10-10z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors p-1.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Khám phá</h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="/courses" className="hover:text-white transition-colors">Thư viện khóa học</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Đề cương học tập</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Khảo thí AI Speaking</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Chấm điểm AI Writing</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Tài nguyên</h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="#" className="hover:text-white transition-colors">Tài liệu học tập</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Hướng dẫn sử dụng</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Đăng ký nhận tin</h3>
            <p className="text-xs leading-relaxed text-zinc-500 font-medium">
              Nhận thông báo về các khóa học mới và cập nhật tính năng AI hữu ích nhất.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 focus-within:border-blue-500/40 transition-colors">
              <input
                type="email"
                required
                placeholder="Email của bạn..."
                className="w-full bg-transparent border-none py-2 px-3 text-xs text-white focus:outline-none placeholder:text-zinc-500 font-medium"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
              >
                Đăng ký
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Area */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500">
          <p>© {new Date().getFullYear()} OLP Academy. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-1.5">
            <span>Thiết kế bằng cả trái tim</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>tại PRN232 Group 4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
