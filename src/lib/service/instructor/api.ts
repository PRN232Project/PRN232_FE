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
        const isNewModule = currentModuleId.startsWith('module-');
        
        if (isNewModule) {
          const createModRes = await apiClient.post<any>(`/instructor/courses/${courseId}/modules`, {
            name: m.title,
            description: m.title,
            index: m.orderIndex
          });
          if (!createModRes.data.isSuccess) {
            throw new Error(createModRes.data.errorMessage || 'Lỗi khi tạo chương học');
          }
          currentModuleId = createModRes.data.result;
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
            const isNewLesson = l.lessonId.startsWith('lesson-');
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
      // Do backend chưa viết API transactions riêng của giảng viên nên ta mock danh sách rỗng khi chạy thật
      await delay(200);
      return [];
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
