// Demo accounts are created by POST /auth/demo with an address on this reserved
// domain (see the backend's src/auth/demo.ts). They're deleted after 24 hours.
export const DEMO_EMAIL_DOMAIN = 'demo.tasknest.invalid';

export function isDemoUser(user: { email: string } | null | undefined): boolean {
  return !!user && user.email.toLowerCase().endsWith(`@${DEMO_EMAIL_DOMAIN}`);
}
