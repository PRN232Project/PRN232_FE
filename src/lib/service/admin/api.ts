import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { User, WalletTransaction } from '../auth/type';
import { Course, CourseStatus } from '../course/type';
import { AdminStats } from './type';
import { mockUsers, mockCourses, mockTransactions } from '@/lib/service/mock-data';

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
      const year = new Date().getFullYear();
      const [overviewRes, dashboardRes, pendingCoursesRes] = await Promise.all([
        apiClient.get<any>('/admin/overview'),
        apiClient.get<any>(`/admin/dashboard?year=${year}`),
        apiClient.get<any>('/admin/courses/pending')
      ]);

      const overview = overviewRes.data;
      const dashboard = dashboardRes.data;
      const pendingCourses = pendingCoursesRes.data.result || [];

      const monthlyRevenue = (dashboard.revenueMonths || []).map((m: string, i: number) => ({
        month: m,
        revenue: dashboard.revenueData?.[i] || 0
      }));

      return {
        totalRevenue: Number(overview.totalRevenue || 0),
        totalStudents: dashboard.studentCount || overview.totalEnrollments || 0,
        totalInstructors: dashboard.instructorCount || 0,
        pendingCoursesCount: pendingCourses.length,
        monthlyRevenue,
        roleDistribution: [
          { name: 'Admin', value: dashboard.adminCount || 0 },
          { name: 'Giảng viên', value: dashboard.instructorCount || 0 },
          { name: 'Học viên', value: dashboard.studentCount || 0 }
        ]
      };
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
      const res = await apiClient.get<any>('/admin/users', { 
        params: { 
          search, 
          pageSize: 1000 // Get large page size to support client-side filtering/sorting
        } 
      });
      return (res.data.users || []).map((u: any) => ({
        userId: u.userId,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        isDeleted: u.isDeleted,
        createdAt: u.createdAt,
        isVerified: true
      }));
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
      await apiClient.patch(`/admin/users/${userId}/toggle-ban`);
      // Fetch details again because toggle-ban returns NoContent (204)
      const userRes = await apiClient.get<any>(`/admin/users/${userId}`);
      const u = userRes.data;
      return {
        userId: u.userId,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        isDeleted: u.isDeleted,
        createdAt: u.createdAt,
        isVerified: true
      };
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
      // Get current user details first
      const userRes = await apiClient.get<any>(`/admin/users/${userId}`);
      const u = userRes.data;
      
      await apiClient.put(`/admin/users/${userId}`, {
        fullName: u.fullName,
        phoneNumber: u.phoneNumber || '',
        bio: u.bio || '',
        title: u.title || '',
        role: role
      });

      // Get updated details
      const updatedRes = await apiClient.get<any>(`/admin/users/${userId}`);
      const updated = updatedRes.data;
      return {
        userId: updated.userId,
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
        isDeleted: updated.isDeleted,
        createdAt: updated.createdAt,
        isVerified: true
      };
    }
  },

  getPendingCourses: async (): Promise<Course[]> => {
    if (USE_MOCK) {
      await delay(500);
      return mockCourses.filter((c) => c.status === CourseStatus.Pending && !c.isDeleted);
    } else {
      const res = await apiClient.get<any>('/admin/courses/pending');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải danh sách khóa học chờ duyệt');
      }
      return (res.data.result || []).map((c: any) => ({
        courseId: c.courseId,
        title: c.title,
        description: c.description || '',
        price: c.price || 0,
        image: c.image || '',
        status: CourseStatus.Pending,
        createdAt: c.createdAt,
        instructorName: c.instructorName || 'Unknown Instructor',
        enrollmentCount: 0,
        languageId: '',
        createdBy: '',
        isDeleted: false
      }));
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
      const res = await apiClient.post<any>('/admin/courses/review', {
        courseId,
        status: approve,
        rejectReason: comment || ''
      });
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi kiểm duyệt khóa học');
      }
      const c = res.data.result;
      return {
        courseId: c.courseId,
        title: c.title,
        description: c.description || '',
        price: c.price || 0,
        image: c.image || '',
        status: approve ? CourseStatus.Published : CourseStatus.Rejected,
        createdAt: c.createdAt,
        instructorName: c.instructorName || 'Unknown Instructor',
        enrollmentCount: 0,
        languageId: '',
        createdBy: '',
        isDeleted: false
      };
    }
  },

  getPendingPayouts: async (): Promise<WalletTransaction[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockTransactions.filter((t) => t.type === 1 && t.status === 0);
    } else {
      const res = await apiClient.get<any>('/admin/payouts/pending');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải danh sách yêu cầu rút tiền');
      }
      // Map PendingPayoutResponse to WalletTransaction format
      return (res.data.result || []).map((w: any) => ({
        walletTransactionId: w.transactionId,
        walletId: w.walletId,
        amount: w.amount,
        type: 1, // Withdrawal
        status: 0, // Pending
        createdAt: w.requestedAt || new Date().toISOString(),
        description: `Giảng viên: ${w.instructorName} (${w.instructorEmail}) - Ngân hàng: ${w.bankInfo}`
      }));
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
      const res = await apiClient.post<any>(`/admin/payouts/${transactionId}/approve`);
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi duyệt yêu cầu rút tiền');
      }
      return {
        walletTransactionId: transactionId,
        walletId: transactionId,
        amount: 0,
        type: 1,
        status: 1, // Completed
        createdAt: new Date().toISOString()
      };
    }
  }
};
