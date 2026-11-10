import { api } from './api';
import type { MessageResponse, UpdateUserInput, UserDetails } from '@/types';

/** Own account or admin. */
export async function getUser(id: number) {
  const { data } = await api.get<UserDetails>(`/users/${id}`);
  return data;
}

/** Own account or admin. Only the name can change. */
export async function updateUser(id: number, input: UpdateUserInput) {
  const { data } = await api.patch<UserDetails>(`/users/${id}`, input);
  return data;
}

/** Admin only. */
export async function listUsers() {
  const { data } = await api.get<UserDetails[]>('/users');
  return data;
}

/** Admin only. */
export async function deleteUser(id: number) {
  const { data } = await api.delete<MessageResponse>(`/users/${id}`);
  return data;
}
