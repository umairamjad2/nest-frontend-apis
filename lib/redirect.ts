/**
 * Only allows a redirect back to a page on this site. Without this check,
 * /login?next=https://evil.example would send users to another site after login.
 */
export function safeRedirectPath(path: string | null): string {
  if (path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')) {
    return path;
  }
  return '/dashboard';
}
