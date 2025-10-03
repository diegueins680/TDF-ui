import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '../api/session';
import type { LoginResponse } from '../api/types';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';

type AuthUser = LoginResponse & { username: string };

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = 'tdf-hq-auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    setAuthToken(null);
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    setAuthToken(parsed.token);
    return parsed;
  } catch (_err) {
    window.localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await Session.login({ username, password });
      const nextUser: AuthUser = { ...res, username };
      setUser(nextUser);
      setAuthToken(nextUser.token);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user?.token,
    isLoading,
    login,
    logout,
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
