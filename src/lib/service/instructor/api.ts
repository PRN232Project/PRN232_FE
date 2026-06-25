import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { Course, CourseStatus, Module } from '../course/type';
import { Wallet, WalletTransaction } from '../auth/type';
import { InstructorStats } from './type';
import { mockCourses, mockWallets, mockTransactions } from '../mock-data';

export const instructorService = {
  getInstructorCourses: async (instructorId: string): Promise<Course[]> => {
    if (USE_MOCK) {
      await delay(500);
      return mockCourses.filter((c) => c.createdBy === instructorId && !c.isDeleted);
    } else {
      const res = await apiClient.get<Course[]>(`/teachers/${instructorId}/courses`);
      return res.data;
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
      const res = await apiClient.post<Course>(`/teachers/courses`, { ...courseData, createdBy: instructorId });
      return res.data;
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
      const res = await apiClient.put<Course>(`/teachers/courses/${courseId}`, courseData);
      return res.data;
    }
  },

  saveCurriculum: async (courseId: string, modules: Module[]): Promise<void> => {
    if (USE_MOCK) {
      await delay(800);
      const course = mockCourses.find((c) => c.courseId === courseId);
      if (!course) throw new Error('Không tìm thấy khóa học');
      course.modules = modules;
    } else {
      await apiClient.post(`/teachers/courses/${courseId}/curriculum`, { modules });
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
      const res = await apiClient.get<Wallet>(`/teachers/${userId}/wallet`);
      return res.data;
    }
  },

  getTransactions: async (walletId: string): Promise<WalletTransaction[]> => {
    if (USE_MOCK) {
      await delay(500);
      return mockTransactions.filter((t) => t.walletId === walletId);
    } else {
      const res = await apiClient.get<WalletTransaction[]>(`/teachers/wallets/${walletId}/transactions`);
      return res.data;
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
      const res = await apiClient.post<WalletTransaction>(`/teachers/wallets/${walletId}/withdraw`, { amount, note });
      return res.data;
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
      const res = await apiClient.get<InstructorStats>(`/teachers/${instructorId}/stats`);
      return res.data;
    }
  }
};
