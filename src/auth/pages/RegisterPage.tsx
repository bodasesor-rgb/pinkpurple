import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import PasswordInput from '../../components/ui/PasswordInput';
import { useAuth } from '../AuthContext';

const MIN_PASSWORD = 8;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, error, clearError, isAuthenticated, status } = useAuth();

  const plan = (searchParams.get('plan') || 'free').toLowerCase();
  const billing = searchParams.get('billing') === 'annual' ? 'annual' : 'monthly';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  if (status !== 'loading' && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setLocalError('');

    if (password.length < MIN_PASSWORD) {
      setLocalError(`La contraseña necesita al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }

    setSubmitting(true);
    try {
      await register({ email, password, fullName, plan, billing });
      navigate('/app', { replace: true });
    } catch {
      // el mensaje ya está en el contexto
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page-pad auth-page">
      <div className="auth-card">
        <p className="eyebrow">Crear cuenta</p>
        <h1>Empieza en PinkPurpleSEO</h1>
        <p className="auth-lead">
          Creas la cuenta y entras directo al panel para conectar tu sitio y generar tu primera
          landing.
        </p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Nombre
            <input
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
            />
          </label>
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
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
            />
          </label>

          {localError || error ? (
            <p className="auth-error" role="alert">
              {localError || error}
            </p>
          ) : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta y entrar'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
