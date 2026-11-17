import { api } from './api';
import type {
  ChangePasswordInput,
  RevokeSessionsResponse,
  SessionInfo,
  LoginInput,
  LoginResponse,
  MessageResponse,
  ProfileResponse,
  RegisterInput,
  ResetPasswordInput,
} from '@/types';

// POST /auth/refresh lives in lib/api.ts (refreshAccessToken), because it needs
// the shared single-refresh logic.

export async function register(input: RegisterInput) {
  const { data } = await api.post<MessageResponse>('/auth/register', input);
  return data;
}

export async function login(input: LoginInput) {
  const { data } = await api.post<LoginResponse>('/auth/login', input);
  return data;
}

/** Creates a temporary demo account with sample tasks and logs it in. */
export async function startDemo() {
  const { data } = await api.post<LoginResponse>('/auth/demo');
  return data;
}

export async function logout() {
  const { data } = await api.post<MessageResponse>('/auth/logout');
  return data;
}

export async function getProfile() {
  const { data } = await api.get<ProfileResponse>('/auth/profile');
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<MessageResponse>('/auth/forgot-password', { email });
  return data;
}

// A verification token works only once. React runs effects twice in development,
// so the same token shares one request instead of failing the second time.
const verifyRequests = new Map<string, Promise<MessageResponse>>();

export function verifyEmail(token: string) {
  let request = verifyRequests.get(token);
  if (!request) {
    request = api
      .get<MessageResponse>('/auth/verify-email', { params: { token } })
      .then(({ data }) => data);
    verifyRequests.set(token, request);
  }
  return request;
}

export async function resetPassword(input: ResetPasswordInput) {
  const { data } = await api.post<MessageResponse>('/auth/reset-password', input);
  return data;
}

/** Signs out every other device; this one stays logged in. */
export async function changePassword(input: ChangePasswordInput) {
  const { data } = await api.post<MessageResponse>('/auth/change-password', input);
  return data;
}

export async function listSessions() {
  const { data } = await api.get<SessionInfo[]>('/auth/sessions');
  return data;
}

/** Signs out one device. */
export async function revokeSession(id: string) {
  const { data } = await api.delete<MessageResponse>(`/auth/sessions/${id}`);
  return data;
}

/** Signs out every device except this one. */
export async function revokeOtherSessions() {
  const { data } = await api.delete<RevokeSessionsResponse>('/auth/sessions');
  return data;
}

/** Deletes the logged-in user's account. Use useAuth().deleteAccount, which also ends the session here. */
export async function deleteAccount(password: string) {
  const { data } = await api.delete<MessageResponse>('/auth/account', { data: { password } });
  return data;
}
