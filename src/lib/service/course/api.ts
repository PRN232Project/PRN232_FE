import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { Course, CourseStatus } from './type';
import { mockCourses } from '@/lib/service/mock-data';

export const courseService = {
  getCourses: async (search?: string, languageId?: string, isFree?: boolean): Promise<Course[]> => {
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
      
      if (isFree !== undefined) {
        if (isFree) {
          list = list.filter((c) => c.price === 0);
        } else {
          list = list.filter((c) => c.price > 0);
        }
      }
      
      return list;
    } else {
      const params: any = {};
      if (search) params.search = search;
      if (languageId && languageId !== 'all') params.languageId = languageId;
      if (isFree !== undefined) params.isFree = isFree;

      const res = await apiClient.get<any>('/courses', { params });
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
        languageName: c.languageName || 'Tiếng Việt',
        createdBy: '',
        createdAt: new Date().toISOString(),
        isDeleted: false,
        enrollmentCount: c.students || 0,
        duration: c.duration || '12 giờ',
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
        languageName: c.languageName || 'Tiếng Việt',
        createdBy: '',
        createdAt: new Date().toISOString(),
        isDeleted: false,
        enrollmentCount: c.students || 0,
        duration: c.duration || '12 giờ',
        instructorName: c.instructorName || 'Giảng viên',
        instructorBio: c.instructorBio || '',
        modules: c.modules?.map((m: any) => ({
          moduleId: m.moduleId,
          courseId: m.courseId,
          title: m.title,
          orderIndex: m.orderIndex,
          lessons: m.lessons?.map((l: any) => ({
            lessonId: l.lessonId,
            moduleId: l.moduleId,
            title: l.title,
            orderIndex: l.orderIndex,
            lessonItems: l.lessonItems?.map((li: any) => ({
              lessonItemId: li.lessonItemId,
              lessonId: li.lessonId,
              title: li.title,
              type: li.type,
              durationMinutes: li.durationMinutes,
              orderIndex: li.orderIndex
            }))
          }))
        }))
      };
    }
  },
  getLandingStats: async (): Promise<{ studentsCount: number; instructorsCount: number; averageRating: number }> => {
    if (USE_MOCK) {
      return {
        studentsCount: 5000,
        instructorsCount: 12,
        averageRating: 4.9
      };
    } else {
      const res = await apiClient.get<any>('/courses/landing-stats');
      if (!res.data.isSuccess) {
        return {
          studentsCount: 5000,
          instructorsCount: 12,
          averageRating: 4.9
        };
      }
      return res.data.result;
    }
  }
};
