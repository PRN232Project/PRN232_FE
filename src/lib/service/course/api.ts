import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { Course, CourseStatus } from './type';
import { mockCourses } from '../mock-data';

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
      const res = await apiClient.get<Course[]>('/courses', {
        params: { search, languageId, maxPrice }
      });
      return res.data;
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
      const res = await apiClient.get<Course>(`/courses/${courseId}`);
      return res.data;
    }
  }
};
