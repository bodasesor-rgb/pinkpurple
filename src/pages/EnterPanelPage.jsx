import { useState } from 'react';
import { Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput.jsx';
import { goToNexusPanel, loginNexusPinkpurple } from '../lib/nexusPanel.js';

/**
 * Entrada al panel: correo/contraseña → POST login Nexus → redirect navegador a /pp.
 * Nexus decide onboarding vs panel aislado. No hay panel embebido en Pink.
 */
export default function EnterPanelPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const nexus = await loginNexusPinkpurple(email.trim(), password);
      goToNexusPanel(nexus);
    } catch (err) {
      setError(err?.message || 'No se pudo abrir el panel. Revisa correo y contraseña.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page-pad auth-page">
      <div className="auth-card">
        <p className="eyebrow">Panel SEO</p>
        <h1>Abrir mi panel SEO</h1>
        <p className="auth-lead">
          Escribe el correo y contraseña de tu cuenta PinkPurple. Te llevamos a Nexus (
          <code>/pp</code>
          ): si ya pagaste y falta marca, abre el wizard; si ya completaste, tu panel aislado.
        </p>

        <form className="auth-form" onSubmit={onSubmit} autoComplete="off">
          <label>
            Correo
            <input
              type="email"
              name="pp_panel_email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </label>
          <label>
            Contraseña
            <PasswordInput
              name="pp_panel_password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Abrir mi panel SEO'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Nuevo? <Link to="/productos/seo">Elige un plan</Link>
          {' · '}
          <Link to="/login">Cuenta del sitio</Link>
        </p>
      </div>
    </div>
  );
}
