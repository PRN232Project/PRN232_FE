'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, authService } from '@/lib/service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = () => {
    const current = authService.getCurrentUser();
    setUser(current);
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      
      // Redirect based on role
      if (res.user.role === UserRole.Admin) {
        router.push('/admin/dashboard');
      } else if (res.user.role === UserRole.Instructor) {
        router.push('/instructor/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, role: UserRole) => {
    setLoading(true);
    try {
      await authService.register(fullName, email, role);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === UserRole.Admin;
  const isInstructor = user?.role === UserRole.Instructor;
  const isStudent = user?.role === UserRole.Student;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isInstructor,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
