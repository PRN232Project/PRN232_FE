import { User, UserRole, Wallet, WalletTransaction, Message } from './auth/type';
import { Course, CourseStatus, LessonItemType } from './course/type';
import { Enrollment, Certificate, UserLessonProgress } from './student/type';

// Mock Users
export const mockUsers: User[] = [
  {
    userId: 'admin-id-1111',
    fullName: 'Nguyễn Quản Trị (Admin)',
    email: 'admin@olp.com',
    phoneNumber: '0987654321',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    isVerified: true,
    role: UserRole.Admin,
    bio: 'Hệ thống Quản trị viên của Online Learning Platform.',
    title: 'Platform Administrator',
    createdAt: '2026-01-01T00:00:00Z',
    isDeleted: false,
  },
  {
    userId: 'teacher-id-2222',
    fullName: 'ThS. Nguyễn Văn Dạy (Teacher)',
    email: 'teacher@olp.com',
    phoneNumber: '0912345678',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=256&auto=format&fit=crop',
    isVerified: true,
    role: UserRole.Instructor,
    bio: 'Kỹ sư Phần mềm với hơn 10 năm kinh nghiệm giảng dạy lập trình .NET, React và kiến trúc phần mềm.',
    title: 'Senior .NET Fullstack Developer',
    createdAt: '2026-02-15T00:00:00Z',
    isDeleted: false,
  },
  {
    userId: 'student-id-3333',
    fullName: 'Trần Minh Học (Student)',
    email: 'student@olp.com',
    phoneNumber: '0909090909',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop',
    isVerified: true,
    role: UserRole.Student,
    bio: 'Sinh viên CNTT đam mê phát triển web và học tập các công nghệ mới.',
    title: 'IT Student',
    createdAt: '2026-03-01T00:00:00Z',
    isDeleted: false,
  },
];

// Mock Wallets
export const mockWallets: Wallet[] = [
  {
    walletId: 'wallet-id-teacher',
    userId: 'teacher-id-2222',
    balance: 15450000, // 15.450.000 VND
  }
];

// Mock Transactions
export const mockTransactions: WalletTransaction[] = [
  {
    walletTransactionId: 'tx-1',
    walletId: 'wallet-id-teacher',
    paymentId: 'pay-1',
    amount: 450000,
    type: 2, // Earnings
    status: 1, // Completed
    createdAt: '2026-06-20T10:30:00Z',
    description: 'Doanh thu từ học viên đăng ký khóa học "Lập trình C# nâng cao"',
  },
  {
    walletTransactionId: 'tx-2',
    walletId: 'wallet-id-teacher',
    paymentId: 'pay-2',
    amount: 5000000,
    type: 1, // Withdrawal
    status: 1, // Completed
    createdAt: '2026-06-22T08:00:00Z',
    description: 'Rút tiền về tài khoản ngân hàng Vietcombank (STK: 1023...)',
  },
  {
    walletTransactionId: 'tx-3',
    walletId: 'wallet-id-teacher',
    paymentId: undefined,
    amount: 2000000,
    type: 1, // Withdrawal
    status: 0, // Pending
    createdAt: '2026-06-25T09:15:00Z',
    description: 'Yêu cầu rút tiền về tài khoản ngân hàng Techcombank (STK: 1903...)',
  }
];

// Mock Languages
export const mockLanguages = [
  { languageId: 'lang-vi', name: 'Tiếng Việt' },
  { languageId: 'lang-en', name: 'Tiếng Anh' },
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    courseId: 'course-1',
    title: 'Lập trình ASP.NET Core Web API chuẩn doanh nghiệp',
    description: 'Học cách xây dựng các dịch vụ RESTful API bảo mật, hiệu năng cao bằng C# và .NET 8/9. Khóa học bao gồm Dependency Injection, Middleware, Entity Framework Core, JWT Authentication và AutoMapper.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
    price: 499000,
    status: CourseStatus.Published,
    languageId: 'lang-vi',
    languageName: 'Tiếng Việt',
    createdBy: 'teacher-id-2222',
    instructorName: 'ThS. Nguyễn Văn Dạy (Teacher)',
    instructorBio: 'Kỹ sư phần mềm 10 năm kinh nghiệm thiết kế hệ thống .NET backend.',
    createdAt: '2026-04-01T09:00:00Z',
    isDeleted: false,
    enrollmentCount: 145,
    modules: [
      {
        moduleId: 'mod-1-1',
        courseId: 'course-1',
        title: 'Chương 1: Giới thiệu và thiết lập môi trường',
        orderIndex: 1,
        lessons: [
          {
            lessonId: 'les-1-1-1',
            moduleId: 'mod-1-1',
            title: '1.1 Tổng quan về RESTful API và ASP.NET Core',
            orderIndex: 1,
            lessonItems: [
              {
                lessonItemId: 'item-1-1-1-1',
                lessonId: 'les-1-1-1',
                title: 'Giới thiệu về kiến trúc Web API',
                type: LessonItemType.Video,
                durationMinutes: 12,
                orderIndex: 1,
                lessonResources: [
                  { lessonResourceId: 'res-1', lessonItemId: 'item-1-1-1-1', title: 'Slide bài học Web API.pdf', resourceUrl: '#' }
                ]
              },
              {
                lessonItemId: 'item-1-1-1-2',
                lessonId: 'les-1-1-1',
                title: 'Đọc thêm: Sự khác nhau giữa REST và SOAP',
                type: LessonItemType.Article,
                durationMinutes: 10,
                orderIndex: 2
              }
            ]
          },
          {
            lessonId: 'les-1-1-2',
            moduleId: 'mod-1-1',
            title: '1.2 Khởi tạo Project Web API và Cấu trúc thư mục chuẩn',
            orderIndex: 2,
            lessonItems: [
              {
                lessonItemId: 'item-1-1-2-1',
                lessonId: 'les-1-1-2',
                title: 'Demo: npx và dotnet CLI tạo dự án',
                type: LessonItemType.Video,
                durationMinutes: 18,
                orderIndex: 1
              }
            ]
          }
        ]
      },
      {
        moduleId: 'mod-1-2',
        courseId: 'course-1',
        title: 'Chương 2: Entity Framework Core & Kết nối Database',
        orderIndex: 2,
        lessons: [
          {
            lessonId: 'les-1-2-1',
            moduleId: 'mod-1-2',
            title: '2.1 Cấu hình DbContext và Code First Migrations',
            orderIndex: 1,
            lessonItems: [
              {
                lessonItemId: 'item-1-2-1-1',
                lessonId: 'les-1-2-1',
                title: 'Hướng dẫn cấu hình DbContext',
                type: LessonItemType.Video,
                durationMinutes: 25,
                orderIndex: 1
              },
              {
                lessonItemId: 'item-1-2-1-2',
                lessonId: 'les-1-2-1',
                title: 'Bài trắc nghiệm chương 2',
                type: LessonItemType.Quiz,
                durationMinutes: 15,
                orderIndex: 2,
                gradedItem: {
                  gradedItemId: 'quiz-2',
                  lessonItemId: 'item-1-2-1-2',
                  title: 'Bài trắc nghiệm chương 2 - EF Core',
                  passingScore: 80,
                  maxAttempts: 3,
                  questions: [
                    {
                      questionId: 'q-2-1',
                      gradedItemId: 'quiz-2',
                      questionText: 'Trong EF Core, lệnh nào dùng để tạo file Migration mới từ Model?',
                      orderIndex: 1,
                      answerOptions: [
                        { answerOptionId: 'a-2-1-1', questionId: 'q-2-1', optionText: 'dotnet ef database update', isCorrect: false, orderIndex: 1 },
                        { answerOptionId: 'a-2-1-2', questionId: 'q-2-1', optionText: 'dotnet ef migrations add <Name>', isCorrect: true, orderIndex: 2 },
                        { answerOptionId: 'a-2-1-3', questionId: 'q-2-1', optionText: 'dotnet ef migrations update', isCorrect: false, orderIndex: 3 },
                        { answerOptionId: 'a-2-1-4', questionId: 'q-2-1', optionText: 'dotnet ef dbcontext scaffold', isCorrect: false, orderIndex: 4 }
                      ]
                    },
                    {
                      questionId: 'q-2-2',
                      gradedItemId: 'quiz-2',
                      questionText: 'Phương thức nào trong DbContext được dùng để cấu hình quan hệ Fluent API?',
                      orderIndex: 2,
                      answerOptions: [
                        { answerOptionId: 'a-2-2-1', questionId: 'q-2-2', optionText: 'OnConfiguring', isCorrect: false, orderIndex: 1 },
                        { answerOptionId: 'a-2-2-2', questionId: 'q-2-2', optionText: 'SaveChanges', isCorrect: false, orderIndex: 2 },
                        { answerOptionId: 'a-2-2-3', questionId: 'q-2-2', optionText: 'OnModelCreating', isCorrect: true, orderIndex: 3 },
                        { answerOptionId: 'a-2-2-4', questionId: 'q-2-2', optionText: 'QueryFilters', isCorrect: false, orderIndex: 4 }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    courseId: 'course-2',
    title: 'Xây dựng giao diện Web App cao cấp với Next.js & Tailwind CSS',
    description: 'Làm chủ Next.js 14/15 App Router. Khóa học hướng dẫn thiết kế Layout nâng cao, phân quyền Routing, quản lý State, tối ưu SEO và triển khai ứng dụng thực tế chuyên nghiệp.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    price: 399000,
    status: CourseStatus.Published,
    languageId: 'lang-vi',
    languageName: 'Tiếng Việt',
    createdBy: 'teacher-id-2222',
    instructorName: 'ThS. Nguyễn Văn Dạy (Teacher)',
    createdAt: '2026-05-10T10:00:00Z',
    isDeleted: false,
    enrollmentCount: 92,
    modules: [
      {
        moduleId: 'mod-2-1',
        courseId: 'course-2',
        title: 'Chương 1: Giới thiệu Next.js App Router',
        orderIndex: 1,
        lessons: [
          {
            lessonId: 'les-2-1-1',
            moduleId: 'mod-2-1',
            title: '1.1 Khởi tạo Next.js và Tailwind CSS',
            orderIndex: 1,
            lessonItems: [
              {
                lessonItemId: 'item-2-1-1-1',
                lessonId: 'les-2-1-1',
                title: 'Setup dự án Next.js 14/15',
                type: LessonItemType.Video,
                durationMinutes: 15,
                orderIndex: 1
              }
            ]
          }
        ]
      }
    ]
  },
  {
    courseId: 'course-3',
    title: 'Kiến trúc hệ thống và Thiết kế Cơ sở dữ liệu',
    description: 'Học cách thiết kế mô hình cơ sở dữ liệu quan hệ và phi quan hệ chuẩn hóa. Tập trung vào thực hành vẽ sơ đồ thực thể mối quan hệ (ERD), tối ưu truy vấn SQL Server, lập chỉ mục (Indexes) và xử lý giao dịch dữ liệu.',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop',
    price: 599000,
    status: CourseStatus.Pending,
    languageId: 'lang-vi',
    languageName: 'Tiếng Việt',
    createdBy: 'teacher-id-2222',
    instructorName: 'ThS. Nguyễn Văn Dạy (Teacher)',
    createdAt: '2026-06-22T14:00:00Z',
    isDeleted: false,
    enrollmentCount: 0,
    modules: [
      {
        moduleId: 'mod-3-1',
        courseId: 'course-3',
        title: 'Chương 1: Thiết kế Cơ sở dữ liệu Chuẩn hóa',
        orderIndex: 1,
        lessons: [
          {
            lessonId: 'les-3-1-1',
            moduleId: 'mod-3-1',
            title: '1.1 Dạng chuẩn 1NF, 2NF và 3NF',
            orderIndex: 1,
            lessonItems: [
              {
                lessonItemId: 'item-3-1-1-1',
                lessonId: 'les-3-1-1',
                title: 'Bài học lý thuyết về Normalization',
                type: LessonItemType.Article,
                durationMinutes: 20,
                orderIndex: 1
              }
            ]
          }
        ]
      }
    ]
  }
];

// Mock Enrollments
export const mockEnrollments: Enrollment[] = [
  {
    enrollmentId: 'enroll-1',
    userId: 'student-id-3333',
    courseId: 'course-1',
    enrolledAt: '2026-06-01T08:00:00Z',
    progressPercent: 50,
    course: mockCourses[0]
  }
];

// Mock Progresses
export const mockProgress: UserLessonProgress[] = [
  {
    lessonProgressId: 'prog-1',
    userId: 'student-id-3333',
    lessonId: 'les-1-1-1',
    isCompleted: true,
    completedAt: '2026-06-05T15:30:00Z'
  },
  {
    lessonProgressId: 'prog-2',
    userId: 'student-id-3333',
    lessonId: 'les-1-1-2',
    isCompleted: false,
  }
];

// Mock Certificates
export const mockCertificates: Certificate[] = [
  {
    certificateId: 'cert-1',
    userId: 'student-id-3333',
    courseId: 'course-2',
    issuedAt: '2026-06-18T16:45:00Z',
    credentialUrl: '/certificates/cert-1.pdf',
    courseTitle: 'Xây dựng giao diện Web App cao cấp với Next.js & Tailwind CSS',
    studentName: 'Trần Minh Học',
    instructorName: 'ThS. Nguyễn Văn Dạy',
  }
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    messageId: 'msg-1',
    senderId: 'student-id-3333',
    receiverId: 'teacher-id-2222',
    content: 'Dạ thầy ơi, cho em hỏi làm sao để giải quyết lỗi rmdir ENOTEMPTY khi chạy lệnh cài đặt npm ạ?',
    createdAt: '2026-06-25T11:00:00Z',
    isRead: true,
    senderName: 'Trần Minh Học',
    receiverName: 'ThS. Nguyễn Văn Dạy',
  },
  {
    messageId: 'msg-2',
    senderId: 'teacher-id-2222',
    receiverId: 'student-id-3333',
    content: 'Chào em, lỗi đó thường do thư mục node_modules bị khóa bởi một tiến trình nào đó hoặc cache bị lỗi. Em chỉ cần tắt terminal/editor đi rồi chạy lại lệnh `npm install` bằng tay là được nhé.',
    createdAt: '2026-06-25T11:05:00Z',
    isRead: true,
    senderName: 'ThS. Nguyễn Văn Dạy',
    receiverName: 'Trần Minh Học',
  },
  {
    messageId: 'msg-3',
    senderId: 'student-id-3333',
    receiverId: 'teacher-id-2222',
    content: 'Dạ em cảm ơn thầy nhiều ạ! Em đã làm theo và cài đặt thành công rồi.',
    createdAt: '2026-06-25T11:10:00Z',
    isRead: false,
    senderName: 'Trần Minh Học',
    receiverName: 'ThS. Nguyễn Văn Dạy',
  }
];
