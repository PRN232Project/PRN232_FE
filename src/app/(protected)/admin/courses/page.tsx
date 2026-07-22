'use client';

import React, { useEffect, useState } from 'react';
import { Course, adminService } from '@/lib/service';
import { useSignalR } from '@/context/SignalRContext';
import { BookOpen, CheckCircle, XCircle, ChevronDown, ChevronUp, User, Search, X, Eye, FileText, Video, HelpCircle, Paperclip, ExternalLink, Calendar, Tag, Signal, Layers, Clock } from 'lucide-react';

interface LessonResource {
  lessonResourceId: string;
  title?: string;
  resourceType?: number;
  resourceUrl?: string;
  textContent?: string;
  videoSourceType?: number;
}

interface LessonItem {
  lessonItemId: string;
  type: number; // 0: Video, 1: Document/Article, 2: Quiz
  orderIndex: number;
  resources?: LessonResource[];
  gradedItem?: {
    gradedItemId: string;
    submissionGuidelines?: string;
    questionCount?: number;
  };
}

interface CourseLesson {
  lessonId: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedMinutes: number;
  items?: LessonItem[];
}

interface CourseModule {
  moduleId: string;
  title: string;
  index: number;
  lessons: CourseLesson[];
}

interface CourseDetail {
  courseId: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  image?: string;
  level?: number | string;
  tags?: string;
  submittedAt?: string;
  createdAt?: string;
  instructorName: string;
  modules: CourseModule[];
}

export default function AdminCoursesPage() {
  const { notifHub, notifConnected } = useSignalR();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection Modal States
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectCourseId, setRejectCourseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Curriculum Preview Modal
  const [curriculumModal, setCurriculumModal] = useState<CourseDetail | null>(null);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const loadPendingCourses = async () => {
    try {
      const data = await adminService.getPendingCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCourses();
  }, []);

  useEffect(() => {
    if (!notifHub || !notifConnected) return;

    const handleUpdate = () => {
      loadPendingCourses();
    };

    notifHub.on('CoursePendingUpdate', handleUpdate);

    return () => {
      notifHub.off('CoursePendingUpdate', handleUpdate);
    };
  }, [notifHub, notifConnected]);

  const handleApprove = async (courseId: string) => {
    const confirmApprove = window.confirm('Bạn có chắc chắn muốn phê duyệt và xuất bản khóa học này không?');
    if (!confirmApprove) return;

    try {
      await adminService.reviewCourse(courseId, true, '');
      setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
      if (curriculumModal?.courseId === courseId) setCurriculumModal(null);
      alert('Đã phê duyệt và xuất bản khóa học thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phê duyệt khóa học');
    }
  };

  const openRejectModal = (courseId: string) => {
    setRejectCourseId(courseId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectCourseId) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối khóa học.');
      return;
    }

    setSubmittingReject(true);
    try {
      await adminService.reviewCourse(rejectCourseId, false, rejectReason.trim());
      setCourses((prev) => prev.filter((c) => c.courseId !== rejectCourseId));
      if (curriculumModal?.courseId === rejectCourseId) setCurriculumModal(null);
      setRejectModalOpen(false);
      setRejectCourseId(null);
      alert('Đã từ chối khóa học và gửi ý kiến phản hồi tới giảng viên.');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi từ chối khóa học');
    } finally {
      setSubmittingReject(false);
    }
  };

  const openCurriculumModal = async (courseId: string) => {
    setCurriculumLoading(true);
    setCurriculumModal(null);
    setExpandedModules(new Set());
    try {
      const detail = await adminService.getCourseDetailForAdmin(courseId);
      setCurriculumModal(detail);
      // Expand all modules by default
      if (detail?.modules) {
        setExpandedModules(new Set(detail.modules.map((m: CourseModule) => m.moduleId)));
      }
    } catch (err: any) {
      alert(err.message || 'Không thể tải đề cương khóa học');
    } finally {
      setCurriculumLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const formatVND = (num: number) => {
    if (num === 0) return 'Miễn phí';
    return num.toLocaleString('vi-VN') + ' đ';
  };

  // Filter courses locally
  const filteredCourses = courses.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      c.instructorName?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <div className="text-zinc-500 text-center py-20 bg-white rounded-xl border border-zinc-200">Đang tải danh sách khóa học chờ duyệt...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Duyệt Khóa Học Chờ Xuất Bản</h1>
          <p className="text-xs text-zinc-500">Xem xét và đánh giá giáo án từ giảng viên trước khi xuất bản lên nền tảng.</p>
        </div>
        
        {courses.length > 0 && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc giảng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-350 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 font-bold focus:border-indigo-500 outline-none placeholder:text-zinc-500"
            />
          </div>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-16 text-center bg-white shadow-sm">
          <BookOpen className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="font-bold text-zinc-800 text-sm">Hộp thư duyệt trống</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'Không tìm thấy khóa học nào phù hợp với từ khóa.' : 'Hiện không có yêu cầu phê duyệt khóa học mới nào từ các giảng viên.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.courseId}
              className="rounded-xl border border-zinc-205 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center"
            >
              <div className="flex gap-4 items-start flex-1 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-24 w-40 rounded-lg object-cover border border-zinc-200 shrink-0 shadow-sm"
                />
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-bold text-zinc-950 text-base truncate">{course.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 pt-2 font-semibold">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-zinc-400 animate-pulse" />
                      Giảng viên: <span className="font-bold text-zinc-700">{course.instructorName}</span>
                    </span>
                    <span>•</span>
                    <span>Học phần: {course.modules?.length || 0} chương</span>
                    <span>•</span>
                    <span>Học phí: <span className="font-bold text-blue-600">{formatVND(course.price)}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 shrink-0 w-full lg:w-auto border-t lg:border-t-0 border-zinc-100 pt-4 lg:pt-0">
                <button
                  onClick={() => openCurriculumModal(course.courseId)}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 py-2.5 px-4 text-xs font-semibold text-zinc-700 transition-colors shadow-sm cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  Xem đề cương
                </button>
                <button
                  onClick={() => openRejectModal(course.courseId)}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 py-2.5 px-4 text-xs font-semibold text-red-600 transition-colors border border-red-200 shadow-sm cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  Từ chối
                </button>
                <button
                  onClick={() => handleApprove(course.courseId)}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 py-2.5 px-4 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  Phê duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Curriculum & Detail Preview Modal ─── */}
      {(curriculumLoading || curriculumModal) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => { if (!curriculumLoading) setCurriculumModal(null); }}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 p-5 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-base">
                    {curriculumLoading ? 'Đang tải chi tiết khóa học...' : 'Kiểm Duyệt Chi Tiết Khóa Học'}
                  </h3>
                  {curriculumModal && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Giảng viên: <span className="font-semibold text-zinc-700">{curriculumModal.instructorName}</span> · {curriculumModal.modules?.length || 0} chương học
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurriculumModal(null)}
                className="shrink-0 rounded-full p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {curriculumLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400 text-sm">
                  <svg className="animate-spin h-7 w-7 mb-3 text-indigo-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Đang tải nội dung chi tiết khóa học...</span>
                </div>
              ) : curriculumModal && (
                <>
                  {/* 1. Course Overview Banner */}
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 flex flex-col md:flex-row gap-5 items-start">
                    {curriculumModal.image && (
                      <img
                        src={curriculumModal.image}
                        alt={curriculumModal.title}
                        className="w-full md:w-56 h-36 rounded-lg object-cover border border-zinc-200 shadow-sm shrink-0"
                      />
                    )}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                          {typeof curriculumModal.level === 'number'
                            ? ['Cơ bản', 'Trung cấp', 'Nâng cao', 'Mọi cấp độ'][curriculumModal.level] || 'Mọi cấp độ'
                            : curriculumModal.level || 'Mọi cấp độ'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                          {formatVND(curriculumModal.price)}
                        </span>
                        {curriculumModal.submittedAt && (
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1 ml-auto">
                            <Clock className="h-3 w-3" />
                            Nộp lúc: {new Date(curriculumModal.submittedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-zinc-950">{curriculumModal.title}</h2>
                      {curriculumModal.subtitle && (
                        <p className="text-xs font-medium text-zinc-600 italic">{curriculumModal.subtitle}</p>
                      )}

                      {curriculumModal.tags && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {curriculumModal.tags.split(',').map((tag, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded bg-white text-zinc-600 text-[10px] border border-zinc-200 font-medium">
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {curriculumModal.description && (
                        <div className="pt-2 border-t border-zinc-200/60 text-xs text-zinc-600 leading-relaxed max-h-32 overflow-y-auto">
                          {curriculumModal.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Detailed Curriculum Inspector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-600" />
                        Cấu trúc đề cương & Nội dung bài học ({curriculumModal.modules?.length || 0} chương)
                      </h3>
                      <button
                        onClick={() => {
                          if (expandedModules.size === curriculumModal.modules.length) {
                            setExpandedModules(new Set());
                          } else {
                            setExpandedModules(new Set(curriculumModal.modules.map(m => m.moduleId)));
                          }
                        }}
                        className="text-xs text-indigo-600 font-medium hover:underline"
                      >
                        {expandedModules.size === curriculumModal.modules.length ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                      </button>
                    </div>

                    {curriculumModal.modules?.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center bg-white">
                        <BookOpen className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500">Khóa học chưa có học phần nào được khởi tạo.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {curriculumModal.modules?.map((mod, idx) => {
                          const isExpanded = expandedModules.has(mod.moduleId);
                          return (
                            <div key={mod.moduleId} className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
                              <button
                                onClick={() => toggleModule(mod.moduleId)}
                                className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-zinc-50/80 hover:bg-zinc-100/80 transition-colors text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-[11px] font-bold shadow-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="font-bold text-zinc-900 text-sm">{mod.title}</span>
                                  <span className="text-[11px] text-zinc-500 font-medium">({mod.lessons?.length || 0} bài học)</span>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="p-4 bg-white divide-y divide-zinc-100">
                                  {mod.lessons?.length === 0 ? (
                                    <p className="text-xs text-zinc-400 italic py-2">Học phần này chưa chứa bài học nào.</p>
                                  ) : (
                                    mod.lessons?.map((lesson, lIdx) => (
                                      <div key={lesson.lessonId} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                                        {/* Lesson Header */}
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-500 w-5 shrink-0">{lIdx + 1}.</span>
                                            <h4 className="font-semibold text-zinc-850 text-xs">{lesson.title}</h4>
                                          </div>
                                          {lesson.estimatedMinutes > 0 && (
                                            <span className="text-[10px] text-zinc-500 font-medium bg-zinc-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                              <Clock className="h-3 w-3 text-zinc-400" />
                                              {lesson.estimatedMinutes} phút
                                            </span>
                                          )}
                                        </div>

                                        {/* Lesson Description */}
                                        {lesson.description && (
                                          <p className="text-[11px] text-zinc-500 pl-7 leading-relaxed">{lesson.description}</p>
                                        )}

                                        {/* Lesson Items / Detailed Contents */}
                                        {lesson.items && lesson.items.length > 0 ? (
                                          <div className="pl-7 pt-1 space-y-2">
                                            {lesson.items.map((item) => (
                                              <div key={item.lessonItemId} className="rounded-lg border border-zinc-150 bg-zinc-50/50 p-2.5 space-y-1.5">
                                                {/* Item Type Badge & Info */}
                                                <div className="flex items-center justify-between text-[11px]">
                                                  <div className="flex items-center gap-2 font-medium">
                                                    {item.type === 0 && (
                                                      <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                                                        <Video className="h-3.5 w-3.5" />
                                                        [Video Bài Học]
                                                      </span>
                                                    )}
                                                    {item.type === 1 && (
                                                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                                        <FileText className="h-3.5 w-3.5" />
                                                        [Bài Đọc / Tài Liệu]
                                                      </span>
                                                    )}
                                                    {item.type === 2 && (
                                                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                                        <HelpCircle className="h-3.5 w-3.5" />
                                                        [Bài Trắc Nghiệm / Quiz]
                                                      </span>
                                                    )}
                                                  </div>

                                                  {item.gradedItem && (
                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                      {item.gradedItem.questionCount || 0} câu hỏi
                                                    </span>
                                                  )}
                                                </div>

                                                {/* Item Content / Resources */}
                                                {item.resources?.map((res) => (
                                                  <div key={res.lessonResourceId} className="text-[11px] text-zinc-700 pl-2 border-l-2 border-indigo-200 space-y-1">
                                                    {res.title && <p className="font-semibold text-zinc-800">{res.title}</p>}

                                                    {/* Video Link */}
                                                    {res.resourceUrl && item.type === 0 && (
                                                      <div className="flex items-center gap-2 pt-0.5">
                                                        <a
                                                          href={res.resourceUrl}
                                                          target="_blank"
                                                          rel="noreferrer"
                                                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"
                                                        >
                                                          <ExternalLink className="h-3 w-3" />
                                                          Mở link video kiểm tra
                                                        </a>
                                                        <span className="text-[10px] text-zinc-400 truncate max-w-xs">{res.resourceUrl}</span>
                                                      </div>
                                                    )}

                                                    {/* Document Text Content Preview */}
                                                    {res.textContent && (
                                                      <div className="bg-white p-2 rounded border border-zinc-200 text-[11px] text-zinc-600 whitespace-pre-wrap max-h-24 overflow-y-auto">
                                                        {res.textContent}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}

                                                {/* Quiz Guidelines */}
                                                {item.gradedItem?.submissionGuidelines && (
                                                  <p className="text-[10px] text-zinc-500 italic pl-2">
                                                    Hướng dẫn: {item.gradedItem.submissionGuidelines}
                                                  </p>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="pl-7 text-[10px] text-zinc-400 italic">
                                            Chưa có nội dung chi tiết (video/bài đọc).
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer - approve/reject actions */}
            {curriculumModal && (
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/80">
                <p className="text-[11px] text-zinc-500 font-medium">
                  Đảm bảo nội dung bài học đáp ứng đúng tiêu chuẩn chất lượng của nền tảng.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCurriculumModal(null); openRejectModal(curriculumModal.courseId); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 py-2 px-4 text-xs font-semibold text-red-600 border border-red-200 transition-colors cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    Từ chối
                  </button>
                  <button
                    onClick={() => { setCurriculumModal(null); handleApprove(curriculumModal.courseId); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Phê duyệt khóa học
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Custom Rejection Modal Overlay ─── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Close */}
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2 mb-3">
              <XCircle className="h-5 w-5 text-red-500" />
              Từ chối bài duyệt khóa học
            </h3>
            
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Vui lòng nhập lý do từ chối khóa học này. Giảng viên sẽ nhận được phản hồi chi tiết để tiến hành chỉnh sửa và nộp lại.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Đề cương chương 2 thiếu bài thực hành, video 1.1 bị lỗi âm thanh..."
                className="w-full text-xs rounded-xl border border-zinc-300 p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="rounded-lg border border-zinc-200 py-2 px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="rounded-lg bg-red-600 hover:bg-red-700 py-2 px-4 text-xs font-semibold text-white shadow transition-all disabled:bg-red-400 cursor-pointer"
                >
                  {submittingReject ? 'Đang gửi...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
