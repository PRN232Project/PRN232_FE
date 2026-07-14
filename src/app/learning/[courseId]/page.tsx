'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Course, LessonItem, GradedAttempt, UserLessonProgress, LessonItemType, studentService } from '@/lib/service';
import { ArrowLeft, Play, FileText, CheckCircle2, FileDown, GraduationCap, Award, RefreshCw, HelpCircle } from 'lucide-react';

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

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
      const courseData = await studentService.getLearningDetails(courseId);
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
        course.courseId,
        selectedLessonId
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
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-zinc-500 text-xs font-semibold animate-pulse">Đang mở khóa không gian học tập...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-red-400 font-bold text-sm">
        Không tìm thấy khóa học này.
      </div>
    );
  }

  // Count progress
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedLessons = progressList.filter((p) => p.isCompleted).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-200 overflow-hidden font-sans">
      
      {/* Top Header Navigation */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-800"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </a>
          <div className="overflow-hidden">
            <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-widest">Đang Học</span>
            <span className="text-xs font-bold text-white truncate block max-w-md">{course.title}</span>
          </div>
        </div>

        {/* Progress percent bar */}
        <div className="flex items-center gap-4">
          {overallProgress === 100 && (
            <a
              href="/certificates"
              className="flex items-center gap-1.5 bg-amber-600/20 text-amber-400 border border-amber-500/30 font-bold text-[10px] px-2.5 py-1 rounded-lg transition-colors hover:bg-amber-600/30 cursor-pointer"
            >
              <Award className="h-3.5 w-3.5" />
              Xem chứng chỉ
            </a>
          )}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tiến trình</span>
            <span className="text-xs font-black text-indigo-400">{overallProgress}% Hoàn thành</span>
          </div>
          <div className="hidden sm:block w-32 bg-zinc-850 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300 shadow-md shadow-indigo-500/20"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Interactive Lesson Content (70% width) */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-8 bg-zinc-900/40">
          {selectedItem ? (
            <div className="max-w-4xl mx-auto w-full space-y-6 flex-1 flex flex-col">
              
              {overallProgress === 100 && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/25 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 shrink-0 shadow-md">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-white text-sm">Chúc mừng bạn đã tốt nghiệp!</h3>
                      <p className="text-xs text-zinc-400">Bạn đã hoàn thành xuất sắc tất cả các bài học trong khóa.</p>
                    </div>
                  </div>
                  <a
                    href="/certificates"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 py-2.5 px-4 text-xs font-extrabold text-zinc-950 shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Award className="h-4.5 w-4.5" />
                    Xem Chứng Chỉ
                  </a>
                </div>
              )}
              
              {selectedItem.type === LessonItemType.Video && (() => {
                const videoUrl = selectedItem.url || selectedItem.videoUrl || '';
                const ytId = getYoutubeId(videoUrl);
                if (ytId) {
                  return (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-zinc-800/80">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={selectedItem.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                } else {
                  return (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-zinc-800/80 flex items-center justify-center">
                      {videoUrl ? (
                        <video
                          src={videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <p className="text-zinc-500 text-xs font-semibold">Không tìm thấy video bài giảng.</p>
                      )}
                    </div>
                  );
                }
              })()}

              {selectedItem.type === LessonItemType.Article && (
                <div className="rounded-2xl bg-zinc-900/50 p-6 md:p-8 border border-zinc-800/80 shadow-xl space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
                    <FileText className="h-5.5 w-5.5 text-indigo-400" />
                    <h1 className="text-lg md:text-xl font-black text-white">{selectedItem.title}</h1>
                  </div>
                  <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                    {selectedItem.content ? (
                      selectedItem.content.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-zinc-500 italic">Không có nội dung chi tiết cho bài đọc này.</p>
                    )}
                  </div>
                </div>
              )}

              {selectedItem.type === LessonItemType.Quiz && selectedItem.gradedItem && (
                <div className="rounded-2xl bg-zinc-900/50 p-6 md:p-8 border border-zinc-800/80 shadow-xl space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-5.5 w-5.5 text-amber-500" />
                      <h2 className="text-base sm:text-lg font-black text-white">Bài trắc nghiệm: {selectedItem.gradedItem.title}</h2>
                    </div>
                    {!quizAttempt && (
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                        Đã chọn: {Object.keys(answers).length}/{selectedItem.gradedItem.questions?.length || 0}
                      </span>
                    )}
                  </div>

                  {!quizAttempt ? (
                    <form onSubmit={handleQuizSubmit} className="space-y-6">
                      {selectedItem.gradedItem.questions?.map((q, idx) => (
                        <div key={q.questionId} className="bg-zinc-950/40 border border-zinc-850/50 p-5 rounded-2xl space-y-4 hover:border-zinc-800 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-bold text-indigo-400 border border-zinc-800">
                              {idx + 1}
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-zinc-100 leading-relaxed pt-0.5">
                              {q.questionText}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-2 pl-9">
                            {q.answerOptions?.map((opt) => {
                              const isSelected = answers[q.questionId] === opt.answerOptionId;
                              return (
                                <button
                                  key={opt.answerOptionId}
                                  type="button"
                                  onClick={() => handleQuizAnswer(q.questionId, opt.answerOptionId)}
                                  className={`w-full text-left flex items-center gap-3 rounded-xl border p-3.5 text-xs transition-all duration-200 outline-none ${
                                    isSelected
                                      ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300 font-bold shadow-md shadow-indigo-500/5'
                                      : 'border-zinc-800/80 bg-zinc-950 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  <span className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all ${
                                    isSelected
                                      ? 'border-indigo-400 bg-indigo-500 text-white'
                                      : 'border-zinc-700 bg-zinc-900'
                                  }`}>
                                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                  </span>
                                  <span className="leading-relaxed">{opt.optionText}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <button
                        type="submit"
                        disabled={quizSubmitting || Object.keys(answers).length < (selectedItem.gradedItem.questions?.length || 0)}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-850 disabled:text-zinc-650 py-3.5 px-6 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer block w-full text-center"
                      >
                        {quizSubmitting ? 'Đang chấm điểm...' : 'Nộp bài trắc nghiệm'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-10 space-y-4 max-w-md mx-auto">
                      {quizAttempt.isPassed ? (
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                          <Award className="h-8 w-8" />
                        </div>
                      ) : (
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/5">
                          <RefreshCw className="h-8 w-8 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                      )}
                      
                      <h3 className="text-lg font-black text-white">
                        {quizAttempt.isPassed ? 'Chúc mừng! Bạn đã vượt qua bài thi' : 'Không đạt điểm đỗ'}
                      </h3>
                      <p className="text-zinc-400 text-xs font-semibold">
                        Kết quả đạt được: <span className="font-black text-white text-sm">{quizAttempt.score}%</span> (Yêu cầu đạt: {selectedItem.gradedItem.passingScore}%)
                      </p>

                      <div className="flex gap-4 justify-center pt-4">
                        {!quizAttempt.isPassed && (
                          <button
                            type="button"
                            onClick={() => setQuizAttempt(null)}
                            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-5 py-2.5 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer"
                          >
                            Thử sức lại bài thi
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lesson resources & Mark complete control */}
              <div className="border-t border-zinc-800/80 pt-6 mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Resources */}
                <div className="space-y-1.5">
                  {selectedItem.lessonResources && selectedItem.lessonResources.length > 0 && (
                    <>
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Tài liệu đính kèm:</p>
                      <div className="space-y-1">
                        {selectedItem.lessonResources.map((res) => (
                          <a
                            key={res.lessonResourceId}
                            href="#"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
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
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      isLessonCompleted(selectedLessonId)
                        ? 'bg-zinc-900 text-zinc-650 border border-zinc-850/80'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10'
                    }`}
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    {isLessonCompleted(selectedLessonId) ? 'Đã hoàn thành bài học' : 'Đánh dấu hoàn thành'}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 text-sm font-semibold">Vui lòng chọn bài học từ menu bên phải.</div>
          )}
        </div>
      
        {/* Right Side: Syllabus Navigation Sidebar (30% width) */}
        <aside className="w-80 shrink-0 bg-zinc-950 flex flex-col overflow-y-auto border-l border-zinc-800 z-10">
          <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/50 sticky top-0 z-10 flex items-center justify-between">
            <h3 className="font-bold text-white text-[10px] uppercase tracking-widest">Nội dung học tập</h3>
            <span className="text-[10px] text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {completedLessons}/{totalLessons} Bài
            </span>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {course.modules?.map((mod) => (
              <div key={mod.moduleId} className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-500 shrink-0 mt-0.5">
                    M
                  </span>
                  <h4 className="text-xs font-black text-zinc-300 leading-tight">{mod.title}</h4>
                </div>
                <div className="space-y-1">
                  {mod.lessons?.map((les) => {
                    const activeLesson = les.lessonId === selectedLessonId;
                    const completed = isLessonCompleted(les.lessonId);
                    return (
                      <div key={les.lessonId} className="space-y-1">
                        <div className={`p-2 rounded-lg flex items-center justify-between text-xs font-bold ${
                          activeLesson ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-500'
                        }`}>
                          <span className="truncate">{les.title}</span>
                          {completed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 ml-1.5" />}
                        </div>
                        {/* Lesson Items nested */}
                        <div className="pl-3.5 space-y-0.5 border-l border-zinc-900 ml-3">
                          {les.lessonItems?.map((li) => {
                            const isSelected = selectedItem?.lessonItemId === li.lessonItemId;
                            const getItemIcon = (type: LessonItemType) => {
                              switch (type) {
                                case LessonItemType.Video:
                                  return <Play className="h-3.5 w-3.5 text-indigo-400" />;
                                case LessonItemType.Quiz:
                                  return <HelpCircle className="h-3.5 w-3.5 text-amber-500" />;
                                default:
                                  return <FileText className="h-3.5 w-3.5 text-emerald-400" />;
                              }
                            };
                            return (
                              <button
                                key={li.lessonItemId}
                                onClick={() => handleSelectLessonItem(li, les.lessonId)}
                                className={`w-full text-left p-2 rounded-lg text-[11px] flex items-center justify-between transition-all duration-150 cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600/10 text-indigo-300 font-bold border border-indigo-500/20'
                                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {getItemIcon(li.type)}
                                  <span className="truncate">{li.title}</span>
                                </div>
                                <span className="text-[9px] text-zinc-600 shrink-0 ml-1 font-bold">{li.durationMinutes}m</span>
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
