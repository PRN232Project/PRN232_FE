# Development & API Integration Guidelines (`DEVELOPMENT.md`)

This document provides architecture specifications, UI design rules, and a step-by-step procedure for Developers and AI assistants to connect Backend APIs into this Next.js Frontend application.

---

## 1. Service Directory Structure

All API calls are strictly decoupled from UI components and managed centrally in `src/lib/service/` following Domain-Driven principles:

```
src/lib/
├── api-client/          # Shared Axios instance configuration
│   └── index.ts         # BaseURL management, JWT Token interceptor & USE_MOCK flag
└── service/             # Business domain services
    ├── admin/           # Course review, user management, payout approvals
    ├── auth/            # Login, registration, account verification
    ├── course/          # Course listing, catalog, curriculum details
    ├── instructor/      # Course management, wallet, revenue tracking
    ├── student/         # Course registration, online learning, progress
    ├── mock-data.ts     # Initial mock datasets for static UI prototyping
    └── index.ts         # Centralized export declarations
```

---

## 2. UI Design & Code Quality Rules

When creating or updating UI components, Developers and AI assistants must strictly adhere to the following rules:

1. **Use Standard Tailwind CSS Color Palettes**:
   - DO NOT use non-standard or arbitrary color classes (e.g., `text-zinc-650`, `border-indigo-750`, `green-250`) as CSS compilers and Turbopack cannot process them, causing unstyled or invisible text.
   - Always use standard Tailwind color scales: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950` (Example: `text-zinc-500`, `text-zinc-800`, `border-zinc-200`).

2. **Leverage the Premium Glassmorphism UI System**:
   - Use `.glass-panel` for elevated card containers with subtle frosted glass background.
   - Use `.glass-navbar` for sticky top navigation bars.
   - Use `.gradient-text` with `bg-gradient-to-r` for eye-catching hero headings.
   - Add hover scaling (`group-hover:scale-[1.02] transition-transform duration-300`) on interactive course cards for enhanced UX.

---

## 3. 4-Step Backend API Integration Procedure

To switch the application from **Mock Data Mode** to live communication with the ASP.NET Core Backend API, follow these steps:

### Step 1: Configure Base URL and Disable Mock Mode
Open `src/lib/api-client/index.ts` (or `config.ts`):
1. Change `USE_MOCK` from `true` to `false`.
2. Configure the `baseURL` pointing to your running backend:
```typescript
export const USE_MOCK = false; // Set to false to activate real backend API

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5180/api',
  timeout: 10000,
});
```

### Step 2: Verify TypeScript Interfaces
Navigate to the corresponding domain folder (e.g., `src/lib/service/course/type.ts`) and verify that the JSON payload structure matches the backend DTOs.
*Example:* If the backend returns `instructorName` instead of `teacherName`, update `type.ts` or map the response accordingly in the API service layer.

### Step 3: Verify REST Endpoints
In the service `api.ts` files (e.g., `src/lib/service/course/api.ts`), ensure that the Axios request paths in the `else` branch match the C# Controller routes:
```typescript
} else {
  const res = await apiClient.get<Course[]>('/courses', {
    params: { search, languageId, maxPrice }
  });
  return res.data;
}
```

### Step 4: Automatic JWT Bearer Authentication
The Axios request interceptor in `src/lib/api-client/index.ts` automatically attaches the token from `localStorage`:
```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
*Note*: Upon successful authentication, save the received JWT token via `localStorage.setItem('token', token)` to prevent `401 Unauthorized` or `403 Forbidden` errors on protected endpoints.

---

## 4. AI Quiz Generation & Practice Evaluation Integration

For automated quiz generation and practice essay evaluation powered by **Google Gemini AI**:

1. **Client-side Request**: Client triggers Next.js API routes (`/api/quiz/generate` or `/api/practice/grade`).
2. **Gemini API Call**: Server-side route handlers consume `process.env.GEMINI_API_KEY` to query Google Gemini models (`gemini-1.5-flash` / `gemini-2.0-flash`).
3. **Structured Response**: The AI response is parsed into clean JSON schemas and returned directly to the client interface for instant feedback.
