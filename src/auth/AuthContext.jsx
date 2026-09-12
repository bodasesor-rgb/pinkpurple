import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  completeExternalLoginFromUrl,
  getAuthClient,
  getCurrentUser,
  getExternalLoginUrl,
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
      const raw =
        err?.json?.error_description ||
        err?.json?.msg ||
        err?.message ||
        '';
      let message = raw || 'No se pudo iniciar sesión. Revisa correo y contraseña.';
      if (/Failed to fetch|NetworkError/i.test(String(raw)) || err?.name === 'TypeError') {
        message =
          'No se pudo conectar al servicio de cuentas. Activa Netlify Identity en el sitio desplegado.';
      }
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, fullName, extras = {}) => {
    setError('');
    setLoading(true);
    try {
      const plan = String(extras.plan || 'free').toLowerCase();
      const billing = String(extras.billing || 'monthly').toLowerCase();
      const data = {
        full_name: fullName.trim(),
        plan: ['free', 'starter', 'growth', 'pro', 'diamond'].includes(plan) ? plan : 'free',
        billing: billing === 'annual' ? 'annual' : 'monthly',
        product: 'seo',
      };
      const created = await getAuthClient().signup(email.trim(), password, data);
      // Auto-login when confirmation is disabled; otherwise session may be empty.
      let current = getCurrentUser();
      if (!current && password) {
        try {
          current = await getAuthClient().login(email.trim(), password, true);
        } catch {
          current = created;
        }
      }
      setUser(current || created);
      return current || created;
    } catch (err) {
      const raw =
        err?.json?.error_description ||
        err?.json?.msg ||
        err?.message ||
        '';
      let message = raw || 'No se pudo crear la cuenta.';
      if (/Failed to fetch|NetworkError|identity/i.test(String(raw)) || !raw) {
        message =
          'No se pudo conectar al servicio de cuentas. Activa Netlify Identity en el sitio o revisa la conexión.';
      }
      if (/already|registered|exists/i.test(String(raw))) {
        message = 'Ese correo ya tiene una cuenta. Inicia sesión.';
      }
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithProvider = useCallback((provider) => {
    setError('');
    window.location.assign(getExternalLoginUrl(provider));
  }, []);

  const loginWithGoogle = useCallback(() => {
    loginWithProvider('google');
  }, [loginWithProvider]);

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
      loginWithProvider,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, error, clearError, login, register, loginWithGoogle, loginWithProvider, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
