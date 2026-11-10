import { api } from './api';
import type {
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

export async function resetPassword(input: ResetPasswordInput) {
  const { data } = await api.post<MessageResponse>('/auth/reset-password', input);
  return data;
}
