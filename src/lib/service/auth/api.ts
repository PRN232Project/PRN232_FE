import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { User, UserRole } from './type';
import { mockUsers } from '../mock-data';

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (USE_MOCK) {
      await delay(600);
      const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('Email hoặc mật khẩu không chính xác');
      }
      
      const token = `mock-jwt-token-for-${user.role}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } else {
      const res = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data;
    }
  },

  register: async (fullName: string, email: string, role: UserRole): Promise<User> => {
    if (USE_MOCK) {
      await delay(800);
      const exists = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('Email đã được sử dụng trong hệ thống');
      }
      const newUser: User = {
        userId: `user-id-${Math.random().toString(36).substring(2, 9)}`,
        fullName,
        email,
        isVerified: false,
        role,
        createdAt: new Date().toISOString(),
        isDeleted: false,
      };
      mockUsers.push(newUser);
      return newUser;
    } else {
      const res = await apiClient.post<User>('/auth/register', { fullName, email, role });
      return res.data;
    }
  },

  verifyEmail: async (email: string, otpCode: string): Promise<boolean> => {
    if (USE_MOCK) {
      await delay(500);
      const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        user.isVerified = true;
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser) as User;
          if (parsed.email === email) {
            parsed.isVerified = true;
            localStorage.setItem('user', JSON.stringify(parsed));
          }
        }
        return true;
      }
      throw new Error('Không tìm thấy tài khoản để xác thực');
    } else {
      const res = await apiClient.post<{ success: boolean }>('/auth/verify', { email, otpCode });
      return res.data.success;
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          return JSON.parse(stored) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await delay(200);
    } else {
      try {
        await apiClient.post('/auth/logout');
      } catch (err) {
        console.error('Logout error on backend:', err);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  updateProfile: async (bio: string, title: string, fullName: string, phoneNumber?: string): Promise<User> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Chưa đăng nhập');

    if (USE_MOCK) {
      await delay(600);
      const userIdx = mockUsers.findIndex((u) => u.userId === currentUser.userId);
      if (userIdx !== -1) {
        mockUsers[userIdx] = {
          ...mockUsers[userIdx],
          fullName,
          bio,
          title,
          phoneNumber,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('user', JSON.stringify(mockUsers[userIdx]));
        return mockUsers[userIdx];
      }
      throw new Error('Không tìm thấy người dùng');
    } else {
      const res = await apiClient.put<User>(`/auth/profile`, { fullName, bio, title, phoneNumber });
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    }
  }
};
