'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Course, Enrollment, courseService, studentService } from '@/lib/service';
import { ChevronRight, Play, BookOpen, FileText, CheckCircle2, Lock, ArrowLeft, Users, Clock, Sparkles } from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { user, isStudent, isAdmin, isInstructor } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const loadData = async () => {
      try {
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);

        // Check if student is already enrolled
        if (user && user.role === 2) {
          const myCourses = await studentService.getMyCourses(user.userId);
          const enrollment = myCourses.find((e) => e.courseId === courseId);
          if (enrollment) {
            setEnrolled(enrollment);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/courses/${courseId}`);
      return;
    }
    if (!isStudent) return;

    setActionLoading(true);
    try {
      const enrollment = await studentService.enrollInCourse(user.userId, courseId);
      setEnrolled(enrollment);
      router.push(`/learning/${courseId}`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đăng ký khóa học');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <p className="text-red-500 font-extrabold text-base">Không tìm thấy khóa học này.</p>
        <button onClick={() => router.push('/courses')} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return price.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="bg-zinc-50/50 min-h-screen pb-20">
      
      {/* Course Hero Banner Header (Slate Dark Gradient) */}
      <section className="relative bg-slate-950 text-white py-16 sm:py-20 overflow-hidden border-b border-white/10">
        <div className="absolute top-0 right-0 w-[45%] h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[10%] w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5">
            <button 
              onClick={() => router.push('/courses')} 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors group cursor-pointer mb-2"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Quay lại danh sách
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider select-none">
              <Sparkles className="h-3 w-3 animate-pulse" />
              {course.languageName}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {course.title}
            </h1>
            
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-zinc-300">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-blue-400" />
                <span>{course.enrollmentCount} học viên đã đăng ký</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-indigo-400" />
                <span>12 giờ học trực tuyến</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">GV</div>
                <span>Giảng viên: <strong className="text-white">{course.instructorName}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          
          {/* Left Column: Syllabus & Instructor Details */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Course Syllabus Accordion UI */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-7 w-1 bg-blue-600 rounded-full" />
                <h2 className="text-lg sm:text-xl font-black text-zinc-950">Chương trình học (Syllabus)</h2>
              </div>
              
              <div className="space-y-4">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((mod, index) => (
                    <div key={mod.moduleId} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                      <div className="bg-zinc-50/50 px-5 py-4 border-b border-zinc-200/80 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phần {index + 1}</span>
                          <h3 className="font-extrabold text-sm text-zinc-900 leading-tight">{mod.title}</h3>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
                          {mod.lessons?.length || 0} bài học
                        </span>
                      </div>

                      <div className="divide-y divide-zinc-100">
                        {mod.lessons && mod.lessons.length > 0 ? (
                          mod.lessons.map((les) => (
                            <div key={les.lessonId} className="p-5 space-y-3.5 hover:bg-zinc-50/30 transition-colors">
                              <h4 className="font-bold text-xs text-zinc-800 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                {les.title}
                              </h4>
                              
                              <div className="space-y-2.5 pl-3.5">
                                {les.lessonItems?.map((item) => (
                                  <div key={item.lessonItemId} className="flex items-center justify-between text-xs font-medium text-zinc-500">
                                    <div className="flex items-center gap-2.5">
                                      {item.type === 0 ? (
                                        <Play className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                      ) : item.type === 1 ? (
                                        <BookOpen className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                      ) : (
                                        <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                      )}
                                      <span className="text-zinc-600 hover:text-zinc-900 transition-colors">{item.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-zinc-400 shrink-0">
                                      <span>{item.durationMinutes} phút</span>
                                      {!enrolled && <Lock className="h-3 w-3 text-zinc-400" />}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-xs text-zinc-400 text-center font-medium">Chưa có bài học nào được tạo.</div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border border-dashed border-zinc-300 rounded-2xl bg-zinc-50/50">
                    <p className="text-zinc-500 text-xs font-semibold">Chương trình học đang được giảng viên cập nhật thêm.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Details Card */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-zinc-950 mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Thông tin giảng viên chuyên trách
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=150&auto=format&fit=crop"
                  alt={course.instructorName}
                  className="h-20 w-20 rounded-2xl object-cover border border-zinc-200 shadow-sm shrink-0 ring-4 ring-zinc-50"
                />
                <div className="space-y-2">
                  <div>
                    <h4 className="font-extrabold text-zinc-900 text-base">{course.instructorName}</h4>
                    <p className="text-xs text-zinc-400 font-semibold mt-0.5">Học viện OLP Academy</p>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    {course.instructorBio || 'Giảng viên dày dặn kinh nghiệm, chuyên ngành giảng dạy Tiếng Anh học thuật & lập trình thực chiến.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar Column: Checkout Card Widget */}
          <div className="space-y-6">
            <div className="sticky top-24 rounded-3xl border border-zinc-200/60 bg-white p-5 shadow-xl shadow-zinc-200/30">
              
              {/* Media Thumbnail Grid wrapper */}
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100 mb-5 relative group border border-zinc-200">
                <img src={course.image} alt={course.title} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center" />
              </div>

              {/* Pricing section */}
              <div className="mb-6 space-y-1">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Học phí trọn gói</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-950">{formatPrice(course.price)}</span>
                </div>
                {course.price > 0 && (
                  <p className="text-[10px] text-zinc-400 font-medium">Mua một lần sở hữu khóa học vĩnh viễn</p>
                )}
              </div>

              {/* Interactive CTA buttons */}
              <div className="space-y-3.5">
                {user ? (
                  <>
                    {isAdmin || isInstructor ? (
                      <div className="rounded-xl bg-amber-50/50 border border-amber-200/80 p-4 text-[11px] text-amber-800 text-center font-bold leading-normal">
                        Tài khoản Giảng viên / Admin không đăng ký tham gia lớp học.
                      </div>
                    ) : enrolled ? (
                      <a
                        href={`/learning/${courseId}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all cursor-pointer text-center"
                      >
                        <CheckCircle2 className="h-4.5 w-4.5" />
                        Vào lớp học ngay
                      </a>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={actionLoading}
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 active:scale-[0.99] transition-all cursor-pointer text-center disabled:from-blue-400 disabled:to-indigo-400"
                      >
                        {actionLoading ? 'Đang thực hiện đăng ký...' : `Đăng ký học (${formatPrice(course.price)})`}
                      </button>
                    )}
                  </>
                ) : (
                  <a
                    href={`/auth/login?redirect=/courses/${courseId}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all text-center cursor-pointer"
                  >
                    Đăng nhập để đăng ký học
                    <ChevronRight className="h-4.5 w-4.5" />
                  </a>
                )}
              </div>

              {/* Guarantees List details */}
              <div className="mt-6 space-y-4 text-xs font-medium text-zinc-500 border-t border-zinc-100 pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Play className="h-3.5 w-3.5" />
                  </div>
                  <span>Bài giảng video học trực tuyến đầy đủ</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span>Tài liệu đính kèm kèm mã nguồn dự án</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Đánh giá tự động thi thử Speaking / Writing AI</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
