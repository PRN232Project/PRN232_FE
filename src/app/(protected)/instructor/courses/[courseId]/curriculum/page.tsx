'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Course,
  Module,
  Lesson,
  LessonItem,
  LessonItemType,
  CourseStatus,
  courseService,
  instructorService
} from '@/lib/service';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronUp,
  Settings,
  Play,
  BookOpen,
  Trash2,
  PlusCircle,
  FolderPlus,
  ArrowRight,
  Upload,
  X,
  FileText,
  Check,
  Save,
  HelpCircle,
  Loader2,
  FileDown,
  Sparkles
} from 'lucide-react';

export default function CurriculumBuilderPage() {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction & UI States
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  
  // Adding structures states
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  // Slide Sheet Sidebar states
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'video' | 'reading' | 'quiz' | ''>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  // Material Form states
  const [materialTitle, setMaterialTitle] = useState('');
  // Video Lesson
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  // Reading Article
  const [readingContent, setReadingContent] = useState('');
  // Quiz
  const [quizQuestions, setQuizQuestions] = useState<any[]>([
    {
      id: 'q-init-1',
      questionText: '',
      points: 10,
      answerOptions: [
        { answerOptionId: 'o-1', optionText: '', isCorrect: true },
        { answerOptionId: 'o-2', optionText: '', isCorrect: false }
      ]
    }
  ]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!courseId) return;
    const fetchCourseData = async () => {
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
        const mods = data.modules || [];
        setModules(mods);
        
        // Expand first module by default
        if (mods.length > 0) {
          setExpandedModules({ [mods[0].moduleId]: true });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  // Add / Edit / Remove Module
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    const newModule: Module = {
      moduleId: `mod-mock-${Math.random().toString(36).substring(2, 9)}`,
      courseId,
      title: newModuleName.trim(),
      orderIndex: modules.length + 1,
      lessons: []
    };

    setModules([...modules, newModule]);
    setExpandedModules((prev) => ({ ...prev, [newModule.moduleId]: true }));
    setNewModuleName('');
    setNewModuleDesc('');
    setIsAddingModule(false);
  };

  const handleRemoveModule = (moduleId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này cùng toàn bộ bài học bên trong?')) return;
    setModules(modules.filter((m) => m.moduleId !== moduleId));
  };

  // Add / Remove Lesson
  const handleAddLesson = (moduleId: string) => {
    if (!newLessonTitle.trim()) return;

    setModules(
      modules.map((m) => {
        if (m.moduleId !== moduleId) return m;
        const currentLessons = m.lessons || [];
        const newLesson: Lesson = {
          lessonId: `les-mock-${Math.random().toString(36).substring(2, 9)}`,
          moduleId,
          title: newLessonTitle.trim(),
          orderIndex: currentLessons.length + 1,
          lessonItems: []
        };
        return {
          ...m,
          lessons: [...currentLessons, newLesson]
        };
      })
    );

    setNewLessonTitle('');
    setAddingLessonToModuleId(null);
  };

  const handleRemoveLesson = (moduleId: string, lessonId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    setModules(
      modules.map((m) => {
        if (m.moduleId !== moduleId) return m;
        return {
          ...m,
          lessons: (m.lessons || []).filter((l) => l.lessonId !== lessonId)
        };
      })
    );
  };

  // Open Add Material Slide Panel
  const openMaterialSheet = (lessonId: string, type: 'video' | 'reading' | 'quiz') => {
    setSelectedLessonId(lessonId);
    setSelectedType(type);
    setMaterialTitle('');
    setUploadProgress(0);
    setIsUploadingVideo(false);
    setVideoUrl('');
    setReadingContent('');
    setPdfFileName('');
    setQuizQuestions([
      {
        id: 'q-init-1',
        questionText: '',
        points: 10,
        answerOptions: [
          { answerOptionId: 'o-1', optionText: '', isCorrect: true },
          { answerOptionId: 'o-2', optionText: '', isCorrect: false }
        ]
      }
    ]);
    setSheetOpen(true);
  };

  // Video Upload Simulation
  const handleVideoUploadSimulation = () => {
    const file = videoInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setMaterialTitle(file.name.replace(/\.[^/.]+$/, ''));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploadingVideo(false);
        setVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ'); // Mock video URL
      }
    }, 200);
  };

  // AI Quiz Generator Simulation
  const handlePdfUploadSimulation = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setPdfFileName(file.name);
  };

  const handleGenerateAIQuiz = () => {
    if (!pdfFileName) {
      alert('Vui lòng chọn một tệp PDF trước!');
      return;
    }
    setIsGeneratingQuiz(true);
    setTimeout(() => {
      const generatedQuestions = [
        {
          id: `q-ai-1`,
          questionText: "Trong lập trình hướng đối tượng C#, tính Đóng gói (Encapsulation) được triển khai thế nào?",
          points: 10,
          answerOptions: [
            { answerOptionId: 'ao-1-1', optionText: 'Sử dụng các thuộc tính private kết hợp public Get/Set properties.', isCorrect: true },
            { answerOptionId: 'ao-1-2', optionText: 'Sử dụng từ khóa override và virtual kế thừa.', isCorrect: false },
            { answerOptionId: 'ao-1-3', optionText: 'Khai báo lớp static không cho khởi tạo.', isCorrect: false },
            { answerOptionId: 'ao-1-4', optionText: 'Mã hóa nhị phân dữ liệu khi gửi qua mạng.', isCorrect: false }
          ]
        },
        {
          id: `q-ai-2`,
          questionText: "Lợi ích lớn nhất của việc thiết kế RESTful API không lưu trạng thái (Stateless) là gì?",
          points: 10,
          answerOptions: [
            { answerOptionId: 'ao-2-1', optionText: 'Tăng tốc kết nối cơ sở dữ liệu local.', isCorrect: false },
            { answerOptionId: 'ao-2-2', optionText: 'Giúp hệ thống dễ mở rộng theo chiều ngang (High Scalability) vì các server không cần đồng bộ session.', isCorrect: true },
            { answerOptionId: 'ao-2-3', optionText: 'Tự động mã hóa tất cả các JSON payload.', isCorrect: false }
          ]
        },
        {
          id: `q-ai-3`,
          questionText: "Trong EF Core, phương thức AsNoTracking() được sử dụng nhằm mục đích gì?",
          points: 10,
          answerOptions: [
            { answerOptionId: 'ao-3-1', optionText: 'Để chạy migration cập nhật cấu trúc database.', isCorrect: false },
            { answerOptionId: 'ao-3-2', optionText: 'Để tắt bộ theo dõi thay đổi thực thể (Change Tracker), tối ưu bộ nhớ đối với các truy vấn chỉ đọc (Read-only).', isCorrect: true },
            { answerOptionId: 'ao-3-3', optionText: 'Để thực hiện nối bảng Left Join giữa hai Collection.', isCorrect: false }
          ]
        }
      ];
      setQuizQuestions(generatedQuestions);
      setMaterialTitle(`Bài ôn tập nhanh: ${pdfFileName.replace(/\.[^/.]+$/, '')}`);
      setIsGeneratingQuiz(false);
    }, 1500);
  };

  // Quiz Form Management
  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: `q-${Math.random().toString(36).substring(2, 9)}`,
        questionText: '',
        points: 10,
        answerOptions: [
          { answerOptionId: `o-${Date.now()}-1`, optionText: '', isCorrect: true },
          { answerOptionId: `o-${Date.now()}-2`, optionText: '', isCorrect: false }
        ]
      }
    ]);
  };

  const removeQuizQuestion = (idx: number) => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
  };

  const addQuizOption = (qIdx: number) => {
    const updated = [...quizQuestions];
    updated[qIdx].answerOptions.push({
      answerOptionId: `o-${Math.random().toString(36).substring(2, 9)}`,
      optionText: '',
      isCorrect: false
    });
    setQuizQuestions(updated);
  };

  const removeQuizOption = (qIdx: number, oIdx: number) => {
    const updated = [...quizQuestions];
    if (updated[qIdx].answerOptions.length <= 2) return;
    updated[qIdx].answerOptions = updated[qIdx].answerOptions.filter((_: any, i: number) => i !== oIdx);
    setQuizQuestions(updated);
  };

  const setCorrectQuizOption = (qIdx: number, oIdx: number) => {
    const updated = [...quizQuestions];
    updated[qIdx].answerOptions = updated[qIdx].answerOptions.map((opt: any, i: number) => ({
      ...opt,
      isCorrect: i === oIdx
    }));
    setQuizQuestions(updated);
  };

  // Save Content from slide sheet
  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) {
      alert('Vui lòng điền tiêu đề học liệu!');
      return;
    }

    let newItem: LessonItem;
    if (selectedType === 'video') {
      newItem = {
        lessonItemId: `item-video-${Math.random().toString(36).substring(2, 9)}`,
        lessonId: selectedLessonId,
        title: materialTitle.trim(),
        type: LessonItemType.Video,
        durationMinutes: 15,
        orderIndex: 0
      };
    } else if (selectedType === 'reading') {
      newItem = {
        lessonItemId: `item-read-${Math.random().toString(36).substring(2, 9)}`,
        lessonId: selectedLessonId,
        title: materialTitle.trim(),
        type: LessonItemType.Article,
        durationMinutes: 10,
        orderIndex: 0
      };
    } else {
      // Quiz
      newItem = {
        lessonItemId: `item-quiz-${Math.random().toString(36).substring(2, 9)}`,
        lessonId: selectedLessonId,
        title: materialTitle.trim(),
        type: LessonItemType.Quiz,
        durationMinutes: 15,
        orderIndex: 0,
        gradedItem: {
          gradedItemId: `g-item-${Math.random().toString(36).substring(2, 9)}`,
          lessonItemId: '',
          title: materialTitle.trim(),
          passingScore: 80,
          maxAttempts: 3,
          questions: quizQuestions.map((q, idx) => ({
            questionId: q.id,
            gradedItemId: '',
            questionText: q.questionText,
            orderIndex: idx + 1,
            answerOptions: q.answerOptions.map((o: any, oIdx: number) => ({
              answerOptionId: o.answerOptionId,
              questionId: q.id,
              optionText: o.optionText,
              isCorrect: o.isCorrect,
              orderIndex: oIdx + 1
            }))
          }))
        }
      };
    }

    setModules(
      modules.map((m) => {
        return {
          ...m,
          lessons: (m.lessons || []).map((l) => {
            if (l.lessonId !== selectedLessonId) return l;
            const items = l.lessonItems || [];
            newItem.orderIndex = items.length + 1;
            if (newItem.gradedItem) {
              newItem.gradedItem.lessonItemId = newItem.lessonItemId;
            }
            return {
              ...l,
              lessonItems: [...items, newItem]
            };
          })
        };
      })
    );

    setSheetOpen(false);
  };

  const handleRemoveMaterial = (moduleId: string, lessonId: string, itemId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa học liệu này?')) return;
    setModules(
      modules.map((m) => {
        if (m.moduleId !== moduleId) return m;
        return {
          ...m,
          lessons: (m.lessons || []).map((l) => {
            if (l.lessonId !== lessonId) return l;
            return {
              ...l,
              lessonItems: (l.lessonItems || []).filter((i) => i.lessonItemId !== itemId)
            };
          })
        };
      })
    );
  };

  // Core Service Saves
  const handleSaveCurriculum = async () => {
    setSaving(true);
    try {
      await instructorService.saveCurriculum(courseId, modules);
      alert('Đã lưu toàn bộ cấu trúc học liệu khóa học thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu đề cương');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitCourse = async () => {
    const hasModules = modules.length > 0;
    const hasLessons = modules.some((m) => m.lessons && m.lessons.length > 0);
    if (!hasModules || !hasLessons) {
      alert('Vui lòng xây dựng ít nhất 1 chương và 1 bài học trước khi gửi phê duyệt!');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn lưu đề cương hiện tại và gửi phê duyệt khóa học này lên Ban Quản Trị?')) {
      return;
    }

    setSubmitting(true);
    try {
      // First save curriculum
      await instructorService.saveCurriculum(courseId, modules);
      // Update course status to Pending
      await instructorService.updateCourse(courseId, { status: CourseStatus.Pending });
      alert('Đã gửi phê duyệt khóa học thành công! Trạng thái cập nhật thành: Chờ duyệt.');
      router.push('/instructor/courses');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi duyệt khóa học');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 text-zinc-500 text-sm gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        Đang tải đề cương khóa học...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 relative">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/instructor/courses')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-950">Thiết kế Đề cương</h1>
            <p className="text-xs text-zinc-500">Quản lý và cấu trúc các chương, bài học, tài liệu của khóa học: <span className="font-semibold text-indigo-600">{course?.title}</span></p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveCurriculum}
            disabled={saving || submitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-250 bg-white hover:bg-zinc-50 py-2.5 px-4 text-xs font-semibold text-zinc-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu nháp
              </>
            )}
          </button>
          
          <button
            onClick={handleSubmitCourse}
            disabled={saving || submitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 py-2.5 px-5 text-xs font-semibold text-white shadow transition-all disabled:bg-indigo-400 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                Gửi phê duyệt
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Builder List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="text-center py-16 bg-white border-2 border-dashed border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-300">
              <FolderPlus className="h-6 w-6" />
            </div>
            <h3 className="text-zinc-800 font-bold text-sm">Chưa có chương học nào</h3>
            <p className="text-zinc-500 text-xs mt-1 max-w-sm mx-auto">Bắt đầu cấu trúc khóa học của bạn bằng cách tạo chương học đầu tiên bên dưới.</p>
          </div>
        ) : (
          modules.map((mod, index) => {
            const isModOpen = !!expandedModules[mod.moduleId];
            return (
              <div key={mod.moduleId} className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                
                {/* Module Header Panel */}
                <div
                  onClick={() => toggleModule(mod.moduleId)}
                  className="px-6 py-4 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between cursor-pointer hover:bg-zinc-100/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-extrabold shadow-inner shrink-0">
                      {index + 1}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-zinc-900 text-sm truncate">{mod.title}</h3>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-medium uppercase">
                        {(mod.lessons || []).length} bài học
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleRemoveModule(mod.moduleId)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                      title="Xóa chương này"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div
                      onClick={() => toggleModule(mod.moduleId)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                    >
                      {isModOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Module Content / Lessons list */}
                {isModOpen && (
                  <div className="p-6 space-y-4 bg-white">
                    {/* Lessons list inside Module */}
                    {(mod.lessons || []).length === 0 ? (
                      <p className="text-zinc-400 text-xs italic">Chưa có bài học nào trong chương này.</p>
                    ) : (
                      <div className="space-y-4">
                        {(mod.lessons || []).map((lesson, lesIdx) => {
                          const isLesOpen = !!expandedLessons[lesson.lessonId];
                          return (
                            <div key={lesson.lessonId} className="border border-zinc-200 rounded-xl bg-white shadow-sm overflow-hidden">
                              
                              {/* Lesson Header Row */}
                              <div
                                onClick={() => toggleLesson(lesson.lessonId)}
                                className="px-5 py-3.5 bg-zinc-50/50 border-b border-zinc-150 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors select-none"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <BookOpen className="h-4 w-4 text-zinc-400" />
                                  <span className="font-bold text-zinc-800 text-xs truncate">
                                    Bài {lesIdx + 1}: {lesson.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                  {/* Add Material Menu Dropdown Sim */}
                                  <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg p-0.5">
                                    <button
                                      onClick={() => openMaterialSheet(lesson.lessonId, 'video')}
                                      className="px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 rounded transition-colors cursor-pointer"
                                    >
                                      + Video
                                    </button>
                                    <button
                                      onClick={() => openMaterialSheet(lesson.lessonId, 'reading')}
                                      className="px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 rounded transition-colors cursor-pointer"
                                    >
                                      + Bài viết
                                    </button>
                                    <button
                                      onClick={() => openMaterialSheet(lesson.lessonId, 'quiz')}
                                      className="px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 rounded transition-colors cursor-pointer"
                                    >
                                      + Trắc nghiệm
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleRemoveLesson(mod.moduleId, lesson.lessonId)}
                                    className="p-1.5 rounded text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                                    title="Xóa bài học"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>

                                  <div className="text-zinc-400">
                                    {isLesOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                  </div>
                                </div>
                              </div>

                              {/* Lesson Items inside Lesson */}
                              {isLesOpen && (
                                <div className="p-4 bg-zinc-50/20 space-y-2 border-t border-zinc-100">
                                  {(lesson.lessonItems || []).length === 0 ? (
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider pl-2">Chưa có học liệu</p>
                                  ) : (
                                    (lesson.lessonItems || []).map((item, itemIdx) => {
                                      return (
                                        <div
                                          key={item.lessonItemId}
                                          className="flex items-center justify-between p-3 bg-white border border-zinc-150 rounded-lg shadow-sm hover:shadow transition-shadow duration-150"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                              item.type === LessonItemType.Video 
                                                ? 'bg-red-50 text-red-500 border border-red-100' 
                                                : item.type === LessonItemType.Article
                                                ? 'bg-blue-50 text-blue-500 border border-blue-100'
                                                : 'bg-amber-50 text-amber-500 border border-amber-100'
                                            }`}>
                                              {item.type === LessonItemType.Video ? (
                                                <Play className="h-4 w-4" />
                                              ) : item.type === LessonItemType.Article ? (
                                                <FileText className="h-4 w-4" />
                                              ) : (
                                                <HelpCircle className="h-4 w-4" />
                                              )}
                                            </div>
                                            <div>
                                              <span className="text-xs font-bold text-zinc-800">{item.title}</span>
                                              <div className="flex items-center gap-2 text-[10px] text-zinc-450 mt-0.5">
                                                <span className="font-semibold uppercase text-zinc-500">
                                                  {item.type === LessonItemType.Video ? 'Video bài giảng' : item.type === LessonItemType.Article ? 'Bài viết tự học' : 'Bài trắc nghiệm'}
                                                </span>
                                                <span>•</span>
                                                <span>Thứ tự: {item.orderIndex}</span>
                                                <span>•</span>
                                                <span>{item.durationMinutes} phút</span>
                                              </div>
                                            </div>
                                          </div>

                                          <button
                                            onClick={() => handleRemoveMaterial(mod.moduleId, lesson.lessonId, item.lessonItemId)}
                                            className="p-1 rounded text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                                            title="Xóa học liệu"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Lesson inline form */}
                    {addingLessonToModuleId === mod.moduleId ? (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex gap-3 items-center">
                        <input
                          type="text"
                          required
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="Nhập tiêu đề bài học (Ví dụ: 1.1 Cài đặt môi trường)..."
                          className="flex-1 rounded-lg border border-zinc-300 px-3.5 py-1.5 text-xs text-zinc-950 bg-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setAddingLessonToModuleId(null)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleAddLesson(mod.moduleId)}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          Thêm bài học
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingLessonToModuleId(mod.moduleId);
                          setNewLessonTitle('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Thêm bài học mới
                      </button>
                    )}

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Add Module main block */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        {isAddingModule ? (
          <form onSubmit={handleAddModule} className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-indigo-500" />
              Thông tin chương mới (Module)
            </h3>
            
            <div className="space-y-3">
              <input
                type="text"
                required
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                placeholder="Tiêu đề chương (Ví dụ: Chương 1: Kiến trúc căn bản)..."
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-xs text-zinc-950 bg-white focus:outline-none focus:border-indigo-500"
              />
              <textarea
                value={newModuleDesc}
                onChange={(e) => setNewModuleDesc(e.target.value)}
                placeholder="Mô tả tóm tắt nội dung chương (Không bắt buộc)..."
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-xs text-zinc-950 bg-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddingModule(false)}
                className="rounded-lg border border-zinc-200 hover:bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-650 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="rounded-lg bg-zinc-950 hover:bg-zinc-850 py-2 px-4 text-xs font-semibold text-white shadow transition-all cursor-pointer"
              >
                Tạo chương học
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingModule(true)}
            className="w-full py-4 border-2 border-dashed border-indigo-200 hover:border-indigo-300 rounded-xl text-indigo-650 hover:bg-indigo-50/50 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Tạo chương mới (Module Section)
          </button>
        )}
      </div>

      {/* Slide Sheet Modal Panel for adding material */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300"
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 translate-x-0 relative">
              
              {/* Sheet Header */}
              <div className="px-6 py-5 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
                    selectedType === 'video' ? 'bg-red-500' : selectedType === 'reading' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}>
                    {selectedType === 'video' ? (
                      <Play className="h-4.5 w-4.5" />
                    ) : selectedType === 'reading' ? (
                      <FileText className="h-4.5 w-4.5" />
                    ) : (
                      <HelpCircle className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">
                      {selectedType === 'video' ? 'Thêm bài giảng Video' : selectedType === 'reading' ? 'Thêm bài viết tự học' : 'Tạo bài trắc nghiệm mới'}
                    </h2>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {selectedType === 'video' ? 'Tải lên video bài giảng chất lượng cao.' : selectedType === 'reading' ? 'Biên soạn nội dung lý thuyết cho bài học.' : 'Thiết lập câu hỏi ôn tập củng cố kiến thức.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 border border-zinc-200 shadow-sm text-zinc-400 hover:text-zinc-650 transition bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sheet Form Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
                
                {/* VIDEO FORM */}
                {selectedType === 'video' && (
                  <form onSubmit={handleSaveMaterial} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">Tiêu đề học liệu video</label>
                      <input
                        type="text"
                        required
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                        placeholder="Ví dụ: 1.1 Khởi tạo và cấu trúc thư mục..."
                        className="w-full text-xs rounded-lg border border-zinc-300 px-3.5 py-2.5 outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">Tải lên video MP4</label>
                      <div className="border-2 border-dashed border-zinc-300 hover:border-zinc-400 rounded-xl p-8 text-center transition-colors">
                        <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                        
                        <div className="flex justify-center">
                          <label className="cursor-pointer bg-white px-3.5 py-2 border border-zinc-250 rounded-lg text-[10px] font-bold text-indigo-650 hover:bg-zinc-50 shadow-sm transition">
                            <span>Chọn tệp MP4</span>
                            <input
                              type="file"
                              accept="video/mp4"
                              ref={videoInputRef}
                              onChange={handleVideoUploadSimulation}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium pt-2">Hỗ trợ tệp MP4 lên tới 500MB</p>
                      </div>

                      {/* Video upload progress */}
                      {isUploadingVideo && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-semibold text-zinc-650">
                            <span>Đang xử lý tải video...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 rounded-full h-1.5">
                            <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      )}

                      {!isUploadingVideo && videoUrl && (
                        <div className="rounded-lg bg-green-50 border border-green-150 p-3.5 flex items-center gap-2.5 text-xs text-green-700 font-medium">
                          <Check className="h-4 w-4 text-green-500" />
                          Tải video thành công! Sẵn sàng liên kết.
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-zinc-150">
                      <button
                        type="submit"
                        disabled={isUploadingVideo || !videoUrl}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:bg-zinc-200 disabled:text-zinc-400 cursor-pointer"
                      >
                        Lưu học liệu Video
                      </button>
                    </div>
                  </form>
                )}

                {/* READING FORM */}
                {selectedType === 'reading' && (
                  <form onSubmit={handleSaveMaterial} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">Tiêu đề bài viết</label>
                      <input
                        type="text"
                        required
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                        placeholder="Ví dụ: Tổng quan lý thuyết RESTful API..."
                        className="w-full text-xs rounded-lg border border-zinc-300 px-3.5 py-2.5 outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">Nội dung văn bản</label>
                      <textarea
                        required
                        rows={12}
                        value={readingContent}
                        onChange={(e) => setReadingContent(e.target.value)}
                        placeholder="Soạn thảo nội dung kiến thức, mã nguồn mẫu, hoặc chỉ dẫn học tập tại đây..."
                        className="w-full text-xs rounded-lg border border-zinc-300 p-4 outline-none focus:border-indigo-500 resize-y leading-relaxed font-mono"
                      />
                    </div>

                    <div className="pt-6 border-t border-zinc-150">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Lưu bài viết tự học
                      </button>
                    </div>
                  </form>
                )}

                {/* QUIZ FORM */}
                {selectedType === 'quiz' && (
                  <form onSubmit={handleSaveMaterial} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">Tiêu đề bài trắc nghiệm</label>
                      <input
                        type="text"
                        required
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                        placeholder="Ví dụ: Bài kiểm tra trắc nghiệm chương 1..."
                        className="w-full text-xs rounded-lg border border-zinc-300 px-3.5 py-2.5 outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    {/* AI Generator simulated section */}
                    <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-4 border border-indigo-150 rounded-xl relative overflow-hidden space-y-3 shadow-inner">
                      <div>
                        <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                          Sinh câu hỏi trắc nghiệm tự động bằng AI (Giả lập)
                        </h4>
                        <p className="text-[10px] text-indigo-700/70 pt-0.5">Tải lên tệp PDF tài liệu của bạn, AI sẽ tự động phân tích và sinh ra các câu hỏi trắc nghiệm chất lượng.</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <label className="cursor-pointer bg-white px-3 py-1.5 border border-zinc-250 rounded-lg text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 shadow-sm transition">
                          <span>Chọn PDF</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRef}
                            onChange={handlePdfUploadSimulation}
                            className="sr-only"
                          />
                        </label>

                        {pdfFileName && (
                          <span className="text-[10px] text-zinc-500 font-semibold truncate max-w-xs">{pdfFileName}</span>
                        )}

                        <button
                          type="button"
                          onClick={handleGenerateAIQuiz}
                          disabled={isGeneratingQuiz || !pdfFileName}
                          className="sm:ml-auto inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3.5 text-[10px] rounded-lg shadow disabled:bg-zinc-200 disabled:text-zinc-400 transition cursor-pointer shrink-0"
                        >
                          {isGeneratingQuiz ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Đang phân tích...
                            </>
                          ) : (
                            <>
                              Sinh câu hỏi
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-zinc-200 pt-4 space-y-5">
                      <div className="flex items-center justify-between pb-1">
                        <h4 className="text-xs font-bold text-zinc-800">Danh sách câu hỏi ({quizQuestions.length})</h4>
                      </div>

                      {quizQuestions.map((q, qIdx) => (
                        <div key={q.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 relative group space-y-3">
                          
                          {/* Remove Question button */}
                          {quizQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuizQuestion(qIdx)}
                              className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <div className="flex gap-3">
                            <span className="h-6 w-6 rounded-full bg-zinc-250 text-zinc-700 flex items-center justify-center text-[11px] font-bold shrink-0 mt-1 shadow-inner">
                              {qIdx + 1}
                            </span>
                            <div className="flex-1 space-y-2">
                              <textarea
                                required
                                rows={2}
                                value={q.questionText}
                                onChange={(e) => {
                                  const updated = [...quizQuestions];
                                  updated[qIdx].questionText = e.target.value;
                                  setQuizQuestions(updated);
                                }}
                                placeholder="Nhập câu hỏi trắc nghiệm..."
                                className="w-full text-xs rounded-lg border border-zinc-300 p-2.5 bg-white outline-none focus:border-indigo-500 font-medium"
                              />

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-zinc-500">Điểm số:</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={q.points}
                                  onChange={(e) => {
                                    const updated = [...quizQuestions];
                                    updated[qIdx].points = parseInt(e.target.value) || 10;
                                    setQuizQuestions(updated);
                                  }}
                                  className="w-16 px-2 py-1 border border-zinc-300 rounded text-xs text-center focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Options Area */}
                          <div className="pl-9 space-y-2">
                            {q.answerOptions.map((opt: any, oIdx: number) => (
                              <div key={opt.answerOptionId} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-option-${q.id}`}
                                  checked={opt.isCorrect}
                                  onChange={() => setCorrectQuizOption(qIdx, oIdx)}
                                  className="h-4.5 w-4.5 cursor-pointer text-indigo-600 focus:ring-indigo-500"
                                />
                                
                                <input
                                  type="text"
                                  required
                                  value={opt.optionText}
                                  onChange={(e) => {
                                    const updated = [...quizQuestions];
                                    updated[qIdx].answerOptions[oIdx].optionText = e.target.value;
                                    setQuizQuestions(updated);
                                  }}
                                  placeholder={oIdx === 0 ? "Đáp án đúng mẫu..." : "Đáp án gây nhiễu..."}
                                  className={`flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none transition-colors ${
                                    opt.isCorrect 
                                      ? 'border-indigo-300 bg-indigo-50/20 font-semibold' 
                                      : 'border-zinc-300 bg-white'
                                  }`}
                                />

                                {q.answerOptions.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeQuizOption(qIdx, oIdx)}
                                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                                    title="Xóa lựa chọn"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addQuizOption(qIdx)}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 pt-1 hover:underline"
                            >
                              + Thêm lựa chọn đáp án
                            </button>
                          </div>

                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addQuizQuestion}
                        className="w-full py-2.5 border border-dashed border-zinc-300 hover:border-zinc-400 rounded-lg text-xs text-zinc-600 font-semibold flex items-center justify-center gap-1.5 transition-all bg-white cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        Thêm câu hỏi mới
                      </button>
                    </div>

                    <div className="pt-6 border-t border-zinc-150">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Lưu bài trắc nghiệm
                      </button>
                    </div>
                  </form>
                )}

              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
