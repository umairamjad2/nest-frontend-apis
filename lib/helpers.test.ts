import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors';
import { safeRedirectPath } from './redirect';
import { registerSchema, resetPasswordSchema } from './schemas';

describe('safeRedirectPath', () => {
  it.each([
    ['/profile', '/profile'],
    ['/admin/users?page=2', '/admin/users?page=2'],
    [null, '/dashboard'],
    ['', '/dashboard'],
    ['https://evil.example', '/dashboard'],
    ['//evil.example', '/dashboard'], // protocol-relative URL: another site
    ['/\\evil.example', '/dashboard'], // browsers treat \ like /
    ['javascript:alert(1)', '/dashboard'],
  ])('%s → %s', (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });
});

describe('getErrorMessage', () => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const httpError = (status: number, data: unknown) =>
    new AxiosError('fail', String(status), config, null, { status, data, statusText: '', headers: {}, config });

  it('joins NestJS validation messages', () => {
    const error = httpError(400, { message: ['email must be an email', 'password is too short'] });
    expect(getErrorMessage(error)).toBe('email must be an email. password is too short');
  });

  it('shows a single backend message as it is', () => {
    expect(getErrorMessage(httpError(401, { message: 'Please verify your email before logging in.' }))).toBe(
      'Please verify your email before logging in.',
    );
  });

  it('explains rate limiting', () => {
    expect(getErrorMessage(httpError(429, { message: 'ThrottlerException' }))).toMatch(/too many attempts/i);
  });

  it('explains when the backend is unreachable', () => {
    expect(getErrorMessage(new AxiosError('Network Error', 'ERR_NETWORK', config))).toMatch(/can't reach the server/i);
  });

  it('handles non-axios errors', () => {
    expect(getErrorMessage(new Error('boom'))).toMatch(/something went wrong/i);
  });
});

describe('registerSchema (matches CreateUserDto)', () => {
  const valid = { name: 'Jane', email: 'jane@example.com', password: 'Password123', confirmPassword: 'Password123' };

  it('accepts valid input', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('trims the name and rejects a blank one', () => {
    expect(registerSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
    expect(registerSchema.parse({ ...valid, name: '  Jane  ' }).name).toBe('Jane');
  });

  it('enforces the 8–72 character password rule', () => {
    const pw = (p: string) => registerSchema.safeParse({ ...valid, password: p, confirmPassword: p }).success;
    expect(pw('a'.repeat(7))).toBe(false);
    expect(pw('a'.repeat(8))).toBe(true);
    expect(pw('a'.repeat(72))).toBe(true);
    expect(pw('a'.repeat(73))).toBe(false);
  });

  it('rejects mismatched passwords on the confirm field', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'Different123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['confirmPassword']);
  });
});

describe('resetPasswordSchema', () => {
  it('rejects mismatched passwords', () => {
    expect(resetPasswordSchema.safeParse({ newPassword: 'Password123', confirmPassword: 'Nope12345' }).success).toBe(false);
  });
});
