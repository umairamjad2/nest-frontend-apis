import { z } from 'zod';

// Same rules as the backend DTOs (CreateUserDto, LoginUserDto), so most mistakes
// are caught before the request is sent. The backend still validates everything.

const email = z.email('Enter a valid email address');

const name = z.string().trim().min(1, 'Name is required').max(100, 'Name must be at most 100 characters');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

export const registerSchema = z
  .object({
    name,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  // Only check it's filled in; the backend decides whether it's correct.
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// The reset token comes from the URL, not the form, so it isn't in this schema.
export const resetPasswordSchema = z
  .object({
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// PATCH /users/:id accepts only the name.
export const profileSchema = z.object({ name });

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Same limits as the backend's CreateTaskDto.
export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().trim().max(2000, 'Description must be at most 2000 characters'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  // From <input type="date">: "YYYY-MM-DD", or "" for no due date
  dueDate: z.union([z.literal(''), z.iso.date('Enter a valid date')]),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
