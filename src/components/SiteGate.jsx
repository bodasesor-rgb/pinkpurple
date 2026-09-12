import { useState } from 'react';
import PasswordInput from './PasswordInput.jsx';

const GATE_KEY = 'pp_site_gate_ok';

/** Contraseña del prototipo. Sobrescribe con VITE_SITE_GATE_PASSWORD en Netlify. */
const SITE_PASSWORD = String(
  import.meta.env.VITE_SITE_GATE_PASSWORD || 'PinkPurple2026!',
).trim();

/** Pon VITE_SITE_GATE_ENABLED=false para desactivar el candado (solo local). */
const GATE_ENABLED = String(import.meta.env.VITE_SITE_GATE_ENABLED ?? 'true') !== 'false';

export default function SiteGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    if (!GATE_ENABLED || !SITE_PASSWORD) return true;
    try {
      return sessionStorage.getItem(GATE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!GATE_ENABLED || !SITE_PASSWORD || unlocked) {
    return children;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      try {
        sessionStorage.setItem(GATE_KEY, '1');
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      setError('');
      return;
    }
    setError('Contraseña incorrecta.');
  }

  return (
    <div className="container page-pad auth-page site-gate">
      <div className="auth-card">
        <p className="eyebrow">Acceso privado</p>
        <h1>PinkPurple Studio</h1>
        <p className="auth-lead">
          El sitio está en prototipo. Escribe la contraseña de acceso para continuar.
        </p>
        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Contraseña
            <PasswordInput
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Contraseña del sitio"
              minLength={1}
            />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="btn btn-primary auth-submit" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
