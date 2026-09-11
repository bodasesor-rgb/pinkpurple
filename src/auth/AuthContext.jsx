import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  completeExternalLoginFromUrl,
  getAuthClient,
  getCurrentUser,
  getGoogleLoginUrl,
} from './authClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    async function boot() {
      try {
        const fromOAuth = await completeExternalLoginFromUrl();
        const current = fromOAuth || getCurrentUser();
        if (alive) setUser(current);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    boot();
    return () => {
      alive = false;
    };
  }, []);

  const clearError = useCallback(() => setError(''), []);

  const login = useCallback(async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const logged = await getAuthClient().login(email.trim(), password, true);
      setUser(logged);
      return logged;
    } catch (err) {
      const message =
        err?.json?.error_description ||
        err?.message ||
        'No se pudo iniciar sesión. Revisa correo y contraseña.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    setError('');
    setLoading(true);
    try {
      const data = {
        full_name: fullName.trim(),
        plan: 'free',
      };
      const created = await getAuthClient().signup(email.trim(), password, data);
      const current = getCurrentUser() || created;
      setUser(current);
      return current;
    } catch (err) {
      const message =
        err?.json?.error_description ||
        err?.message ||
        'No se pudo crear la cuenta.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    setError('');
    window.location.assign(getGoogleLoginUrl());
  }, []);

  const logout = useCallback(async () => {
    setError('');
    try {
      const current = getCurrentUser();
      if (current) await current.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      clearError,
      login,
      register,
      loginWithGoogle,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, error, clearError, login, register, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
