import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PasswordInput from '../../components/ui/PasswordInput';
import { useAuth } from '../AuthContext';

const MIN_PASSWORD = 8;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, error, clearError } = useAuth();

  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setLocalError('');

    if (password.length < MIN_PASSWORD) {
      setLocalError(`La contraseña necesita al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    if (password !== repeat) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch {
      // el mensaje ya está en el contexto
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="container page-pad auth-page">
        <div className="auth-card">
          <p className="eyebrow">Recuperar acceso</p>
          <h1>Enlace no válido</h1>
          <p className="auth-lead">
            El enlace está incompleto o caducó. Pide uno nuevo desde recuperar contraseña.
          </p>
          <p className="auth-switch">
            <Link to="/recuperar">Pedir enlace nuevo</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-pad auth-page">
      <div className="auth-card">
        <p className="eyebrow">Recuperar acceso</p>
        <h1>Crea tu contraseña nueva</h1>

        {done ? (
          <p className="auth-info" role="status">
            Contraseña actualizada. Te llevamos a iniciar sesión…
          </p>
        ) : (
          <form className="auth-form" onSubmit={onSubmit}>
            <label>
              Contraseña nueva
              <PasswordInput
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
              />
            </label>
            <label>
              Repite la contraseña
              <PasswordInput
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                placeholder="Otra vez"
              />
            </label>

            {localError || error ? (
              <p className="auth-error" role="alert">
                {localError || error}
              </p>
            ) : null}

            <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
