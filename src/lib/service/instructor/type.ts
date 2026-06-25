export interface InstructorStats {
  totalEarnings: number;
  totalStudents: number;
  activeCoursesCount: number;
  averageRating: number;
  monthlyRevenue: { month: string; amount: number }[];
  popularCourses: { title: string; enrollments: number; revenue: number }[];
}
