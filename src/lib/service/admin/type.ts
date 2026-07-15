export interface AdminStats {
  totalRevenue: number;
  totalStudents: number;
  totalInstructors: number;
  pendingCoursesCount: number;
  monthlyRevenue: { month: string; revenue: number }[];
  roleDistribution: { name: string; value: number }[];
  topCourseTitle?: string;
  topCourseEnrolls?: number;
  topInstructorName?: string;
  topInstructorStudents?: number;
  recentPayments?: any[];
  topCoursesByRevenue?: { courseId: string; title: string; enrollCount: number; revenue: number }[];
  topInstructorsByRevenue?: { instructorId: string; instructorName: string; email?: string; studentCount: number; revenue: number }[];
  topCoursesByEnrollment?: { courseId: string; title: string; enrollCount: number; revenue: number }[];
  topInstructorsByEnrollment?: { instructorId: string; instructorName: string; email?: string; studentCount: number; revenue: number }[];
  topStudentsBySpending?: { userId: string; fullName: string; email: string; courseCount: number; totalSpent: number }[];
  topStudentsByEnrollment?: { userId: string; fullName: string; email: string; courseCount: number; totalSpent: number }[];
}
