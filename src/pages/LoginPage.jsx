import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import SocialAuthButtons from '../components/SocialAuthButtons.jsx';
import { goToNexusPanel, loginNexusPinkpurple, registerNexusPinkpurple } from '../lib/nexusPanel.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithProvider, isAuthenticated, error, clearError, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // OAuth Identity sin cookie Nexus → pedir credenciales panel, no /pp a ciegas
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const after = sessionStorage.getItem('pp_after_oauth');
      sessionStorage.removeItem('pp_after_oauth');
      if (after) {
        navigate('/entrar-panel', { replace: true });
      }
    }
  }, [loading, isAuthenticated, navigate]);

  async function openNexusPanel(emailValue, passwordValue, fullName = '') {
    try {
      return await loginNexusPinkpurple(emailValue, passwordValue);
    } catch {
      try {
        await registerNexusPinkpurple({
          email: emailValue,
          password: passwordValue,
          fullName,
          plan: 'trial',
          billing: 'monthly',
        });
        return await loginNexusPinkpurple(emailValue, passwordValue);
      } catch {
        return { enterUrl: '/pp' };
      }
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await login(email, password);
      const nexus = await openNexusPanel(email, password);
      goToNexusPanel(nexus);
    } catch {
      // error already in context
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && isAuthenticated && submitting) {
    return (
      <div className="container page-pad auth-page">
        <div className="auth-card">
          <p className="eyebrow">Acceso</p>
          <h1>Abriendo tu panel…</h1>
          <p className="auth-lead">Te estamos llevando a PinkPurple SEO en Nexus.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-pad auth-page">
      <div className="auth-card">
        <p className="eyebrow">Acceso</p>
        <h1>Inicia sesión</h1>
        <p className="auth-lead">
          Entra a tu espacio en PinkPurple Studio. Tras validar, abrimos tu panel en Nexus (
          <code>/pp</code>).
        </p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Correo
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </label>
          <label>
            Contraseña
            <PasswordInput
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="auth-divider" role="presentation">
          <span>OR</span>
        </div>

        <SocialAuthButtons
          onProvider={(provider) => {
            sessionStorage.setItem('pp_after_oauth', '1');
            loginWithProvider(provider);
          }}
          disabled={submitting}
        />

        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta Free</Link>
          {' · '}
          <Link to="/entrar-panel">Abrir mi panel SEO</Link>
        </p>
      </div>
    </div>
  );
}
