# NestJS Frontend – Next.js Plan

The frontend for the [`nestjs-learning`](../nestjs-learning) backend. It covers registration, email verification, login, password reset, the user's profile, and an admin user list.

This file is the build plan. Each phase ends with something you can run and test in the browser.

## Tech Stack

| Tool | Why |
|---|---|
| **Next.js (App Router)** + **TypeScript** | Framework |
| **Tailwind CSS** | Styling |
| **axios** | HTTP client; interceptors make the refresh-and-retry logic simple |
| **react-hook-form** + **zod** | Forms with the same rules as the backend DTOs |
| **pnpm** | Package manager (same as the backend) |

## How It Connects to the Backend

| | URL |
|---|---|
| Backend (NestJS) | `http://localhost:3000` |
| Frontend (Next.js) | `http://localhost:3001` |
| Swagger (to check request/response shapes) | `http://localhost:3000/api` |

The backend's CORS only allows `http://localhost:3001` (`FRONTEND_URL` in the backend `.env`), so the frontend **must** run on port 3001:

```json
"dev": "next dev -p 3001"
```

`.env.local` in this folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Key Design Decisions

### 1. Auth runs in the browser (client components)

- The access token lives **only in memory** (a React context), never in `localStorage` or a cookie the frontend sets. The backend README requires this.
- The refresh token is an `httpOnly` cookie set by the backend on `localhost:3000` with path `/auth`. The frontend can't read it; the browser sends it automatically when we call `/auth/refresh` with `withCredentials: true`.
- Because the access token is only in browser memory, Next.js server components and `middleware.ts` **can't** know who is logged in. So:
  - Pages that need the user are client components (`'use client'`).
  - Route protection is done with a client-side guard component, not middleware.
  - Server components are used only for static layout and public content.

### 2. Startup: restore the session

On every page load the in-memory token is gone, so the `AuthProvider` does this once:

1. Call `POST /auth/refresh` (no body, cookie sent automatically).
2. Success → save the new `access_token`, then call `GET /auth/profile` to load the user.
3. `401` → the user is logged out. Show public pages.

While this runs, show a loading state so protected pages don't flash the login screen.

### 3. axios client with refresh-and-retry

`lib/api.ts` creates one axios instance:

- `baseURL = NEXT_PUBLIC_API_URL`, `withCredentials: true`.
- **Request interceptor:** adds `Authorization: Bearer <accessToken>` when we have one.
- **Response interceptor:** on a `401` from any route except `/auth/login` and `/auth/refresh`:
  1. Call `/auth/refresh` **once**. If a refresh is already in progress, wait for that same promise instead of starting another one. The backend treats a reused refresh token as theft and ends the session, so parallel refreshes would log the user out.
  2. Success → store the new token and retry the original request once.
  3. Failure → clear the token and user, redirect to `/login`.

### 4. Who is the user?

`GET /auth/profile` returns `{ message, user: { userId, email, role } }`, with **no name**. To show the name, also call `GET /users/:userId`, which returns `{ id, name, email, createdAt }`. Store both in the auth context.

### 5. Errors

| Status | What the UI does |
|---|---|
| `400` | Show the validation messages from the response under the form |
| `401` on login | "Wrong email or password, or your email isn't verified yet" |
| `403` | "You don't have permission" page |
| `429` | "Too many attempts, wait a minute and try again" |

### 6. Avoid frontend routes under `/auth`

Cookies ignore the port, so the `refresh_token` cookie (path `/auth`) would also be sent to `localhost:3001/auth/...`. Public pages use `/login`, `/register` and so on instead.

## Pages

| Route | Access | Backend call | Notes |
|---|---|---|---|
| `/` | Public | – | Landing page with links to log in or register |
| `/register` | Guests only | `POST /auth/register` `{ name, email, password }` | On success, show "Check your email to verify your account" |
| `/login` | Guests only | `POST /auth/login` `{ email, password }` | Save `access_token`, load the user, go to `/dashboard` |
| `/forgot-password` | Guests only | `POST /auth/forgot-password` `{ email }` | Always shows the same message (the backend never reveals whether the email exists). 3 requests per minute |
| `/reset-password?token=...` | Public | `POST /auth/reset-password` `{ resetToken, newPassword }` | **This exact path is required:** the backend emails links to it. On success, go to `/login` |
| `/dashboard` | Logged in | `GET /auth/profile` | Welcome page with the user's name and role |
| `/profile` | Logged in | `GET /users/:id`, `PATCH /users/:id` `{ name }` | Only the name can be changed |
| `/admin/users` | Admin | `GET /users`, `DELETE /users/:id` | Table of users with a delete button and confirm dialog |

**Email verification needs no frontend page.** The verification email links straight to the backend (`http://localhost:3000/auth/verify-email?token=...`), which returns JSON. A later improvement is to make the backend redirect to a frontend `/verify-email` page instead (see Future Improvements).

### Form rules (match the backend DTOs)

| Field | Rule |
|---|---|
| `name` | Required, max 100 characters |
| `email` | Valid email |
| `password` / `newPassword` | 8–72 characters |

## Folder Structure

```text
nestjs-frontend/
├── app/
│   ├── layout.tsx              # Wraps everything in <AuthProvider>
│   ├── page.tsx                # Landing page
│   ├── (guest)/                # Redirects to /dashboard if logged in
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── (protected)/            # Redirects to /login if logged out
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   └── admin/
│   │       ├── layout.tsx      # Shows 403 unless role is ADMIN
│   │       └── users/page.tsx
│   └── forbidden/page.tsx
├── components/
│   ├── navbar.tsx              # Links change with login state and role
│   ├── auth-guard.tsx
│   └── ui/                     # Button, Input, FormError, Spinner
├── context/
│   └── auth-context.tsx        # accessToken, user, login(), logout(), loading
├── lib/
│   ├── api.ts                  # axios instance + interceptors
│   ├── auth-api.ts             # register, login, refresh, logout, ...
│   ├── users-api.ts            # getUser, updateUser, listUsers, deleteUser
│   ├── schemas.ts              # zod schemas
│   └── errors.ts               # turns axios errors into messages
├── types/
│   └── index.ts                # User, Role, AuthResponse
├── .env.local
└── README.md
```

## Build Phases

### Phase 1 – Setup
- [x] `pnpm create next-app@latest .` (TypeScript, Tailwind, App Router, ESLint) – Next.js 16.4.6
- [x] Set `"dev": "next dev -p 3001"` in `package.json`
- [x] Add `.env.local` with `NEXT_PUBLIC_API_URL`
- [x] `pnpm add axios react-hook-form zod @hookform/resolvers`
- [x] Check: `pnpm dev` opens `http://localhost:3001`

### Phase 2 – API client and auth context
- [x] `types/index.ts`
- [x] `lib/api.ts` with the request interceptor
- [x] `context/auth-context.tsx` with session restore on load
- [x] Response interceptor with the single shared refresh promise
- [x] `lib/auth-api.ts`, `lib/users-api.ts`, `lib/errors.ts`
- [ ] Check: the browser network tab shows `POST /auth/refresh` on page load with no CORS error

### Phase 3 – Register and login
- [ ] `/register` page and form validation
- [ ] `/login` page
- [ ] Navbar with log in / log out
- [ ] Logout calls `POST /auth/logout`, then clears the context
- [ ] Check: register → click the email link → log in → reload the page and stay logged in

### Phase 4 – Password reset
- [ ] `/forgot-password`
- [ ] `/reset-password` reads `token` from the URL
- [ ] Check: the reset email link opens the page, and the new password works

### Phase 5 – Protected pages
- [ ] Guest and protected route groups with guards
- [ ] `/dashboard`
- [ ] `/profile` with the name edit form
- [ ] Check: opening `/dashboard` while logged out redirects to `/login`

### Phase 6 – Admin
- [ ] Admin layout guard and `/forbidden`
- [ ] `/admin/users` table and delete
- [ ] Check: a USER sees 403; an ADMIN (set in Prisma Studio) sees the list

### Phase 7 – Polish
- [ ] Loading and error states on every form
- [ ] `429` message
- [ ] Test token expiry: wait 15 minutes (or shorten the backend's `expiresIn` while testing), then make a request. It should refresh silently.
- [ ] Test reuse: log in on two browsers. The first one should be logged out on its next refresh (the backend allows one session per user).

## Running Both Apps

```bash
# Terminal 1 – backend
cd nestjs-learning
pnpm start:dev

# Terminal 2 – frontend
cd nestjs-frontend
pnpm dev
```

## Future Improvements

- Backend: redirect `/auth/verify-email` to a frontend `/verify-email?status=success` page instead of returning JSON
- Backend: return `name` from `/auth/profile` so the frontend needs one call instead of two
- Generate TypeScript types from Swagger (`/api-json`) with `openapi-typescript`
- Change password and change email pages, once the backend supports them
- Tests with Vitest and React Testing Library, and Playwright for the full login flow
