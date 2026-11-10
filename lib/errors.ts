import { isAxiosError } from 'axios';

/**
 * Turns any error from an API call into a message to show the user.
 * NestJS errors look like { statusCode, message, error }, where message is a
 * string or, for validation errors, an array of strings.
 */
export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return 'Something went wrong. Please try again.';
  }

  if (!error.response) {
    return "Can't reach the server. Check that the backend is running.";
  }

  if (error.response.status === 429) {
    return 'Too many attempts. Please wait a minute and try again.';
  }

  const message = (error.response.data as { message?: string | string[] } | undefined)?.message;

  if (Array.isArray(message)) {
    return message.join('. ');
  }

  return message ?? 'Something went wrong. Please try again.';
}
