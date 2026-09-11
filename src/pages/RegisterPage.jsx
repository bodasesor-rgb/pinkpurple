import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function RegisterPage() {
  const { register, isAuthenticated, error, clearError, loading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState('');

  if (!loading && isAuthenticated) {
    return <Navigate to="/cuenta" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    clearError();
    setInfo('');
    setSubmitting(true);
    try {
      const user = await register(email, password, fullName);
      if (user?.confirmed_at || user?.token?.access_token) {
        navigate('/cuenta', { replace: true });
      } else {
        setInfo(
          'Cuenta creada. Si tu sitio pide confirmación, revisa tu correo y luego inicia sesión.',
        );
      }
    } catch {
      // error in context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page-pad auth-page">
      <div className="auth-card">
        <p className="eyebrow">Registro</p>
        <h1>Crea tu cuenta Free</h1>
        <p className="auth-lead">
          2 landings, 2 blogs y 2 tokens por herramienta para empezar.
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
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}
          {info ? <p className="auth-info">{info}</p> : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
