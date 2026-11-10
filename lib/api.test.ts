import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, getAccessToken, refreshAccessToken, setAccessToken, setSessionExpiredHandler } from './api';

// ---------------------------------------------------------------------------
// A fake backend. Instead of sending HTTP requests, axios calls this adapter.
// ---------------------------------------------------------------------------

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };

let handler: Handler;
let refreshCalls: number;

function respond(config: InternalAxiosRequestConfig, status: number, data: unknown = {}) {
  const response = { data, status, statusText: String(status), headers: {}, config };
  if (status >= 400) {
    throw new AxiosError(`Request failed with status ${status}`, String(status), config, null, response);
  }
  return response;
}

const fakeAdapter: AxiosAdapter = async (config) => {
  if (config.url?.endsWith('/auth/refresh')) refreshCalls++;
  // A short delay, so parallel requests really overlap.
  await new Promise((resolve) => setTimeout(resolve, 5));
  const { status, data } = handler(config);
  return respond(config, status, data);
};

/** Backend where `validToken` is accepted and /auth/refresh returns `newToken` (or fails). */
function backend({ validToken, newToken, refreshFails = false }: { validToken: string; newToken: string; refreshFails?: boolean }) {
  handler = (config) => {
    if (config.url?.endsWith('/auth/refresh')) {
      return refreshFails ? { status: 401 } : { status: 200, data: { access_token: newToken } };
    }
    if (config.url === '/auth/login') return { status: 401, data: { message: 'Invalid email or password' } };
    const auth = config.headers.Authorization;
    return auth === `Bearer ${validToken}` ? { status: 200, data: { ok: true } } : { status: 401 };
  };
}

beforeEach(() => {
  refreshCalls = 0;
  setAccessToken(null);
  setSessionExpiredHandler(null);
  // `api` handles normal requests; plain `axios` is used for /auth/refresh.
  api.defaults.adapter = fakeAdapter;
  axios.defaults.adapter = fakeAdapter;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------

describe('request interceptor', () => {
  it('adds the access token as a Bearer header', async () => {
    backend({ validToken: 'token-1', newToken: 'unused' });
    setAccessToken('token-1');

    const res = await api.get('/users/1');

    expect(res.data).toEqual({ ok: true });
    expect(refreshCalls).toBe(0);
  });
});

describe('refresh on 401', () => {
  it('refreshes once and retries the request with the new token', async () => {
    backend({ validToken: 'new-token', newToken: 'new-token' });
    setAccessToken('expired-token');

    const res = await api.get('/users/1');

    expect(res.data).toEqual({ ok: true });
    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBe('new-token');
  });

  it('sends only ONE refresh when several requests fail at the same time', async () => {
    // The backend ends the session if the same refresh token is used twice,
    // so parallel 401s must share one refresh.
    backend({ validToken: 'new-token', newToken: 'new-token' });
    setAccessToken('expired-token');

    const results = await Promise.all([api.get('/users'), api.get('/users/1'), api.get('/auth/profile')]);

    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(refreshCalls).toBe(1);
  });

  it('shares one refresh between the startup call and failing requests', async () => {
    backend({ validToken: 'new-token', newToken: 'new-token' });
    setAccessToken('expired-token');

    await Promise.all([refreshAccessToken(), refreshAccessToken(), api.get('/users/1')]);

    expect(refreshCalls).toBe(1);
  });

  it('logs the user out when the refresh fails', async () => {
    backend({ validToken: 'never', newToken: 'unused', refreshFails: true });
    setAccessToken('expired-token');
    const onExpired = vi.fn();
    setSessionExpiredHandler(onExpired);

    await expect(api.get('/users/1')).rejects.toMatchObject({ response: { status: 401 } });

    expect(onExpired).toHaveBeenCalledOnce();
    expect(getAccessToken()).toBeNull();
  });

  it('does not loop if the retried request is still rejected', async () => {
    // Refresh "works" but the backend still says 401 (e.g. the user was deleted).
    backend({ validToken: 'never-valid', newToken: 'new-token' });
    setAccessToken('expired-token');

    await expect(api.get('/users/1')).rejects.toMatchObject({ response: { status: 401 } });

    expect(refreshCalls).toBe(1);
  });

  it('does not refresh when login itself returns 401 (wrong password)', async () => {
    backend({ validToken: 'x', newToken: 'y' });
    const onExpired = vi.fn();
    setSessionExpiredHandler(onExpired);

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({ response: { status: 401 } });

    expect(refreshCalls).toBe(0);
    expect(onExpired).not.toHaveBeenCalled();
  });
});

describe('cross-tab lock', () => {
  it('runs the refresh inside the shared "auth-refresh" Web Lock', async () => {
    backend({ validToken: 'new-token', newToken: 'new-token' });
    const request = vi.fn((_name: string, fn: () => Promise<unknown>) => fn());
    vi.stubGlobal('navigator', { locks: { request } });

    await refreshAccessToken();

    expect(request).toHaveBeenCalledOnce();
    expect(request.mock.calls[0][0]).toBe('auth-refresh');
    expect(refreshCalls).toBe(1);
  });
});
