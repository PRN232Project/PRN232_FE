import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { User, WalletTransaction } from '../auth/type';
import { Course, CourseStatus } from '../course/type';
import { AdminStats } from './type';
import { mockUsers, mockCourses, mockTransactions } from '../mock-data';

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    if (USE_MOCK) {
      await delay(600);
      const studentCount = mockUsers.filter((u) => u.role === 2).length;
      const instructorCount = mockUsers.filter((u) => u.role === 1).length;
      const pendingCoursesCount = mockCourses.filter((c) => c.status === CourseStatus.Pending).length;

      return {
        totalRevenue: 28450000,
        totalStudents: studentCount,
        totalInstructors: instructorCount,
        pendingCoursesCount,
        monthlyRevenue: [
          { month: 'T1', revenue: 4000000 },
          { month: 'T2', revenue: 5500000 },
          { month: 'T3', revenue: 7800000 },
          { month: 'T4', revenue: 9200000 },
          { month: 'T5', revenue: 11000000 },
          { month: 'T6', revenue: 6450000 },
        ],
        roleDistribution: [
          { name: 'Admin', value: mockUsers.filter((u) => u.role === 0).length },
          { name: 'Giảng viên', value: instructorCount },
          { name: 'Học viên', value: studentCount },
        ]
      };
    } else {
      const res = await apiClient.get<AdminStats>('/admin/stats');
      return res.data;
    }
  },

  getUsers: async (search?: string): Promise<User[]> => {
    if (USE_MOCK) {
      await delay(500);
      if (search) {
        const query = search.toLowerCase();
        return mockUsers.filter((u) => u.fullName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
      }
      return mockUsers;
    } else {
      const res = await apiClient.get<User[]>('/admin/users', { params: { search } });
      return res.data;
    }
  },

  toggleUserLock: async (userId: string): Promise<User> => {
    if (USE_MOCK) {
      await delay(400);
      const user = mockUsers.find((u) => u.userId === userId);
      if (!user) throw new Error('Không tìm thấy người dùng');
      user.isDeleted = !user.isDeleted;
      return user;
    } else {
      const res = await apiClient.post<User>(`/admin/users/${userId}/toggle-lock`);
      return res.data;
    }
  },

  changeUserRole: async (userId: string, role: number): Promise<User> => {
    if (USE_MOCK) {
      await delay(400);
      const user = mockUsers.find((u) => u.userId === userId);
      if (!user) throw new Error('Không tìm thấy người dùng');
      user.role = role;
      return user;
    } else {
      const res = await apiClient.post<User>(`/admin/users/${userId}/role`, { role });
      return res.data;
    }
  },

  getPendingCourses: async (): Promise<Course[]> => {
    if (USE_MOCK) {
      await delay(500);
      return mockCourses.filter((c) => c.status === CourseStatus.Pending && !c.isDeleted);
    } else {
      const res = await apiClient.get<Course[]>('/admin/courses/pending');
      return res.data;
    }
  },

  reviewCourse: async (courseId: string, approve: boolean, comment?: string): Promise<Course> => {
    if (USE_MOCK) {
      await delay(700);
      const course = mockCourses.find((c) => c.courseId === courseId);
      if (!course) throw new Error('Không tìm thấy khóa học');
      
      course.status = approve ? CourseStatus.Published : CourseStatus.Rejected;
      course.updatedAt = new Date().toISOString();
      return course;
    } else {
      const res = await apiClient.post<Course>(`/admin/courses/${courseId}/review`, { approve, comment });
      return res.data;
    }
  },

  getPendingPayouts: async (): Promise<WalletTransaction[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockTransactions.filter((t) => t.type === 1 && t.status === 0);
    } else {
      const res = await apiClient.get<WalletTransaction[]>('/admin/payouts/pending');
      return res.data;
    }
  },

  approvePayout: async (transactionId: string): Promise<WalletTransaction> => {
    if (USE_MOCK) {
      await delay(600);
      const tx = mockTransactions.find((t) => t.walletTransactionId === transactionId);
      if (!tx) throw new Error('Không tìm thấy giao dịch');
      tx.status = 1;
      return tx;
    } else {
      const res = await apiClient.post<WalletTransaction>(`/admin/payouts/${transactionId}/approve`);
      return res.data;
    }
  }
};
