import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, UNAUTHORIZED_EVENT, auth as authApi } from '../api/client';
import type { AuthUser, RegisterInput } from '../api/types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  /** Alias de status === 'loading' para los componentes antiguos. */
  loading: boolean;
  isAuthenticated: boolean;
  error: string;
  clearError: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function messageOf(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState('');

  // Rehidrata la sesión desde la cookie httpOnly al cargar la app.
  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    authApi
      .me(controller.signal)
      .then((session) => {
        if (!alive) return;
        setUser(session.user ?? null);
        setStatus(session.user ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (!alive) return;
        setUser(null);
        setStatus('anonymous');
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  // Cualquier 401 del cliente cierra la sesión en la UI.
  useEffect(() => {
    function onUnauthorized() {
      setUser(null);
      setStatus('anonymous');
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const clearError = useCallback(() => setError(''), []);

  const login = useCallback(async (email: string, password: string) => {
    setError('');
    try {
      const session = await authApi.login({ email: email.trim(), password });
      setUser(session.user);
      setStatus('authenticated');
      return session.user;
    } catch (err) {
      setError(messageOf(err, 'No se pudo iniciar sesión. Revisa correo y contraseña.'));
      throw err;
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setError('');
    try {
      const session = await authApi.register({
        ...input,
        email: input.email.trim(),
        fullName: input.fullName.trim(),
      });
      setUser(session.user);
      setStatus('authenticated');
      return session.user;
    } catch (err) {
      setError(messageOf(err, 'No se pudo crear la cuenta.'));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError('');
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    setError('');
    try {
      await authApi.requestPasswordReset(email.trim());
    } catch (err) {
      setError(messageOf(err, 'No se pudo enviar el correo de recuperación.'));
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setError('');
    try {
      await authApi.resetPassword({ token, password });
    } catch (err) {
      setError(messageOf(err, 'No se pudo cambiar la contraseña.'));
      throw err;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const session = await authApi.me();
      setUser(session.user ?? null);
      setStatus(session.user ? 'authenticated' : 'anonymous');
    } catch {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      loading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      error,
      clearError,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      refreshUser,
    }),
    [user, status, error, clearError, login, register, logout, requestPasswordReset, resetPassword, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
