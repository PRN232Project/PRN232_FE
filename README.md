# Online Learning Platform - Frontend (`prn232-fe`)

A modern, responsive, and feature-rich Web Frontend for an Online Learning Platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

The application features a sleek glassmorphism UI design system, real-time messaging and notifications via SignalR, AI-powered quiz generation and practice grading using **Google Gemini AI**, interactive analytics charts with Recharts, and role-based portals for Students, Instructors, and Administrators.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom Glassmorphism UI tokens (`.glass-panel`, `.glass-navbar`, `.gradient-text`)
- **Icons**: Lucide React
- **AI Integration**: `@google/generative-ai` (Google Gemini AI) for automated quiz generation & essay/practice evaluation
- **Real-Time Communication**: `@microsoft/signalr`
- **Data Visualization**: Recharts (Revenue, enrollment & course performance analytics)
- **HTTP Client**: Axios with centralized request/response interceptors and automatic JWT token handling

---

## ✨ Key Features

### 🎓 Student Portal
- **Course Discovery & Search**: Filter courses by category, level, pricing, and keywords.
- **Course Checkout & Enrollment**: Payment via PayOS integration or direct enrollment for free courses.
- **Interactive Learning Environment**: Video playback, article reading, and lesson completion progress tracking.
- **AI-Powered Practice & Quizzes**: Automated quiz generation from course content and AI essay/code exercise evaluation using Google Gemini AI.
- **Certificates**: Downloadable certificate generation upon 100% course completion.
- **Real-Time Chat**: Direct instant messaging with course instructors.

### 👨‍🏫 Instructor Dashboard
- **Course Builder**: Create and edit courses with lồng nhau modules, lessons, videos, articles, and quiz items.
- **Analytics & Revenue**: Track enrollments, course ratings, and earnings charts.
- **Wallet & Payouts**: View wallet balance, transaction history, and submit payout withdrawal requests.
- **Student Messaging**: Chat in real-time with enrolled students.

### 🛡️ Admin Management Portal
- **Platform Overview**: System-wide statistics, user metrics, and platform revenue reports.
- **Course Approval Workflow**: Review pending courses with a full curriculum and media inspector (video links, reading content, quiz details) before approving or rejecting with feedback.
- **User Management**: Manage accounts, update roles, and ban/unban users.
- **Payout Approval**: Review and process instructor payout withdrawal requests.

---

## ⚙️ Environment Configuration

### 1. Frontend Environment Setup (`.env.local`)
To enable the **Google Gemini AI** automatic quiz generator and practice grading features, configure your environment variables:

1. Copy `.env.example` to `.env.local` at the root of `prn232-fe`:
   ```bash
   cp .env.example .env.local
   # On Windows PowerShell:
   copy .env.example .env.local
   ```
2. Open `.env.local` and configure the variables:
   ```env
   # Google Gemini API Key (Required for AI Quiz & Practice Grading)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Backend API Base URL (Optional, defaults to http://localhost:5180/api)
   NEXT_PUBLIC_API_URL=http://localhost:5180/api
   ```

### 2. Backend Integration & Mock Mode
The frontend supports both **Real API Mode** and **Mock Data Mode**:
- To switch between Real API and Mock Data, edit `src/lib/api-client/config.ts` or `src/lib/api-client/index.ts`:
  ```typescript
  export const USE_MOCK = false; // Set to false to connect to the C# .NET Backend API
  ```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.17+ or v20+
- `npm` (or `yarn`, `pnpm`, `bun`)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Project Directory Structure

```
prn232-fe/
├── src/
│   ├── app/
│   │   ├── (protected)/         # Authenticated routes (student dashboard, instructor, admin)
│   │   ├── (public)/            # Public landing page & course catalog
│   │   ├── api/                 # Next.js API Routes (Gemini AI Quiz & Practice evaluation)
│   │   ├── auth/                # Login, Register, Account Verification
│   │   ├── learning/            # Online course viewer & lesson player
│   │   └── payment/             # Payment success & failure callback pages
│   ├── components/              # Shared UI components & layouts
│   ├── context/                 # React Contexts (AuthContext, SignalRContext)
│   ├── lib/
│   │   ├── api-client/          # Axios instance configuration & JWT interceptors
│   │   └── service/             # Domain API services (admin, auth, course, instructor, student)
│   └── styles/                  # Global CSS styles & Tailwind configuration
├── public/                      # Static assets & images
└── README.md
```

---

## 🛠️ Build & Deployment Commands

- **Build for Production**:
  ```bash
  npm run build
  ```
- **Start Production Server**:
  ```bash
  npm run start
  ```
- **Run Linter**:
  ```bash
  npm run lint
  ```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
