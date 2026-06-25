export interface AdminStats {
  totalRevenue: number;
  totalStudents: number;
  totalInstructors: number;
  pendingCoursesCount: number;
  monthlyRevenue: { month: string; revenue: number }[];
  roleDistribution: { name: string; value: number }[];
}
