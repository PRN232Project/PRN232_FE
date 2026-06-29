'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Certificate, studentService } from '@/lib/service';
import { Award, Printer, X } from 'lucide-react';

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadCertificates = async () => {
      try {
        const data = await studentService.getCertificates(user.userId);
        setCertificates(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, [user]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return <div className="text-zinc-50/80 text-center py-10">Đang tải chứng chỉ...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950">Chứng chỉ của tôi</h1>
        <p className="mt-1 text-sm text-zinc-50/90">
          Nơi lưu trữ các chứng nhận hoàn thành khóa học xuất sắc của bạn
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center bg-white">
          <Award className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
          <p className="text-zinc-600 text-sm font-medium">Bạn chưa nhận được chứng chỉ nào</p>
          <p className="text-xs text-zinc-400 mt-1">Hãy hoàn thành 100% nội dung một khóa học bất kỳ để mở khóa chứng chỉ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert.certificateId}
              className="flex items-center gap-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Award className="h-8 w-8" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-zinc-800 text-sm truncate">{cert.courseTitle}</h3>
                <p className="text-xs text-zinc-500 font-semibold mt-1">Ngày cấp: {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}</p>
                
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setActiveCert(cert)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors cursor-pointer"
                  >
                    Xem chứng chỉ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6 print:hidden">
              <span className="text-sm font-semibold text-zinc-800">Bản xem trước chứng chỉ</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100/10 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  In / Lưu PDF
                </button>
                <button
                  onClick={() => setActiveCert(null)}
                  className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-50/80 hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div id="printable-certificate" className="relative border-[12px] border-amber-800 bg-amber-50/20 p-8 md:p-14 text-center font-serif shadow-inner">
              <div className="absolute top-2 left-2 border-t-2 border-l-2 border-amber-800 w-6 h-6"></div>
              <div className="absolute top-2 right-2 border-t-2 border-r-2 border-amber-800 w-6 h-6"></div>
              <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-amber-800 w-6 h-6"></div>
              <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-amber-800 w-6 h-6"></div>

              <div className="mx-auto max-w-2xl space-y-6">
                <p className="text-amber-800 text-xs font-sans tracking-[0.25em] font-bold uppercase">Chứng Nhận Hoàn Thành</p>
                <h2 className="text-3xl md:text-5xl font-semibold text-zinc-800 py-3">CHỨNG CHỈ TỐT NGHIỆP</h2>
                <p className="text-zinc-500 font-sans text-xs italic">Chứng nhận danh dự này được trân trọng trao cho</p>
                <p className="text-2xl md:text-3xl font-bold text-zinc-950 border-b-2 border-zinc-300 pb-2 max-w-md mx-auto italic">
                  {activeCert.studentName}
                </p>
                <p className="text-zinc-500 font-sans text-xs max-w-lg mx-auto leading-relaxed">
                  Vì đã hoàn thành xuất sắc khóa học trực tuyến với kết quả đánh giá cao nhất tại OLP Academy. Khóa học được chứng thực chất lượng giảng dạy:
                </p>
                <p className="text-lg md:text-xl font-bold text-zinc-800 italic">
                  "{activeCert.courseTitle}"
                </p>
                <p className="text-zinc-400 font-sans text-[10px] mt-4">
                  Mã số chứng thực: <span className="font-semibold text-zinc-600 uppercase font-mono">{activeCert.certificateId}</span>
                </p>

                <div className="grid grid-cols-2 gap-8 pt-8 items-end">
                  <div className="space-y-1 text-center font-sans">
                    <p className="text-sm font-semibold text-zinc-800 italic underline decoration-zinc-400 underline-offset-4">
                      {activeCert.instructorName}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Giảng Viên Hướng Dẫn</p>
                  </div>
                  <div className="space-y-1 text-center font-sans">
                    <p className="text-sm font-bold text-zinc-800 italic">Ban Quản Trị OLP</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Đại Diện Học Viện</p>
                  </div>
                </div>

                <div className="pt-6 font-sans flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                  <span>Cấp ngày: {new Date(activeCert.issuedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 15px solid #78350f !important;
            background-color: #fef3c7 !important;
            padding: 40px !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
