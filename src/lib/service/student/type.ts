import { Course } from '../course/type';

export interface Enrollment {
  enrollmentId: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  completedAt?: string;
  course?: Course;
}

export interface UserLessonProgress {
  lessonProgressId: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Certificate {
  certificateId: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  credentialUrl?: string;
  courseTitle?: string;
  studentName?: string;
  instructorName?: string;
}

export interface GradedAttempt {
  gradedAttemptId: string;
  gradedItemId: string;
  userId: string;
  score: number;
  isPassed: boolean;
  attemptedAt: string;
}
