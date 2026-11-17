import { describe, expect, it } from 'vitest';
import { describeUserAgent } from './user-agent';
import { changePasswordSchema } from './schemas';

describe('describeUserAgent', () => {
  it.each([
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Chrome on Windows',
    ],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
      'Edge on Windows',
    ],
    [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
      'Safari on macOS',
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      'Safari on iPhone',
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1',
      'Chrome on iPhone',
    ],
    [
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
      'Chrome on Android',
    ],
    ['Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0', 'Firefox on Linux'],
    ['curl/8.4.0', 'Unknown device'],
    [null, 'Unknown device'],
  ])('%s → %s', (userAgent, expected) => {
    expect(describeUserAgent(userAgent)).toBe(expected);
  });
});

describe('changePasswordSchema', () => {
  const valid = { currentPassword: 'Password123', newPassword: 'NewPassword456', confirmPassword: 'NewPassword456' };

  it('accepts a valid change', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('requires the confirmation to match', () => {
    const result = changePasswordSchema.safeParse({ ...valid, confirmPassword: 'Different123' });
    expect(result.error?.issues[0].path).toEqual(['confirmPassword']);
  });

  it('rejects reusing the current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'Password123',
      newPassword: 'Password123',
      confirmPassword: 'Password123',
    });
    expect(result.error?.issues[0].path).toEqual(['newPassword']);
  });

  it('enforces the backend length limits', () => {
    const short = changePasswordSchema.safeParse({ ...valid, newPassword: 'short', confirmPassword: 'short' });
    expect(short.success).toBe(false);
  });
});
