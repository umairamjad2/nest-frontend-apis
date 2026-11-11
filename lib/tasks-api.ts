import { api } from './api';
import type { MessageResponse, Task, TaskInput, TaskListResponse, TaskQuery, TaskStats } from '@/types';

// Every /tasks endpoint only ever returns or changes the logged-in user's own tasks.

export async function listTasks(query: TaskQuery) {
  const { data } = await api.get<TaskListResponse>('/tasks', { params: query });
  return data;
}

export async function getTaskStats() {
  const { data } = await api.get<TaskStats>('/tasks/stats');
  return data;
}

export async function createTask(input: TaskInput) {
  const { data } = await api.post<Task>('/tasks', input);
  return data;
}

export async function updateTask(id: number, input: Partial<TaskInput>) {
  const { data } = await api.patch<Task>(`/tasks/${id}`, input);
  return data;
}

export async function deleteTask(id: number) {
  const { data } = await api.delete<MessageResponse>(`/tasks/${id}`);
  return data;
}
