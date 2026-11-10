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
