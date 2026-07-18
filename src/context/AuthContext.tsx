import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type User } from '../api/client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (phone: string, code: string, password: string) => Promise<void>;
  register: (payload: {
    phone: string; code: string; email: string; password: string;
    first_name?: string; last_name?: string; referral_code: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = 'ip_auth';

interface StoredAuth {
  user: User;
  accessToken: string;
  refreshToken: string;
}

function loadStored(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStored()?.user ?? null);
  const [accessToken, setAccessToken] = useState<string | null>(() => loadStored()?.accessToken ?? null);
  const [refreshToken, setRefreshToken] = useState<string | null>(() => loadStored()?.refreshToken ?? null);

  useEffect(() => {
    if (user && accessToken && refreshToken) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, accessToken, refreshToken]);

  const applyTokens = useCallback((res: { access_token: string; refresh_token: string; user: User }) => {
    setUser(res.user);
    setAccessToken(res.access_token);
    setRefreshToken(res.refresh_token);
  }, []);

  const login = useCallback(async (phone: string, code: string, password: string) => {
    applyTokens(await api.login(phone, code, password));
  }, [applyTokens]);

  const register = useCallback(async (payload: Parameters<typeof api.register>[0]) => {
    applyTokens(await api.register(payload));
  }, [applyTokens]);

  const logout = useCallback(() => {
    if (refreshToken) {
      api.logout(refreshToken).catch(() => undefined);
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user && !!accessToken,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
