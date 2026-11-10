'use client';

import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { refreshAccessToken, setAccessToken, setSessionExpiredHandler } from '@/lib/api';
import * as authApi from '@/lib/auth-api';
import * as usersApi from '@/lib/users-api';
import type { AuthUser, LoginInput } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  /** 'loading' until the startup refresh finishes. Don't redirect while loading. */
  status: AuthStatus;
  user: AuthUser | null;
  /** True when the session ended on its own (not by logging out), so the login page can say why. */
  sessionExpired: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Reload the user, e.g. after changing the name. */
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Messages sent between tabs of this site, so they agree on who is logged in. */
type TabMessage = 'login' | 'logout';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const clearSession = useCallback((expired = false) => {
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
    setSessionExpired(expired);
  }, []);

  // /auth/profile has no name, so combine it with /users/:id.
  const reloadUser = useCallback(async () => {
    const { user: profile } = await authApi.getProfile();
    const details = await usersApi.getUser(profile.userId);

    setUser({
      id: profile.userId,
      name: details.name,
      email: profile.email,
      role: profile.role,
    });
    setStatus('authenticated');
    setSessionExpired(false);
  }, []);

  // Get a fresh access token from the refresh cookie and load the user.
  const restoreSession = useCallback(
    () => refreshAccessToken().then(reloadUser),
    [reloadUser],
  );

  // When a refresh fails in the axios interceptor, the session has expired or was revoked.
  useEffect(() => {
    setSessionExpiredHandler(() => clearSession(true));
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  // On page load, the in-memory token is gone. Use the refresh cookie to get a new one.
  // In development React runs this twice; refreshAccessToken() shares one request.
  useEffect(() => {
    restoreSession().catch(() => clearSession());
  }, [restoreSession, clearSession]);

  // Keep other open tabs in sync. They share the refresh cookie but each has its own
  // in-memory access token and React state.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('auth');
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<TabMessage>) => {
      if (event.data === 'logout') {
        clearSession();
      } else if (event.data === 'login') {
        // Another tab logged in and has a new refresh cookie: pick up the session.
        restoreSession().catch(() => clearSession());
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [restoreSession, clearSession]);

  const notifyOtherTabs = (message: TabMessage) => channelRef.current?.postMessage(message);

  const login = useCallback(
    async (input: LoginInput) => {
      const { access_token } = await authApi.login(input);
      setAccessToken(access_token);
      await reloadUser();
      notifyOtherTabs('login');
    },
    [reloadUser],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Log out locally even if the request fails.
      clearSession();
      notifyOtherTabs('logout');
    }
  }, [clearSession]);

  return (
    <AuthContext value={{ status, user, sessionExpired, login, logout, reloadUser }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
