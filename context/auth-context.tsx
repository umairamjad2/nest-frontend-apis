'use client';

import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { refreshAccessToken, setAccessToken, setSessionExpiredHandler } from '@/lib/api';
import * as authApi from '@/lib/auth-api';
import * as usersApi from '@/lib/users-api';
import type { AuthUser, LoginInput } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  /** 'loading' until the startup refresh finishes. Don't redirect while loading. */
  status: AuthStatus;
  user: AuthUser | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Reload the user, e.g. after changing the name. */
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
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
  }, []);

  // When a refresh fails in the axios interceptor, show the user as logged out.
  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  // On page load, the in-memory token is gone. Use the refresh cookie to get a new one.
  // In development React runs this twice; refreshAccessToken() shares one request.
  useEffect(() => {
    refreshAccessToken()
      .then(reloadUser)
      .catch(clearSession);
  }, [reloadUser, clearSession]);

  const login = useCallback(
    async (input: LoginInput) => {
      const { access_token } = await authApi.login(input);
      setAccessToken(access_token);
      await reloadUser();
    },
    [reloadUser],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Log out locally even if the request fails.
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext value={{ status, user, login, logout, reloadUser }}>{children}</AuthContext>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
