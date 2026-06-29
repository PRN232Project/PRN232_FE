# Hướng Dẫn Phát Triển & Đấu Nối API (DEVELOPMENT & API INTEGRATION GUIDELINES)

Tài liệu này cung cấp sơ đồ cấu trúc, quy tắc thiết kế UI và quy trình từng bước dành cho Lập trình viên hoặc Trí Tuệ Nhân Tạo (AI) để tiến hành đấu nối API Backend vào giao diện Next.js Frontend này.

---

## 1. Cấu Trúc Thư Mục Dịch Vụ (Service Directory Structure)

Tất cả các cuộc gọi API được tách biệt hoàn toàn khỏi giao diện UI và quản lý tập trung trong thư mục `src/lib/service/` theo cấu trúc Domain-Driven:

```
src/lib/
├── api-client/          # Axios instance cấu hình chung
│   └── index.ts         # Quản lý baseURL, JWT Token & Cờ USE_MOCK
└── service/             # Tách biệt theo các nghiệp vụ hệ thống
    ├── admin/           # Phê duyệt khóa học, quản lý user, thanh toán
    ├── auth/            # Đăng nhập, đăng ký, xác thực tài khoản
    ├── course/          # Lấy danh sách khóa học, chi tiết đề cương
    ├── instructor/      # Quản lý khóa học của tôi, ví tiền, doanh thu
    ├── student/         # Đăng ký khóa học, học tập trực tuyến
    ├── mock-data.ts     # Dữ liệu giả lập ban đầu để làm UI tĩnh
    └── index.ts         # Khai báo export tập trung
```

---

## 2. Quy Tắc Thiết Kế UI & Viết Code (UI Design Rules)

Khi viết hoặc cập nhật các component giao diện, AI và Lập trình viên cần tuân thủ nghiêm ngặt các quy tắc sau:

1. **Sử dụng bảng màu chuẩn Tailwind CSS**:
   - TUYỆT ĐỐI không sử dụng các màu tự chế không chuẩn (như `text-zinc-650`, `border-indigo-750`, `text-zinc-450`, `green-250`...) vì Turbopack và CSS Compiler sẽ không thể biên dịch và gây lỗi mờ chữ/mất màu trên trình duyệt.
   - Luôn sử dụng thang màu chuẩn: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950` (Ví dụ: `text-zinc-500`, `text-zinc-800`, `border-zinc-200`).

2. **Kế thừa hệ thống giao diện cao cấp (Premium Glassmorphism)**:
   - Sử dụng lớp tiện ích `.glass-panel` cho các khối thẻ nổi có nền mờ sang trọng.
   - Sử dụng `.glass-navbar` cho các thanh điều hướng dính ở đầu trang.
   - Sử dụng `.gradient-text` kết hợp `bg-gradient-to-r` cho tiêu đề bắt mắt.
   - Thêm hiệu ứng di chuột phóng to nhẹ (`group-hover:scale-[1.02] transition-transform duration-300`) cho tất cả các thẻ Card khóa học.

---

## 3. Quy Trình 4 Bước Đấu Nối API Backend

Để chuyển đổi ứng dụng từ chế độ chạy dữ liệu giả lập (Mock Data) sang kết nối trực tiếp với API thật của ASP.NET Core Backend, hãy làm theo các bước sau:

### Bước 1: Cấu hình địa chỉ API và Tắt cờ Mock
Mở tệp `src/lib/api-client/index.ts`:
1. Chuyển giá trị của biến `USE_MOCK` từ `true` sang `false`.
2. Cập nhật địa chỉ `baseURL` dẫn tới API backend của bạn:
```typescript
export const USE_MOCK = false; // Chuyển sang false để kích hoạt API thật

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});
```

### Bước 2: Đối chiếu kiểu dữ liệu (TypeScript Interfaces)
Vào thư mục con tương ứng (ví dụ: `src/lib/service/course/type.ts`), kiểm tra cấu trúc của dữ liệu JSON mà API trả về có khớp với Interface TypeScript không.
*Ví dụ:* Nếu backend trả về trường `instructorName` nhưng kiểu dữ liệu định nghĩa là `teacherName`, hãy sửa lại trong tệp `type.ts` hoặc thực hiện ánh xạ (mapping) lại dữ liệu trong phần gọi API.

### Bước 3: Kiểm tra cuộc gọi API thật
Bên trong các file `api.ts` của các thư mục nghiệp vụ (ví dụ: `src/lib/service/course/api.ts`), nhánh `else` đã được viết sẵn bằng Axios:
```typescript
} else {
  const res = await apiClient.get<Course[]>('/courses', {
    params: { search, languageId, maxPrice }
  });
  return res.data;
}
```
Hãy đảm bảo rằng các Route API (`/courses`, `/courses/${courseId}`, `/auth/login`,...) trùng khớp với Route trên Controller của backend C#.

### Bước 4: Tự động đính kèm JWT Token để xác thực tài khoản
Hệ thống Axios interceptor trong `src/lib/api-client/index.ts` đã được cấu hình tự động lấy Token từ LocalStorage và đính kèm vào phần Header:
```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
*Lưu ý*: Giảng viên/Học viên khi Đăng nhập thành công cần lưu JWT token nhận được vào `localStorage.setItem('token', token)` để các API sau (ví dụ: Rút tiền, Phê duyệt, Đăng ký học) không bị lỗi phân quyền (401 Unauthorized / 403 Forbidden).

---

## 4. Tích Hợp Các Dịch Vụ AI AWS ( Speaking & Writing Test )

Đối với các chức năng luyện thi nói/viết IELTS tự động chấm bằng AWS AI, quy trình kết nối chuẩn là:

1. **Lấy Presigned URL**: Client gọi API backend để xin một đường dẫn tải lên bảo mật tạm thời từ AWS S3.
2. **Upload tệp**: Client tải tệp ghi âm giọng nói ( Speaking ) hoặc tệp bài viết ( Writing ) trực tiếp lên S3 qua Presigned URL bằng phương thức `PUT` của axios (không cần đi qua backend để tránh tắc nghẽn băng thông).
3. **Chấm điểm**: Gọi API Gateway kết nối tới các dịch vụ AWS Lambda của backend để kích hoạt hệ thống chấm điểm tự động bằng AI, nhận kết quả điểm số và lời khuyên hiển thị tức thì trên giao diện của Học viên.
