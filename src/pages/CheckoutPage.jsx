import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import {
  formatNum,
  formatPrice,
  getPlanById,
  getPlanPricing,
} from '../data/plans.js';
import { demoCheckoutNexus, goToNexusPanel } from '../lib/nexusPanel.js';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, register, login, updatePlan, loading: authLoading } = useAuth();

  const plan = useMemo(() => getPlanById(searchParams.get('plan')), [searchParams]);
  const billing = useMemo(() => {
    const b = String(searchParams.get('billing') || 'monthly').toLowerCase();
    return b === 'annual' ? 'annual' : 'monthly';
  }, [searchParams]);

  const pricing = getPlanPricing(plan.price);
  const displayPrice = plan.price === 0 ? 0 : billing === 'annual' ? pricing.annualPerMonth : pricing.monthly;
  const isFree = plan.price === 0;

  const [fullName, setFullName] = useState(() => user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('ready'); // ready | paying | done

  async function ensureIdentitySession() {
    if (isAuthenticated && user) {
      await updatePlan(plan.id, billing);
      return user;
    }
    if (!email.trim() || !password || password.length < 8) {
      throw new Error('Completa correo y contraseña (mín. 8 caracteres).');
    }
    try {
      await register(email, password, fullName || email.split('@')[0], {
        plan: plan.id,
        billing,
      });
    } catch (err) {
      const msg = String(err?.json?.msg || err?.message || '');
      if (/already|registered|exists/i.test(msg)) {
        await login(email, password);
        await updatePlan(plan.id, billing);
      } else {
        throw err;
      }
    }
    return user;
  }

  async function onPay(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setStep('paying');
    try {
      await ensureIdentitySession();

      const payEmail = (user?.email || email).trim();
      const payPass = password || sessionStorage.getItem('pp_demo_pass') || '';
      if (password) sessionStorage.setItem('pp_demo_pass', password);

      let panelUrl = '/pp';
      try {
        const nexus = await demoCheckoutNexus({
          email: payEmail,
          password: payPass || password,
          fullName: fullName || user?.user_metadata?.full_name || '',
          plan: plan.id,
          billing,
        });
        panelUrl = nexus.panelUrl || nexus.enterUrl || '/pp';
      } catch (err) {
        // Si Nexus no responde, igual avanzamos al panel demo
        console.warn('demo checkout nexus', err);
        panelUrl = '/pp';
      }

      setStep('done');
      // breve feedback y salto al panel
      setTimeout(() => goToNexusPanel(panelUrl), 600);
    } catch (err) {
      setStep('ready');
      setError(
        err?.json?.error_description ||
          err?.json?.msg ||
          err?.message ||
          'No se pudo completar el pago demo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="container page-pad auth-page">
        <div className="auth-card">
          <p className="auth-lead">Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-pad auth-page">
      <div className="auth-card checkout-card">
        <p className="eyebrow">Pago demo</p>
        <h1>{isFree ? 'Activar prueba' : `Pagar ${plan.name}`}</h1>
        <p className="auth-lead">
          Simulación de compra: <strong>no se pide tarjeta</strong>. Al confirmar entras al panel
          de {plan.name}.
        </p>

        <div className="checkout-summary">
          <div>
            <span className="checkout-summary__label">Plan</span>
            <strong>{plan.name}</strong>
          </div>
          <div>
            <span className="checkout-summary__label">Precio</span>
            <strong>
              {formatPrice(displayPrice)}
              {!isFree ? (
                <small className="checkout-summary__period">
                  {billing === 'annual' ? 'USD / mes · facturación anual' : 'USD / mes'}
                </small>
              ) : null}
            </strong>
          </div>
          {!isFree && billing === 'annual' ? (
            <p className="auth-muted checkout-summary__note">
              Total anual ${formatNum(pricing.annualTotal)} · ahorras ${formatNum(pricing.savings)}
            </p>
          ) : null}
          <ul className="plan-card__pages">
            <li>
              <strong>{formatNum(plan.landings)}</strong> landings
            </li>
            <li>
              <strong>{formatNum(plan.blogs)}</strong> blogs
            </li>
            {plan.oneShot ? (
              <li>Una sola vez · sin tarjeta</li>
            ) : (
              <li>
                <strong>{formatNum(plan.landings + plan.blogs)}</strong> tokens / herramienta
              </li>
            )}
          </ul>
        </div>

        <form className="auth-form" onSubmit={onPay}>
          {isAuthenticated ? (
            <p className="auth-muted">
              Sesión: <strong>{user?.email}</strong>
            </p>
          ) : (
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
          )}

          {!isAuthenticated ? (
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
          ) : null}

          <label>
            Contraseña
            <PasswordInput
              autoComplete={isAuthenticated ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isAuthenticated ? 'Tu contraseña' : 'Mínimo 8 caracteres'}
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {step === 'paying' || submitting
              ? 'Procesando…'
              : step === 'done'
                ? 'Listo · abriendo panel…'
                : isFree
                  ? 'Activar prueba y entrar'
                  : `Pagar ${formatPrice(displayPrice)} (demo)`}
          </button>
        </form>

        <p className="checkout-demo-badge">Demo · sin cobro real · sin datos de tarjeta</p>
        <p className="auth-switch">
          <Link to="/productos/seo">Volver a planes</Link>
          {!isAuthenticated ? (
            <>
              {' · '}
              <Link to={`/login?next=${encodeURIComponent(`/pago?plan=${plan.id}&billing=${billing}`)}`}>
                Ya tengo cuenta
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
