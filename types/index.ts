// Shapes of the NestJS backend's requests and responses.
// Check them against Swagger at http://localhost:3000/api when the backend changes.

export type Role = 'ADMIN' | 'USER';

/** The logged-in user, combined from GET /auth/profile and GET /users/:id. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

/** Returned by GET /users and GET /users/:id. */
export interface UserDetails {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface MessageResponse {
  message: string;
}

/** POST /auth/refresh */
export interface TokenResponse {
  access_token: string;
}

/** POST /auth/login. The refresh token arrives as an httpOnly cookie, not in the body. */
export interface LoginResponse extends TokenResponse, MessageResponse {}

/** GET /auth/profile. Note: no name. */
export interface ProfileResponse extends MessageResponse {
  user: {
    userId: number;
    email: string;
    role: Role;
  };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
}

export interface UpdateUserInput {
  name: string;
}

// --- Tasks -------------------------------------------------------------------

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

/** Returned by the /tasks endpoints. Dates are ISO strings. */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/** GET /tasks */
export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** GET /tasks/stats */
export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

export type TaskSortField = 'createdAt' | 'dueDate' | 'priority';

/** Query string for GET /tasks. Undefined values are left out. */
export interface TaskQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: TaskSortField;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/** POST /tasks and PATCH /tasks/:id. null clears description or dueDate. */
export interface TaskInput {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
}
