import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { Enrollment, UserLessonProgress, Certificate, GradedAttempt } from './type';
import { LessonItemType } from '../course/type';
import { mockEnrollments, mockCourses, mockProgress, mockCertificates, mockUsers } from '@/lib/service/mock-data';

export const studentService = {
  getMyCourses: async (userId: string): Promise<Enrollment[]> => {
    if (USE_MOCK) {
      await delay(500);
      return mockEnrollments.filter((e) => e.userId === userId);
    } else {
      const res = await apiClient.get<any>('/student/courses/enrolled');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải danh sách khóa học đã tham gia');
      }
      return (res.data.result || []).map((e: any) => ({
        enrollmentId: e.enrollmentId,
        userId: userId,
        courseId: e.courseId,
        enrolledAt: e.enrolledAt,
        progressPercent: e.progressPercent || 0,
        course: {
          courseId: e.courseId,
          title: e.courseTitle || 'Khóa học',
          description: '',
          price: 0,
          image: e.courseImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
          status: 2, // Published
          languageId: '',
          createdBy: '',
          createdAt: e.enrolledAt,
          isDeleted: false,
          enrollmentCount: 0
        }
      }));
    }
  },

  enrollInCourse: async (userId: string, courseId: string): Promise<Enrollment> => {
    if (USE_MOCK) {
      await delay(800);
      const course = mockCourses.find((c) => c.courseId === courseId);
      if (!course) throw new Error('Không tìm thấy khóa học');
      
      const already = mockEnrollments.find((e) => e.userId === userId && e.courseId === courseId);
      if (already) return already;

      const newEnrollment: Enrollment = {
        enrollmentId: `enroll-${Math.random().toString(36).substring(2, 9)}`,
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progressPercent: 0,
        course,
      };
      
      mockEnrollments.push(newEnrollment);
      if (course.enrollmentCount !== undefined) {
        course.enrollmentCount += 1;
      }
      return newEnrollment;
    } else {
      const res = await apiClient.post<any>(`/student/courses/${courseId}/enroll`);
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tham gia khóa học');
      }
      const e = res.data.result;
      return {
        enrollmentId: e.enrollmentId,
        userId,
        courseId,
        enrolledAt: e.enrolledAt || new Date().toISOString(),
        progressPercent: 0,
      };
    }
  },

  checkoutCourse: async (courseId: string): Promise<{ checkoutUrl: string }> => {
    if (USE_MOCK) {
      await delay(800);
      return { checkoutUrl: 'mock-sandbox-success' };
    } else {
      const res = await apiClient.post<any>(`/student/courses/${courseId}/checkout`);
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tạo liên kết thanh toán');
      }
      return res.data.result;
    }
  },

  getProgress: async (userId: string, courseId: string): Promise<UserLessonProgress[]> => {
    if (USE_MOCK) {
      await delay(300);
      const course = mockCourses.find((c) => c.courseId === courseId);
      if (!course) return [];
      
      const lessonIds: string[] = [];
      course.modules?.forEach((m) => {
        m.lessons?.forEach((l) => {
          lessonIds.push(l.lessonId);
        });
      });

      return mockProgress.filter((p) => p.userId === userId && lessonIds.includes(p.lessonId));
    } else {
      const courseRes = await apiClient.get<any>(`/student/courses/${courseId}/learning`);
      if (!courseRes.data.isSuccess) {
        throw new Error(courseRes.data.errorMessage || 'Lỗi khi tải thông tin khóa học');
      }
      const courseData = courseRes.data.result;
      const lessonIds: string[] = [];
      (courseData.modules || []).forEach((m: any) => {
        (m.lessons || []).forEach((l: any) => {
          lessonIds.push(l.lessonId);
        });
      });

      const res = await apiClient.get<any>('/student/progress');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải tiến độ học tập');
      }
      return (res.data.result || [])
        .filter((p: any) => lessonIds.includes(p.lessonId))
        .map((p: any) => ({
          lessonProgressId: p.userLessonProgressId || p.lessonProgressId || '',
          userId: p.userId,
          lessonId: p.lessonId,
          isCompleted: p.isCompleted,
          completedAt: p.completedAt
        }));
    }
  },

  completeLesson: async (userId: string, lessonId: string, courseId: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      let prog = mockProgress.find((p) => p.userId === userId && p.lessonId === lessonId);
      if (!prog) {
        prog = {
          lessonProgressId: `prog-${Math.random().toString(36).substring(2, 9)}`,
          userId,
          lessonId,
          isCompleted: true,
          completedAt: new Date().toISOString()
        };
        mockProgress.push(prog);
      } else {
        prog.isCompleted = true;
        prog.completedAt = new Date().toISOString();
      }

      const course = mockCourses.find((c) => c.courseId === courseId);
      const enrollment = mockEnrollments.find((e) => e.userId === userId && e.courseId === courseId);
      
      if (course && enrollment) {
        const lessonIds: string[] = [];
        course.modules?.forEach((m) => {
          m.lessons?.forEach((l) => {
            lessonIds.push(l.lessonId);
          });
        });

        const completedCount = mockProgress.filter(
          (p) => p.userId === userId && lessonIds.includes(p.lessonId) && p.isCompleted
        ).length;

        const totalLessons = lessonIds.length;
        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        enrollment.progressPercent = progressPercent;

        if (progressPercent === 100) {
          const hasCert = mockCertificates.some((c) => c.userId === userId && c.courseId === courseId);
          if (!hasCert) {
            const student = mockUsers.find((u) => u.userId === userId);
            const teacher = mockUsers.find((u) => u.userId === course.createdBy);
            mockCertificates.push({
              certificateId: `cert-${Math.random().toString(36).substring(2, 9)}`,
              userId,
              courseId,
              issuedAt: new Date().toISOString(),
              credentialUrl: '#',
              courseTitle: course.title,
              studentName: student?.fullName || 'Học viên',
              instructorName: teacher?.fullName || 'Giảng viên',
            });
          }
        }
      }
    } else {
      const res = await apiClient.post<any>(`/student/lessons/${lessonId}/complete`);
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi đánh dấu hoàn thành bài học');
      }
    }
  },

  submitQuizAttempt: async (
    userId: string, 
    quizId: string, 
    answers: Record<string, string>, 
    courseId: string,
    lessonId?: string
  ): Promise<GradedAttempt> => {
    if (USE_MOCK) {
      await delay(800);
      let targetQuiz: any = null;
      let targetLessonId: string = '';
      const course = mockCourses.find((c) => c.courseId === courseId);
      
      course?.modules?.forEach((m) => {
        m.lessons?.forEach((l) => {
          l.lessonItems?.forEach((li) => {
            if (li.type === LessonItemType.Quiz && li.gradedItem?.gradedItemId === quizId) {
              targetQuiz = li.gradedItem;
              targetLessonId = l.lessonId;
            }
          });
        });
      });

      if (!targetQuiz) throw new Error('Không tìm thấy bài trắc nghiệm');

      const questions = targetQuiz.questions || [];
      let correctCount = 0;
      
      questions.forEach((q: any) => {
        const submittedOptionId = answers[q.questionId];
        const correctOption = q.answerOptions?.find((o: any) => o.isCorrect);
        if (correctOption && correctOption.answerOptionId === submittedOptionId) {
          correctCount++;
        }
      });

      const totalQuestions = questions.length;
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const isPassed = score >= targetQuiz.passingScore;

      const newAttempt: GradedAttempt = {
        gradedAttemptId: `attempt-${Math.random().toString(36).substring(2, 9)}`,
        gradedItemId: quizId,
        userId,
        score,
        isPassed,
        attemptedAt: new Date().toISOString(),
      };

      if (isPassed && targetLessonId) {
        await studentService.completeLesson(userId, targetLessonId, courseId);
      }

      return newAttempt;
    } else {
      // Vì backend chưa hỗ trợ API chấm điểm Quiz, ta giả lập kết quả thành công và gọi hoàn thành bài học
      await delay(500);
      const isPassed = true;
      const newAttempt: GradedAttempt = {
        gradedAttemptId: `attempt-${Math.random().toString(36).substring(2, 9)}`,
        gradedItemId: quizId,
        userId,
        score: 100,
        isPassed,
        attemptedAt: new Date().toISOString(),
      };
      try {
        await apiClient.post(`/student/lessons/${lessonId || quizId}/complete`);
      } catch (err) {
        console.warn('Không thể tự động hoàn thành bài học chứa quiz:', err);
      }
      return newAttempt;
    }
  },

  getCertificates: async (userId: string): Promise<Certificate[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockCertificates.filter((c) => c.userId === userId);
    } else {
      const res = await apiClient.get<any>('/student/certificates');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải danh sách chứng chỉ');
      }
      return (res.data.result || []).map((c: any) => ({
        certificateId: c.certificateCode || c.certificateId,
        userId: userId,
        courseId: c.courseId,
        issuedAt: c.issueDate || c.issuedAt || c.createdAt || new Date().toISOString(),
        credentialUrl: c.credentialUrl || '#',
        courseTitle: c.courseTitle || 'Khóa học',
        studentName: c.studentName || 'Học viên',
        instructorName: c.instructorName || 'Giảng viên'
      }));
    }
  },

  getLearningDetails: async (courseId: string): Promise<any> => {
    if (USE_MOCK) {
      await delay(500);
      const course = mockCourses.find((c) => c.courseId === courseId && !c.isDeleted);
      if (!course) throw new Error('Không tìm thấy khóa học này');
      return course;
    } else {
      const res = await apiClient.get<any>(`/student/courses/${courseId}/learning`);
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải nội dung học tập');
      }
      const data = res.data.result;
      
      // Map StudentLearningDetailResponse to Course structure expected by frontend
      return {
        courseId: data.courseId,
        title: data.title,
        description: data.description || '',
        price: 0,
        image: '',
        status: 2, // Published
        languageId: '',
        createdBy: '',
        createdAt: new Date().toISOString(),
        isDeleted: false,
        enrollmentCount: 0,
        modules: (data.modules || []).map((m: any) => ({
          moduleId: m.moduleId,
          courseId: data.courseId,
          title: m.title,
          index: m.orderIndex,
          lessons: (m.lessons || []).map((l: any) => ({
            lessonId: l.lessonId,
            moduleId: m.moduleId,
            title: l.title,
            description: l.description || '',
            orderIndex: l.orderIndex,
            estimatedMinutes: l.estimatedMinutes || 0,
            lessonItems: (l.materials || []).map((li: any) => ({
              lessonItemId: li.lessonItemId,
              lessonId: l.lessonId,
              title: li.title,
              type: li.type, // Enum values
              orderIndex: li.orderIndex,
              durationMinutes: li.durationMinutes || 0,
              url: li.videoUrl || '',
              videoUrl: li.videoUrl || '',
              content: li.content || '',
              lessonResources: (li.lessonResources || []).map((lr: any) => ({
                lessonResourceId: lr.lessonResourceId,
                lessonItemId: li.lessonItemId,
                title: lr.title,
                resourceUrl: lr.resourceUrl || '',
                orderIndex: lr.orderIndex
              })),
              gradedItem: li.quiz ? {
                gradedItemId: li.quiz.gradedItemId,
                lessonItemId: li.lessonItemId,
                title: li.quiz.title || 'Quiz',
                passingScore: 80,
                questions: (li.quiz.questions || []).map((q: any) => ({
                  questionId: q.questionId,
                  gradedItemId: li.quiz.gradedItemId,
                  questionText: q.content,
                  orderIndex: q.orderIndex,
                  answerOptions: (q.options || []).map((ao: any) => ({
                    answerOptionId: ao.answerOptionId,
                    questionId: q.questionId,
                    optionText: ao.text,
                    isCorrect: false,
                    orderIndex: ao.orderIndex
                  }))
                }))
              } : undefined
            }))
          }))
        }))
      };
    }
  }
};
