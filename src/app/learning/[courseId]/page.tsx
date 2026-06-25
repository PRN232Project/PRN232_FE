'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Course, LessonItem, GradedAttempt, UserLessonProgress, LessonItemType, courseService, studentService } from '@/lib/service';
import { ArrowLeft, Play, BookOpen, FileText, CheckCircle2, ChevronRight, FileDown, GraduationCap, Award, RefreshCw } from 'lucide-react';

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedItem, setSelectedItem] = useState<LessonItem | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [progressList, setProgressList] = useState<UserLessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz submission states
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> answerOptionId
  const [quizAttempt, setQuizAttempt] = useState<GradedAttempt | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  const loadLearningData = async () => {
    if (!user || !courseId) return;
    try {
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);

      const prog = await studentService.getProgress(user.userId, courseId);
      setProgressList(prog);

      // Select first lesson item by default
      if (courseData.modules && courseData.modules.length > 0) {
        const firstMod = courseData.modules[0];
        if (firstMod.lessons && firstMod.lessons.length > 0) {
          const firstLes = firstMod.lessons[0];
          setSelectedLessonId(firstLes.lessonId);
          if (firstLes.lessonItems && firstLes.lessonItems.length > 0) {
            setSelectedItem(firstLes.lessonItems[0]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadLearningData();
  }, [courseId, user, authLoading]);

  const handleSelectLessonItem = (item: LessonItem, lessonId: string) => {
    setSelectedItem(item);
    setSelectedLessonId(lessonId);
    setAnswers({});
    setQuizAttempt(null);
  };

  const handleMarkComplete = async () => {
    if (!user || !selectedLessonId || !course) return;
    try {
      await studentService.completeLesson(user.userId, selectedLessonId, course.courseId);
      // Reload progress
      const prog = await studentService.getProgress(user.userId, course.courseId);
      setProgressList(prog);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuizAnswer = (qId: string, optId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optId,
    }));
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedItem || !selectedItem.gradedItem || !course) return;

    setQuizSubmitting(true);
    try {
      const attempt = await studentService.submitQuizAttempt(
        user.userId,
        selectedItem.gradedItem.gradedItemId,
        answers,
        course.courseId
      );
      setQuizAttempt(attempt);

      // Reload progress list
      const prog = await studentService.getProgress(user.userId, course.courseId);
      setProgressList(prog);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nộp bài trắc nghiệm');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progressList.some((p) => p.lessonId === lessonId && p.isCompleted);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900 text-zinc-400">
        Đang mở khóa không gian học tập...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900 text-red-400">
        Không tìm thấy khóa học này.
      </div>
    );
  }

  // Count progress
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedLessons = progressList.filter((p) => p.isCompleted).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="flex h-screen flex-col bg-zinc-900 text-zinc-150 overflow-hidden">
      
      {/* Top Header Navigation */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 shrink-0">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div className="overflow-hidden">
            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Đang Học</span>
            <span className="text-xs font-bold text-white truncate block max-w-md">{course.title}</span>
          </div>
        </div>

        {/* Progress percent bar */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] text-zinc-400 font-medium">Tiến trình khóa học</span>
            <span className="text-xs font-bold text-blue-400">{overallProgress}% Hoàn thành</span>
          </div>
          <div className="hidden sm:block w-32 bg-zinc-850 h-1.5 rounded-full">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Interactive Lesson Content (70% width) */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-8 bg-zinc-900 border-r border-zinc-800">
          {selectedItem ? (
            <div className="max-w-4xl mx-auto w-full space-y-6 flex-1 flex flex-col">
              
              {/* Render dynamic viewer depending on LessonItemType */}
              {selectedItem.type === LessonItemType.Video && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Standard mock player
                    title={selectedItem.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {selectedItem.type === LessonItemType.Article && (
                <div className="rounded-2xl bg-zinc-850 p-6 md:p-8 border border-zinc-800 prose prose-invert max-w-none shadow-md">
                  <h1 className="text-xl md:text-2xl font-extrabold text-white mb-4">{selectedItem.title}</h1>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                    Chào mừng bạn đến với nội dung bài đọc chi tiết của khóa học. Lớp học này thiết lập tài liệu tự học kèm theo hướng dẫn thực hành.
                  </p>
                  <h3 className="text-base font-bold text-zinc-100 mt-6 mb-2">1. Định nghĩa & Lý thuyết cốt lõi</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                    Việc xây dựng kiến trúc Web API chuẩn yêu cầu tối ưu hóa đường truyền dữ liệu và thiết lập các DTO (Data Transfer Objects) rõ ràng. Điều này giúp ngăn chặn phơi bày thực thể cơ sở dữ liệu trực tiếp ra bên ngoài và tăng cường bảo mật thông tin.
                  </p>
                  <h3 className="text-base font-bold text-zinc-100 mt-6 mb-2">2. Hướng dẫn Thực hành</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Hãy xem tệp đính kèm ở góc dưới để thực hiện tải bài viết slide hướng dẫn chi tiết và chạy dotnet migration trên cơ sở dữ liệu local của bạn.
                  </p>
                </div>
              )}

              {selectedItem.type === LessonItemType.Quiz && selectedItem.gradedItem && (
                <div className="rounded-2xl bg-zinc-850 p-6 md:p-8 border border-zinc-800 shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-6 w-6 text-amber-400" />
                    <h2 className="text-lg font-bold text-white">Bài trắc nghiệm: {selectedItem.gradedItem.title}</h2>
                  </div>

                  {!quizAttempt ? (
                    <form onSubmit={handleQuizSubmit} className="space-y-6">
                      {selectedItem.gradedItem.questions?.map((q, idx) => (
                        <div key={q.questionId} className="space-y-3">
                          <p className="text-sm font-semibold text-zinc-100">
                            Câu {idx + 1}: {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 gap-2.5 pl-2">
                            {q.answerOptions?.map((opt) => (
                              <label
                                key={opt.answerOptionId}
                                className={`flex items-center gap-3 rounded-xl border p-3.5 text-xs text-zinc-300 cursor-pointer transition-all hover:bg-zinc-800 ${
                                  answers[q.questionId] === opt.answerOptionId
                                    ? 'border-blue-500 bg-blue-900/20 text-white font-semibold'
                                    : 'border-zinc-800 bg-zinc-900'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q.questionId}`}
                                  checked={answers[q.questionId] === opt.answerOptionId}
                                  onChange={() => handleQuizAnswer(q.questionId, opt.answerOptionId)}
                                  className="sr-only"
                                />
                                {opt.optionText}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        type="submit"
                        disabled={quizSubmitting || Object.keys(answers).length < (selectedItem.gradedItem.questions?.length || 0)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 py-3 px-6 text-xs font-semibold text-white shadow transition-all disabled:bg-zinc-800 disabled:text-zinc-650 cursor-pointer block w-full text-center"
                      >
                        {quizSubmitting ? 'Đang chấm điểm...' : 'Nộp bài trắc nghiệm'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      {quizAttempt.isPassed ? (
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                          <Award className="h-8 w-8" />
                        </div>
                      ) : (
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                          <RefreshCw className="h-8 w-8" />
                        </div>
                      )}
                      
                      <h3 className="text-xl font-bold text-white">
                        {quizAttempt.isPassed ? 'Chúc mừng! Bạn đã vượt qua bài thi' : 'Rất tiếc! Bạn không đạt điểm đỗ'}
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        Kết quả đạt được: <span className="font-bold text-white">{quizAttempt.score}%</span> (Điểm qua môn: {selectedItem.gradedItem.passingScore}%)
                      </p>

                      <div className="flex gap-4 justify-center pt-4">
                        {!quizAttempt.isPassed && (
                          <button
                            onClick={() => setQuizAttempt(null)}
                            className="rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                          >
                            Thi lại bài trắc nghiệm
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lesson resources & Mark complete control */}
              <div className="border-t border-zinc-800 pt-6 mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Resources */}
                <div className="space-y-1.5">
                  {selectedItem.lessonResources && selectedItem.lessonResources.length > 0 && (
                    <>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tài liệu đính kèm:</p>
                      <div className="space-y-1">
                        {selectedItem.lessonResources.map((res) => (
                          <a
                            key={res.lessonResourceId}
                            href="#"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            {res.title}
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Mark as complete (for videos & articles) */}
                {selectedItem.type !== LessonItemType.Quiz && (
                  <button
                    onClick={handleMarkComplete}
                    disabled={isLessonCompleted(selectedLessonId)}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      isLessonCompleted(selectedLessonId)
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-750'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    {isLessonCompleted(selectedLessonId) ? 'Đã hoàn thành bài học' : 'Đánh dấu hoàn thành'}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 text-sm">Vui lòng chọn bài học từ menu bên phải.</div>
          )}
        </div>

        {/* Right Side: Syllabus Navigation Sidebar (30% width) */}
        <aside className="w-80 shrink-0 bg-zinc-950 flex flex-col overflow-y-auto">
          <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/50 sticky top-0 z-10">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Nội dung khóa học</h3>
          </div>

          <div className="divide-y divide-zinc-850">
            {course.modules?.map((mod) => (
              <div key={mod.moduleId} className="p-4 space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 leading-tight">{mod.title}</h4>
                <div className="space-y-1">
                  {mod.lessons?.map((les) => {
                    const activeLesson = les.lessonId === selectedLessonId;
                    const completed = isLessonCompleted(les.lessonId);
                    return (
                      <div key={les.lessonId} className="space-y-1">
                        <div className={`p-2 rounded-lg flex items-center justify-between text-xs font-medium ${
                          activeLesson ? 'bg-zinc-850 text-white' : 'text-zinc-400'
                        }`}>
                          <span className="truncate">{les.title}</span>
                          {completed && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 ml-1.5" />}
                        </div>
                        {/* Lesson Items nested */}
                        <div className="pl-3.5 space-y-0.5">
                          {les.lessonItems?.map((li) => {
                            const isSelected = selectedItem?.lessonItemId === li.lessonItemId;
                            return (
                              <button
                                key={li.lessonItemId}
                                onClick={() => handleSelectLessonItem(li, les.lessonId)}
                                className={`w-full text-left p-1.5 rounded text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600/10 text-blue-400 font-semibold'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <span className="truncate">{li.title}</span>
                                <span className="text-[10px] text-zinc-600 shrink-0 ml-1">{li.durationMinutes}m</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}
