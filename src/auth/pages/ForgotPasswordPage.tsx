import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ForgotPasswordPage() {
  const { requestPasswordReset, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch {
      // el mensaje ya está en el contexto
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page-pad auth-page">
      <div className="auth-card">
        <p className="eyebrow">Recuperar acceso</p>
        <h1>¿Olvidaste tu contraseña?</h1>

        {sent ? (
          <>
            <p className="auth-lead">
              Si <strong>{email}</strong> tiene cuenta, te enviamos un correo con el enlace para
              crear una contraseña nueva. Revisa también spam.
            </p>
            <p className="auth-switch">
              <Link to="/login">Volver a iniciar sesión</Link>
            </p>
          </>
        ) : (
          <>
            <p className="auth-lead">
              Escribe tu correo y te mandamos un enlace para crear una contraseña nueva.
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

              {error ? (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
                {submitting ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>

            <p className="auth-switch">
              <Link to="/login">Volver a iniciar sesión</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
