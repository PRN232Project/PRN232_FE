import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { Course, CourseStatus } from './type';
import { mockCourses } from '@/lib/service/mock-data';

export const courseService = {
  getCourses: async (search?: string, languageId?: string, maxPrice?: number): Promise<Course[]> => {
    if (USE_MOCK) {
      await delay(500);
      let list = mockCourses.filter((c) => c.status === CourseStatus.Published && !c.isDeleted);
      
      if (search) {
        const query = search.toLowerCase();
        list = list.filter((c) => c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query));
      }
      
      if (languageId && languageId !== 'all') {
        list = list.filter((c) => c.languageId === languageId);
      }
      
      if (maxPrice !== undefined) {
        list = list.filter((c) => c.price <= maxPrice);
      }
      
      return list;
    } else {
      const res = await apiClient.get<any>('/courses', {
        params: { search }
      });
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải danh sách khóa học');
      }
      const data = res.data.result;
      const courses = data?.courses || [];
      return courses.map((c: any) => ({
        courseId: c.courseId,
        title: c.title,
        description: c.description || '',
        price: c.price || 0,
        image: c.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
        status: c.status || CourseStatus.Published,
        languageId: '',
        createdBy: '',
        createdAt: new Date().toISOString(),
        isDeleted: false,
        enrollmentCount: c.students || 0,
        instructorName: c.instructorName || 'Giảng viên'
      }));
    }
  },

  getCourseById: async (courseId: string): Promise<Course> => {
    if (USE_MOCK) {
      await delay(500);
      const course = mockCourses.find((c) => c.courseId === courseId && !c.isDeleted);
      if (!course) {
        throw new Error('Không tìm thấy khóa học này');
      }
      return course;
    } else {
      const res = await apiClient.get<any>(`/courses/${courseId}`);
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải chi tiết khóa học');
      }
      const c = res.data.result;
      return {
        courseId: c.courseId,
        title: c.title,
        description: c.description || '',
        price: c.price || 0,
        image: c.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
        status: c.status || CourseStatus.Published,
        languageId: '',
        createdBy: '',
        createdAt: new Date().toISOString(),
        isDeleted: false,
        enrollmentCount: c.students || 0,
        instructorName: c.instructorName || 'Giảng viên'
      };
    }
  }
};
