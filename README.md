This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Hướng dẫn cấu hình môi trường (Environment Setup)

### 1. Cấu hình Frontend (Quiz tự động bằng Gemini AI)
Để chạy tính năng AI tạo câu hỏi trắc nghiệm tự động, bạn cần tạo file cấu hình local:
1. Tại thư mục gốc `prn232-fe`, copy file `.env.example` thành file `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
2. Mở file `.env.local` mới tạo và điền Google Gemini API Key của bạn vào:
   ```env
   GEMINI_API_KEY=điền_gemini_api_key_của_bạn_vào_đây
   ```

### 2. Cấu hình Backend (Cloudinary, PayOS, VNPAY, Mail SMTP...)
Sao chép nội dung cấu hình đầy đủ của `appsettings.json` (được gửi trong đoạn chat nhóm) dán đè vào file `appsettings.json` ở dự án Backend `API` của bạn.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

