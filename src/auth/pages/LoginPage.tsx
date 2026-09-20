import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/ui/PasswordInput';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError, isAuthenticated, status } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/app';

  if (status !== 'loading' && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // el mensaje ya está en el contexto
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page-pad auth-page">
      <div className="auth-card">
        <p className="eyebrow">Panel PinkPurpleSEO</p>
        <h1>Inicia sesión</h1>
        <p className="auth-lead">Entra con la cuenta de tu empresa para ver tus proyectos.</p>

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
              placeholder="Tu contraseña"
            />
          </label>

          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar al panel'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
        </p>
        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
}
