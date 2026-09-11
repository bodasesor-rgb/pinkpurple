import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';

export default function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated, error, clearError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/cuenta';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // error already in context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page-pad auth-page">
      <div className="auth-card">
        <p className="eyebrow">Acceso</p>
        <h1>Inicia sesión</h1>
        <p className="auth-lead">Entra a tu espacio PinkPurple para ver tu plan y páginas.</p>

        <GoogleAuthButton
          label="Entrar con Google"
          onClick={loginWithGoogle}
          disabled={submitting}
        />

        <div className="auth-divider" role="presentation">
          <span>o con correo</span>
        </div>

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
            <input
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta Free</Link>
        </p>
      </div>
    </div>
  );
}
