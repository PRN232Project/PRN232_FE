import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { Course, CourseStatus, Module } from '../course/type';
import { Wallet, WalletTransaction } from '../auth/type';
import { InstructorStats } from './type';
import { mockCourses, mockWallets, mockTransactions } from '@/lib/service/mock-data';

export const instructorService = {
  getInstructorCourses: async (instructorId: string): Promise<Course[]> => {
    if (USE_MOCK) {
      await delay(500);
      return mockCourses.filter((c) => c.createdBy === instructorId && !c.isDeleted);
    } else {
      const res = await apiClient.get<any>('/instructor/courses');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải danh sách khóa học');
      }
      return (res.data.result || []).map((c: any) => ({
        courseId: c.courseId,
        title: c.title,
        description: c.description || '',
        price: c.price || 0,
        image: c.image || '',
        status: c.status, // Draft = 0, Pending = 1, Published = 2, Rejected = 3
        languageId: c.languageId || '',
        createdBy: c.createdBy || '',
        createdAt: c.createdAt || new Date().toISOString(),
        isDeleted: c.isDeleted || false,
        enrollmentCount: 0
      }));
    }
  },

  createCourse: async (instructorId: string, courseData: Partial<Course>): Promise<Course> => {
    if (USE_MOCK) {
      await delay(800);
      const newCourse: Course = {
        courseId: `course-${Math.random().toString(36).substring(2, 9)}`,
        title: courseData.title || 'Khóa học mới chưa đặt tên',
        description: courseData.description || '',
        price: courseData.price || 0,
        image: courseData.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
        status: CourseStatus.Draft,
        languageId: courseData.languageId || 'lang-vi',
        languageName: courseData.languageId === 'lang-en' ? 'Tiếng Anh' : 'Tiếng Việt',
        createdBy: instructorId,
        instructorName: 'ThS. Nguyễn Văn Dạy (Teacher)',
        createdAt: new Date().toISOString(),
        isDeleted: false,
        enrollmentCount: 0,
        modules: []
      };
      mockCourses.push(newCourse);
      return newCourse;
    } else {
      const formData = new FormData();
      formData.append('Title', courseData.title || '');
      formData.append('Subtitle', courseData.title || '');
      formData.append('Description', courseData.description || '');
      formData.append('Price', (courseData.price || 0).toString());
      formData.append('Level', '0');
      // Mặc định sử dụng Tiếng Việt seed Guid: 8a9b1759-b4a8-4112-8f42-2a095a8cda9a
      formData.append('LanguageId', '8a9b1759-b4a8-4112-8f42-2a095a8cda9a');
      formData.append('Tags', '');

      const res = await apiClient.post<any>('/instructor/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tạo khóa học mới');
      }
      
      const newCourseId = res.data.result;
      return {
        courseId: newCourseId,
        title: courseData.title || '',
        description: courseData.description || '',
        price: courseData.price || 0,
        status: CourseStatus.Draft,
        languageId: '8a9b1759-b4a8-4112-8f42-2a095a8cda9a',
        createdBy: instructorId,
        createdAt: new Date().toISOString(),
        isDeleted: false,
        enrollmentCount: 0
      };
    }
  },

  updateCourse: async (courseId: string, courseData: Partial<Course>): Promise<Course> => {
    if (USE_MOCK) {
      await delay(600);
      const idx = mockCourses.findIndex((c) => c.courseId === courseId);
      if (idx === -1) throw new Error('Không tìm thấy khóa học');
      mockCourses[idx] = {
        ...mockCourses[idx],
        ...courseData,
        updatedAt: new Date().toISOString()
      };
      return mockCourses[idx];
    } else {
      // Nếu frontend muốn submit course lên review
      if (courseData.status === CourseStatus.Pending) {
        const res = await apiClient.post<any>(`/instructor/courses/${courseId}/submit-review`);
        if (!res.data.isSuccess) {
          throw new Error(res.data.errorMessage || 'Lỗi khi gửi duyệt khóa học');
        }
      } else {
        const formData = new FormData();
        formData.append('CourseId', courseId);
        formData.append('Title', courseData.title || '');
        formData.append('Subtitle', courseData.title || '');
        formData.append('Description', courseData.description || '');
        formData.append('Price', (courseData.price || 0).toString());
        formData.append('Level', '0');
        formData.append('LanguageId', '8a9b1759-b4a8-4112-8f42-2a095a8cda9a');
        formData.append('Tags', '');

        const res = await apiClient.put<any>(`/instructor/courses/${courseId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (!res.data.isSuccess) {
          throw new Error(res.data.errorMessage || 'Lỗi khi cập nhật khóa học');
        }
      }
      
      return {
        courseId,
        title: courseData.title || '',
        description: courseData.description || '',
        price: courseData.price || 0,
        status: courseData.status || CourseStatus.Draft,
        languageId: '8a9b1759-b4a8-4112-8f42-2a095a8cda9a',
        createdBy: '',
        createdAt: new Date().toISOString(),
        isDeleted: false,
        enrollmentCount: 0
      };
    }
  },

  getCourseModules: async (courseId: string): Promise<Module[]> => {
    if (USE_MOCK) {
      await delay(500);
      const course = mockCourses.find((c) => c.courseId === courseId);
      return course?.modules || [];
    } else {
      const res = await apiClient.get<any>(`/instructor/courses/${courseId}/modules`);
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải đề cương khóa học');
      }
      return (res.data.result || []).map((m: any) => ({
        moduleId: m.moduleId,
        courseId: m.courseId,
        title: m.name,
        description: m.description || '',
        orderIndex: m.index || 0,
        lessons: (m.lessons || []).map((l: any) => ({
          lessonId: l.lessonId,
          moduleId: l.moduleId,
          title: l.title,
          content: l.content || '',
          orderIndex: l.orderIndex || 0,
          lessonItems: (l.lessonItems || []).map((li: any) => ({
            lessonItemId: li.lessonItemId,
            lessonId: li.lessonId,
            title: li.title || 'Học liệu',
            type: li.type,
            durationMinutes: li.durationMinutes || 15,
            orderIndex: li.orderIndex || 0,
            content: li.content || '',
            videoUrl: li.resourceUrl || '',
            videoSourceType: li.videoSourceType || 1
          }))
        }))
      }));
    }
  },

  saveCurriculum: async (courseId: string, modules: Module[]): Promise<void> => {
    if (USE_MOCK) {
      await delay(800);
      const course = mockCourses.find((c) => c.courseId === courseId);
      if (!course) throw new Error('Không tìm thấy khóa học');
      course.modules = modules;
    } else {
      // Đồng bộ lần lượt các chương học (modules) và bài học (lessons)
      for (const m of modules) {
        let currentModuleId = m.moduleId;
        const isNewModule = currentModuleId.startsWith('module-') || currentModuleId.startsWith('mod-mock-');
        
        if (isNewModule) {
          const createModRes = await apiClient.post<any>(`/instructor/courses/${courseId}/modules`, {
            name: m.title,
            description: m.title,
            index: m.orderIndex
          });
          if (!createModRes.data.isSuccess) {
            throw new Error(createModRes.data.errorMessage || 'Lỗi khi tạo chương học');
          }
          currentModuleId = createModRes.data.result.moduleId;
        } else {
          const updateModRes = await apiClient.put<any>(`/instructor/modules/${m.moduleId}`, {
            moduleId: m.moduleId,
            name: m.title,
            description: m.title,
            index: m.orderIndex
          });
          if (!updateModRes.data.isSuccess) {
            throw new Error(updateModRes.data.errorMessage || 'Lỗi khi cập nhật chương học');
          }
        }
        
        if (m.lessons) {
          for (const l of m.lessons) {
            let currentLessonId = l.lessonId;
            const isNewLesson = currentLessonId.startsWith('lesson-') || currentLessonId.startsWith('les-mock-');
            
            if (isNewLesson) {
              const createLessRes = await apiClient.post<any>(`/instructor/modules/${currentModuleId}/lessons`, {
                title: l.title,
                content: l.title,
                orderIndex: l.orderIndex,
                estimatedMinutes: 10
              });
              if (!createLessRes.data.isSuccess) {
                throw new Error(createLessRes.data.errorMessage || 'Lỗi khi tạo bài học');
              }
              currentLessonId = createLessRes.data.result.lessonId;
            } else {
              const updateLessRes = await apiClient.put<any>(`/instructor/lessons/${l.lessonId}`, {
                title: l.title,
                description: l.title,
                estimatedMinutes: 10
              });
              if (!updateLessRes.data.isSuccess) {
                throw new Error(updateLessRes.data.errorMessage || 'Lỗi khi cập nhật bài học');
              }
            }

            // Đồng bộ học liệu của bài học
            const items = l.lessonItems || [];
            for (const item of items) {
              const isNewItem = item.lessonItemId.startsWith('item-');
              if (isNewItem) {
                if (item.type === 0) { // Video
                  if (item.videoSourceType === 2 && item.videoFile) {
                    const formData = new FormData();
                    formData.append('Title', item.title);
                    formData.append('VideoSourceType', '2');
                    formData.append('VideoFile', item.videoFile);
                    formData.append('OrderIndex', (item.orderIndex || 1).toString());
                    
                    await apiClient.post<any>(`/instructor/lessons/${currentLessonId}/items/video`, formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                  } else {
                    await apiClient.post<any>(`/instructor/lessons/${currentLessonId}/items/video`, {
                      title: item.title,
                      videoSourceType: item.videoSourceType || 1, // YouTube URL
                      videoUrl: item.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                      orderIndex: item.orderIndex || 1
                    });
                  }
                } else if (item.type === 1) { // Article / Reading
                  await apiClient.post<any>(`/instructor/lessons/${currentLessonId}/items/reading`, {
                    title: item.title,
                    content: item.content || 'Nội dung bài học tự biên soạn.',
                    orderIndex: item.orderIndex || 1
                  });
                } else if (item.type === 2 && item.gradedItem) { // Quiz
                  const g = item.gradedItem;
                  await apiClient.post<any>(`/instructor/lessons/${currentLessonId}/items/quiz`, {
                    title: g.title || item.title,
                    orderIndex: item.orderIndex || 1,
                    questions: (g.questions || []).map((q: any, qIdx: number) => ({
                      content: q.questionText,
                      points: q.points || 10,
                      orderIndex: qIdx + 1,
                      explanation: '',
                      options: (q.answerOptions || []).map((o: any, oIdx: number) => ({
                        text: o.optionText,
                        isCorrect: o.isCorrect,
                        orderIndex: oIdx + 1
                      }))
                    }))
                  });
                }
              }
            }
          }
        }
      }
    }
  },

  getWallet: async (userId: string): Promise<Wallet> => {
    if (USE_MOCK) {
      await delay(400);
      let wallet = mockWallets.find((w) => w.userId === userId);
      if (!wallet) {
        wallet = {
          walletId: `wallet-${Math.random().toString(36).substring(2, 9)}`,
          userId,
          balance: 0
        };
        mockWallets.push(wallet);
      }
      return wallet;
    } else {
      const res = await apiClient.get<any>('/instructor/wallet');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải thông tin ví');
      }
      const w = res.data.result;
      return {
        walletId: w.walletId,
        userId: w.userId,
        balance: Number(w.balance || 0)
      };
    }
  },

  getTransactions: async (walletId: string): Promise<WalletTransaction[]> => {
    if (USE_MOCK) {
      await delay(500);
      return mockTransactions.filter((t) => t.walletId === walletId);
    } else {
      const res = await apiClient.get<any>('/instructor/wallet');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải danh sách giao dịch');
      }
      const w = res.data.result;
      const txs = w.transactions || [];
      return txs.map((t: any) => {
        // Map backend TransactionType (0: Earning, 1: Withdrawal) to frontend TransactionType (2: Earnings, 1: Withdrawal)
        const isEarning = t.transactionType === 0;
        const type = isEarning ? 2 : 1; 

        // Map status based on description
        let status = 1; // Completed by default
        if (!isEarning) {
          if (t.description && t.description.includes('(Pending)')) {
            status = 0; // Pending
          } else if (t.description && t.description.includes('(Approved)')) {
            status = 1; // Completed
          }
        }

        // FE expects positive amount to display it correctly
        const amount = Math.abs(Number(t.amount || 0));

        return {
          walletTransactionId: t.transactionId,
          walletId: walletId,
          amount: amount,
          type: type,
          status: status,
          createdAt: t.createdAt,
          description: t.description
        };
      });
    }
  },

  requestPayout: async (walletId: string, amount: number, note: string): Promise<WalletTransaction> => {
    if (USE_MOCK) {
      await delay(800);
      const wallet = mockWallets.find((w) => w.walletId === walletId);
      if (!wallet) throw new Error('Không tìm thấy ví');
      if (wallet.balance < amount) throw new Error('Số dư ví không đủ để rút');

      wallet.balance -= amount;

      const newTx: WalletTransaction = {
        walletTransactionId: `tx-${Math.random().toString(36).substring(2, 9)}`,
        walletId,
        amount,
        type: 1,
        status: 0,
        createdAt: new Date().toISOString(),
        description: `Yêu cầu rút tiền: ${note}`,
      };
      
      mockTransactions.unshift(newTx);
      return newTx;
    } else {
      const res = await apiClient.post<any>('/instructor/wallet/withdrawals', {
        amount,
        bankInfo: note
      });
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi yêu cầu rút tiền');
      }
      return {
        walletTransactionId: `tx-${Math.random().toString(36).substring(2, 9)}`,
        walletId,
        amount,
        type: 1,
        status: 0,
        createdAt: new Date().toISOString(),
        description: `Yêu cầu rút tiền: ${note}`
      };
    }
  },

  getStats: async (instructorId: string): Promise<InstructorStats> => {
    if (USE_MOCK) {
      await delay(600);
      const courses = mockCourses.filter((c) => c.createdBy === instructorId && !c.isDeleted);
      const activeCoursesCount = courses.filter((c) => c.status === CourseStatus.Published).length;
      
      let totalStudents = 0;
      courses.forEach((c) => {
        totalStudents += c.enrollmentCount || 0;
      });

      const totalEarnings = 15450000;
      
      const monthlyRevenue = [
        { month: 'T1', amount: 1200000 },
        { month: 'T2', amount: 1800000 },
        { month: 'T3', amount: 2500000 },
        { month: 'T4', amount: 3200000 },
        { month: 'T5', amount: 4800000 },
        { month: 'T6', amount: 1950000 },
      ];

      const popularCourses = courses.map((c) => ({
        title: c.title,
        enrollments: c.enrollmentCount || 0,
        revenue: (c.enrollmentCount || 0) * c.price * 0.9
      })).sort((a, b) => b.enrollments - a.enrollments);

      return {
        totalEarnings,
        totalStudents,
        activeCoursesCount,
        averageRating: 4.8,
        monthlyRevenue,
        popularCourses
      };
    } else {
      const res = await apiClient.get<any>('/instructor/dashboard');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải thông số giảng viên');
      }
      const data = res.data.result;
      return {
        totalEarnings: Number(data.totalRevenue || 0) * 0.9,
        totalStudents: data.totalStudents || 0,
        activeCoursesCount: 0,
        averageRating: 4.8,
        monthlyRevenue: [],
        popularCourses: []
      };
    }
  }
};
