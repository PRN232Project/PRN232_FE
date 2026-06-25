'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Course, CourseStatus, Enrollment, courseService, studentService } from '@/lib/service';
import { ChevronRight, Play, BookOpen, FileText, CheckCircle2, Lock } from 'lucide-react';

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
    return <div className="text-center py-20 text-zinc-500">Đang tải thông tin khóa học...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-red-500">Không tìm thấy khóa học này.</div>;
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return price.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Course Banner Info */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-extrabold text-zinc-950 sm:text-4xl">
              {course.title}
            </h1>
            <p className="text-base text-zinc-600 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-zinc-500 border-y border-zinc-200 py-4">
              <div>
                Ngôn ngữ giảng dạy: <span className="font-semibold text-zinc-800">{course.languageName}</span>
              </div>
              <div>
                Đăng ký học: <span className="font-semibold text-zinc-800">{course.enrollmentCount} học viên</span>
              </div>
              <div>
                Người tạo: <span className="font-semibold text-zinc-800">{course.instructorName}</span>
              </div>
            </div>

            {/* Course Syllabus / Curriculum Accordion */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Chương trình học (Curriculum)</h2>
              <div className="space-y-4">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((mod) => (
                    <div key={mod.moduleId} className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                      <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200">
                        <h3 className="font-semibold text-sm text-zinc-800">{mod.title}</h3>
                      </div>
                      <div className="divide-y divide-zinc-150">
                        {mod.lessons && mod.lessons.length > 0 ? (
                          mod.lessons.map((les) => (
                            <div key={les.lessonId} className="p-4 flex flex-col gap-2">
                              <span className="font-medium text-xs text-zinc-700">{les.title}</span>
                              <div className="space-y-1.5 pl-3">
                                {les.lessonItems?.map((item) => (
                                  <div key={item.lessonItemId} className="flex items-center justify-between text-xs text-zinc-500">
                                    <div className="flex items-center gap-2">
                                      {item.type === 0 ? (
                                        <Play className="h-3.5 w-3.5 text-blue-500" />
                                      ) : item.type === 1 ? (
                                        <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                                      ) : (
                                        <FileText className="h-3.5 w-3.5 text-amber-500" />
                                      )}
                                      <span>{item.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                      <span>{item.durationMinutes} phút</span>
                                      {!enrolled && <Lock className="h-3 w-3" />}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-zinc-400 text-center">Chưa có bài học nào</div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">Chương trình học đang được giảng viên xây dựng.</p>
                )}
              </div>
            </div>

            {/* Instructor Bio */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-950 mb-3">Thông tin giảng viên</h2>
              <div className="flex items-start gap-4">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=128&auto=format&fit=crop"
                  alt={course.instructorName}
                  className="h-16 w-16 rounded-full object-cover border border-zinc-200"
                />
                <div>
                  <h4 className="font-semibold text-zinc-800 text-sm">{course.instructorName}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Giảng viên OLP Academy</p>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    {course.instructorBio || 'Giảng viên giàu kinh nghiệm về phát triển phần mềm và thiết kế hệ thống.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Widget (Checkout / Learn) */}
          <div className="space-y-6">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-150 mb-6">
                <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
              </div>

              <div className="mb-6">
                <span className="text-3xl font-extrabold text-zinc-950">{formatPrice(course.price)}</span>
                {course.price > 0 && (
                  <p className="text-xs text-zinc-400 mt-1">Thanh toán một lần, học trọn đời</p>
                )}
              </div>

              {/* Action Buttons */}
              {user ? (
                <>
                  {isAdmin || isInstructor ? (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 text-center font-medium">
                      Tài khoản Quản trị / Giảng viên không được phép đăng ký học.
                    </div>
                  ) : enrolled ? (
                    <a
                      href={`/learning/${courseId}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow-md transition-all cursor-pointer text-center"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Vào lớp học ngay
                    </a>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={actionLoading}
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all cursor-pointer text-center disabled:bg-blue-400"
                    >
                      {actionLoading ? 'Đang thực hiện...' : `Đăng ký học (${formatPrice(course.price)})`}
                    </button>
                  )}
                </>
              ) : (
                <a
                  href={`/auth/login?redirect=/courses/${courseId}`}
                  className="flex w-full items-center justify-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow-md transition-all text-center cursor-pointer"
                >
                  Đăng nhập để đăng ký học
                  <ChevronRight className="h-4 w-4" />
                </a>
              )}

              <div className="mt-6 space-y-3.5 text-xs text-zinc-600 border-t border-zinc-150 pt-5">
                <p className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-zinc-400" />
                  <span>Bài giảng video chất lượng cao</span>
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-400" />
                  <span>Tải tài liệu đính kèm miễn phí</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-zinc-400" />
                  <span>Làm quiz ôn tập củng cố kiến thức</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
