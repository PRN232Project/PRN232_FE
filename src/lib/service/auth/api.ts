import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { User, UserRole } from './type';
import { mockUsers } from '@/lib/service/mock-data';

export interface LoginResponse {
  user: User;
  token: string;
}

interface DecodedToken {
  UserId?: string;
  Role?: string;
  Email?: string;
  Avatar?: string;
  unique_name?: string;
  [key: string]: any;
}

// Mảng giải mã token JWT thủ công ở Frontend
function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
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
      const res = await apiClient.post<any>('/auth/login', { email, password });
      const responseData = res.data;
      
      if (!responseData.isSuccess) {
        throw new Error(responseData.errorMessage || 'Email hoặc mật khẩu không chính xác');
      }
      
      const token = responseData.result;
      const decoded = decodeToken(token);
      
      if (!decoded) {
        throw new Error('Mã xác thực từ server không hợp lệ');
      }
      
      const roleVal = parseInt(decoded.Role || '2');
      const user: User = {
        userId: decoded.UserId || '',
        fullName: decoded.unique_name || '',
        email: decoded.Email || '',
        role: roleVal,
        image: decoded.Avatar || '',
        isVerified: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    }
  },

  register: async (fullName: string, email: string, role: UserRole, password?: string, confirmPassword?: string): Promise<User> => {
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
      const formData = new FormData();
      formData.append('Email', email);
      formData.append('Password', password || '');
      formData.append('ConfirmPassword', confirmPassword || '');
      formData.append('FullName', fullName);
      formData.append('PhoneNumber', '');
      
      const roleStr = role === UserRole.Instructor ? 'Instructor' : 'Student';
      formData.append('Role', roleStr);

      const res = await apiClient.post<any>('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const responseData = res.data;
      if (!responseData.isSuccess) {
        throw new Error(responseData.errorMessage || 'Đăng ký tài khoản thất bại');
      }
      
      const regUser = responseData.result;
      return {
        userId: regUser.userId,
        fullName: regUser.fullName,
        email: regUser.email,
        role: regUser.role === 1 ? UserRole.Instructor : UserRole.Student,
        image: regUser.image || '',
        isVerified: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      };
    }
  },

  verifyEmail: async (email: string, otpCode: string): Promise<boolean> => {
    // Backend tự động kích hoạt tài khoản ngay sau khi đăng ký thành công (IsVerified = true),
    // vì vậy Frontend tự động cho qua bước OTP.
    await delay(300);
    return true;
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await delay(100);
  },

  updateProfile: async (bio: string, title: string, fullName: string, phoneNumber?: string): Promise<User> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Chưa đăng nhập');

    // Cập nhật thông tin profile cục bộ
    await delay(400);
    const updatedUser = {
      ...currentUser,
      fullName,
      bio,
      title,
      phoneNumber,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
};
