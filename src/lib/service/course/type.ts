export enum CourseStatus {
  Draft = 0,
  Pending = 1,
  Published = 2,
  Rejected = 3,
}

export enum LessonItemType {
  Video = 0,
  Article = 1,
  Quiz = 2,
}

export interface Language {
  languageId: string;
  name: string;
}

export interface Course {
  courseId: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  status: CourseStatus;
  languageId: string;
  languageName?: string;
  createdBy: string;
  instructorName?: string;
  instructorBio?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  modules?: Module[];
  enrollmentCount?: number;
}

export interface Module {
  moduleId: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons?: Lesson[];
}

export interface Lesson {
  lessonId: string;
  moduleId: string;
  title: string;
  orderIndex: number;
  lessonItems?: LessonItem[];
}

export interface LessonItem {
  lessonItemId: string;
  lessonId: string;
  title: string;
  type: LessonItemType;
  durationMinutes: number;
  orderIndex: number;
  gradedItem?: GradedItem;
  lessonResources?: LessonResource[];
}

export interface LessonResource {
  lessonResourceId: string;
  lessonItemId: string;
  title: string;
  resourceUrl: string;
}

export interface GradedItem {
  gradedItemId: string;
  lessonItemId: string;
  title: string;
  passingScore: number;
  maxAttempts: number;
  questions?: Question[];
}

export interface Question {
  questionId: string;
  gradedItemId: string;
  questionText: string;
  orderIndex: number;
  answerOptions?: AnswerOption[];
}

export interface AnswerOption {
  answerOptionId: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}
