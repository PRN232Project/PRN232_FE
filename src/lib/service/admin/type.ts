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
}
