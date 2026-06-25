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
      const res = await apiClient.get<Enrollment[]>(`/students/${userId}/courses`);
      return res.data;
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
      const res = await apiClient.post<Enrollment>(`/students/enroll`, { userId, courseId });
      return res.data;
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
      const res = await apiClient.get<UserLessonProgress[]>(`/students/${userId}/courses/${courseId}/progress`);
      return res.data;
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
      await apiClient.post(`/students/progress/complete`, { userId, lessonId, courseId });
    }
  },

  submitQuizAttempt: async (
    userId: string, 
    quizId: string, 
    answers: Record<string, string>, 
    courseId: string
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
      const res = await apiClient.post<GradedAttempt>(`/students/quiz/submit`, { userId, quizId, answers, courseId });
      return res.data;
    }
  },

  getCertificates: async (userId: string): Promise<Certificate[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockCertificates.filter((c) => c.userId === userId);
    } else {
      const res = await apiClient.get<Certificate[]>(`/students/${userId}/certificates`);
      return res.data;
    }
  }
};
