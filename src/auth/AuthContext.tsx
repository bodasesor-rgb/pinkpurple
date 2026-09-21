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
import {
  buildDemoSession,
  clearDemoSession,
  isDemoUserId,
  loadDemoSession,
  saveDemoSession,
  type DemoConfig,
} from './demoSession';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  /** Alias de status === 'loading' para los componentes antiguos. */
  loading: boolean;
  isAuthenticated: boolean;
  /** true si la sesión viene del simulador de la home (no es cuenta Nexus). */
  isDemo: boolean;
  error: string;
  clearError: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  /** Abre el panel real (/app) con los datos del simulador. */
  enterDemoFromSimulator: (config: DemoConfig) => AuthUser;
  /** Borra la empresa de prueba y vuelve a anónimo. */
  deleteDemoCompany: () => void;
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

function applyDemoIfPresent(
  setUser: (u: AuthUser | null) => void,
  setStatus: (s: AuthStatus) => void,
): boolean {
  const demo = loadDemoSession();
  if (!demo) return false;
  setUser(demo.user);
  setStatus('authenticated');
  return true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState('');

  // Rehidrata la sesión desde cookie httpOnly; si no hay, usa demo del simulador.
  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    authApi
      .me(controller.signal)
      .then((session) => {
        if (!alive) return;
        if (session.user && !isDemoUserId(session.user.id)) {
          clearDemoSession();
          setUser(session.user);
          setStatus('authenticated');
          return;
        }
        if (!applyDemoIfPresent(setUser, setStatus)) {
          setUser(null);
          setStatus('anonymous');
        }
      })
      .catch(() => {
        if (!alive) return;
        if (!applyDemoIfPresent(setUser, setStatus)) {
          setUser(null);
          setStatus('anonymous');
        }
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    function onUnauthorized() {
      if (loadDemoSession()) {
        applyDemoIfPresent(setUser, setStatus);
        return;
      }
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
      clearDemoSession();
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
      clearDemoSession();
      setUser(session.user);
      setStatus('authenticated');
      return session.user;
    } catch (err) {
      setError(messageOf(err, 'No se pudo crear la cuenta.'));
      throw err;
    }
  }, []);

  const enterDemoFromSimulator = useCallback((config: DemoConfig) => {
    const session = buildDemoSession(config);
    saveDemoSession(session);
    setUser(session.user);
    setStatus('authenticated');
    setError('');
    return session.user;
  }, []);

  const deleteDemoCompany = useCallback(() => {
    clearDemoSession();
    setUser(null);
    setStatus('anonymous');
    setError('');
  }, []);

  const logout = useCallback(async () => {
    setError('');
    const wasDemo = isDemoUserId(user?.id);
    try {
      if (!wasDemo) await authApi.logout();
    } finally {
      clearDemoSession();
      setUser(null);
      setStatus('anonymous');
    }
  }, [user?.id]);

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
      if (session.user && !isDemoUserId(session.user.id)) {
        clearDemoSession();
        setUser(session.user);
        setStatus('authenticated');
        return;
      }
    } catch {
      /* fall through to demo */
    }
    if (!applyDemoIfPresent(setUser, setStatus)) {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const isDemo = isDemoUserId(user?.id);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      loading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      isDemo,
      error,
      clearError,
      login,
      register,
      enterDemoFromSimulator,
      deleteDemoCompany,
      logout,
      requestPasswordReset,
      resetPassword,
      refreshUser,
    }),
    [
      user,
      status,
      isDemo,
      error,
      clearError,
      login,
      register,
      enterDemoFromSimulator,
      deleteDemoCompany,
      logout,
      requestPasswordReset,
      resetPassword,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
