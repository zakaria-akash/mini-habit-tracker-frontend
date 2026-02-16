# Mini Habit Tracker - Frontend

A modern habit tracking application built with Next.js 16 and React 19 that helps users build and maintain daily habits through streak tracking and logging.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Deployment](#deployment)

## Features

- **User Authentication** - Sign up, log in, and log out with cookie-based session management
- **Habit Dashboard** - View all your habits at a glance with stats and streak information
- **Daily Logging** - Mark habits as completed for the day or undo accidental logs
- **Streak Tracking** - Monitor current streaks and total log counts per habit
- **Habit Management** - Create new habits and delete ones you no longer need
- **Protected Routes** - Dashboard automatically redirects unauthenticated users to login

## Tech Stack

| Technology   | Version | Purpose                          |
| ------------ | ------- | -------------------------------- |
| Next.js      | 16.1    | React meta-framework (App Router)|
| React        | 19.2    | UI library                       |
| TypeScript   | 5.x     | Type-safe JavaScript             |
| Tailwind CSS | 4.x     | Utility-first CSS framework      |
| ESLint       | 9.x     | Code linting                     |
| PostCSS      | -       | CSS processing for Tailwind      |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with signup/login links
│   ├── layout.tsx            # Root layout (html, body, metadata)
│   ├── globals.css           # Global styles, Tailwind config, utility classes
│   ├── login/
│   │   └── page.tsx          # Login form (email + password)
│   ├── signup/
│   │   └── page.tsx          # Signup form (email + password)
│   └── dashboard/
│       └── page.tsx          # Main dashboard with habit list and actions
├── components/
│   ├── Navbar.tsx            # Navigation bar with logout functionality
│   └── HabitCard.tsx         # Individual habit display with log/unlog/delete
└── types/
    └── css.d.ts              # CSS module type declarations
```

## Prerequisites

- **Node.js** 18.x or later
- **npm** (comes with Node.js) or another package manager (yarn, pnpm, bun)
- **Backend API server** running on port 4000 (see [API Integration](#api-integration))

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mini-habit-tracker/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
   ```

4. **Start the backend server**

   Make sure the backend API server is running on port 4000 before starting the frontend. Refer to the backend README for setup instructions.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable                   | Required | Default                  | Description                              |
| -------------------------- | -------- | ------------------------ | ---------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes      | `http://localhost:4000`  | Base URL of the backend API server       |

The `NEXT_PUBLIC_` prefix makes this variable available in the browser. It is used both for API rewrites in `next.config.mjs` and for server-side data fetching.

## Available Scripts

| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run dev`   | Start development server with hot reload         |
| `npm run build` | Create an optimized production build              |
| `npm start`     | Start the production server (run `build` first)  |
| `npm run lint`  | Run ESLint to check for code issues              |

## Architecture

### App Router

This project uses the **Next.js App Router** (`src/app/` directory). Pages are defined as `page.tsx` files within route folders.

### Authentication Flow

1. User signs up at `/signup` with email and password
2. On success, redirected to `/login`
3. User logs in, backend sets an HTTP cookie for session management
4. All API requests include `credentials: "include"` to send cookies
5. Dashboard fetches data server-side; if the user is unauthenticated (401), they are redirected to `/login`
6. Logout clears the session cookie and redirects to `/login`

### Server vs. Client Components

- **Server Component**: Dashboard page fetches habit data server-side using async/await
- **Client Components**: Login, Signup, HabitCard, and Navbar use `"use client"` for interactivity (form state, event handlers, transitions)

### State Management

The app uses minimal state management with React hooks:

- `useState` for form fields, error messages, and UI state
- `useTransition` for managing async operations with loading indicators
- No global state library - data is fetched server-side and passed as props

## API Integration

The frontend communicates with a backend API server. API calls from the browser are proxied through Next.js rewrites to avoid CORS issues.

### API Rewrite Configuration

In `next.config.mjs`, all `/api/*` requests from the frontend are rewritten to the backend:

```
Frontend: /api/*  →  Backend: http://localhost:4000/*
```

### Endpoints Used

| Method   | Endpoint               | Description                  | Auth Required |
| -------- | ---------------------- | ---------------------------- | ------------- |
| `POST`   | `/api/auth/signup`     | Register a new user          | No            |
| `POST`   | `/api/auth/login`      | Log in and create session    | No            |
| `POST`   | `/api/auth/logout`     | Log out and clear session    | Yes           |
| `GET`    | `/habits`              | Fetch all user habits        | Yes           |
| `POST`   | `/api/habits/:id/log`  | Mark habit as done today     | Yes           |
| `POST`   | `/api/habits/:id/unlog`| Undo today's habit log       | Yes           |
| `DELETE` | `/api/habits/:id`      | Delete a habit               | Yes           |

### Backend Requirements

The backend API server is expected to:

- Run on the port specified by `NEXT_PUBLIC_API_BASE_URL` (default: 4000)
- Handle cookie-based authentication (set/validate/clear HTTP cookies)
- Use MongoDB for data persistence (habit IDs use MongoDB `_id` format)
- Expose RESTful endpoints for auth and habit management

## Styling

The project uses **Tailwind CSS v4** with the CSS-first configuration approach.

### Global Styles (`globals.css`)

- **Theme**: Custom `--font-sans` (Inter) and `--color-brand` (blue-purple) CSS variables
- **Utility Classes**: Predefined `.container`, `.btn`, `.input`, and `.card` classes
- **Approach**: Tailwind utility classes applied directly in JSX, supplemented by custom utility classes for common patterns

### Design Highlights

- Clean, minimal UI with a `720px` max-width container
- Consistent card-based layout for habits
- Responsive button and input styling with hover/disabled states
- Light color scheme with subtle borders and shadows

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy on Vercel

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push your code to a Git repository
2. Import the project on Vercel
3. Set the `NEXT_PUBLIC_API_BASE_URL` environment variable to your production backend URL
4. Deploy

For other platforms, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

### Production Checklist

- [ ] Backend API server is deployed and accessible
- [ ] `NEXT_PUBLIC_API_BASE_URL` points to the production backend
- [ ] HTTPS is configured for secure cookie transmission
- [ ] CORS and cookie settings are configured for the production domain
