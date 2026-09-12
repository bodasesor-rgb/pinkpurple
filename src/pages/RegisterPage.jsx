import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import SocialAuthButtons from '../components/SocialAuthButtons.jsx';

const PLAN_LABELS = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
  diamond: 'Diamond',
};

export default function RegisterPage() {
  const { register, loginWithProvider, isAuthenticated, error, clearError, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedPlan = useMemo(() => {
    const plan = String(searchParams.get('plan') || 'free').toLowerCase();
    return PLAN_LABELS[plan] ? plan : 'free';
  }, [searchParams]);

  const selectedBilling = useMemo(() => {
    const billing = String(searchParams.get('billing') || 'monthly').toLowerCase();
    return billing === 'annual' ? 'annual' : 'monthly';
  }, [searchParams]);

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
      const user = await register(email, password, fullName, {
        plan: selectedPlan,
        billing: selectedBilling,
      });
      const hasSession = Boolean(user?.token?.access_token || getAccessToken(user));
      if (hasSession || user?.confirmed_at) {
        navigate('/cuenta', { replace: true });
      } else {
        setInfo(
          'Cuenta creada. Revisa tu correo para confirmar (si Identity lo pide) y luego inicia sesión.',
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
        <h1>Crea tu cuenta</h1>
        <p className="auth-lead">
          Plan seleccionado:{' '}
          <strong>
            {PLAN_LABELS[selectedPlan]}
            {selectedPlan !== 'free'
              ? ` · ${selectedBilling === 'annual' ? 'Anual' : 'Mensual'}`
              : ''}
          </strong>
          . Podrás acceder a tu espacio PinkPurple SEO al iniciar sesión.
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

        <div className="auth-divider" role="presentation">
          <span>OR</span>
        </div>

        <SocialAuthButtons
          mode="register"
          onProvider={loginWithProvider}
          disabled={submitting}
        />

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

function getAccessToken(user) {
  return user?.token?.access_token || user?.access_token || null;
}
