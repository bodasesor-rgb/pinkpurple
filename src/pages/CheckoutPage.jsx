import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import {
  formatNum,
  formatPrice,
  formatSites,
  getPlanById,
  getPlanPricing,
} from '../data/plans.js';
import { demoCheckoutNexus, goToNexusPanel } from '../lib/nexusPanel.js';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const { register, login, updatePlan, logout, loading: authLoading } = useAuth();

  const plan = useMemo(() => getPlanById(searchParams.get('plan')), [searchParams]);
  const billing = useMemo(() => {
    const b = String(searchParams.get('billing') || 'monthly').toLowerCase();
    return b === 'annual' ? 'annual' : 'monthly';
  }, [searchParams]);

  const pricing = getPlanPricing(plan.price);
  const displayPrice = plan.price === 0 ? 0 : billing === 'annual' ? pricing.annualPerMonth : pricing.monthly;
  const isFree = plan.price === 0;

  // Siempre en blanco: se crea / confirma la cuenta en este paso (no heredar empresa)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('ready');
  const [readyForm, setReadyForm] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await logout();
      } catch {
        /* ignore */
      } finally {
        if (alive) {
          setFullName('');
          setEmail('');
          setPassword('');
          setReadyForm(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ensureIdentitySession() {
    if (!email.trim() || !password || password.length < 8) {
      throw new Error('Completa correo y contraseña (mín. 8 caracteres).');
    }
    try {
      await register(email.trim(), password, fullName.trim() || email.split('@')[0], {
        plan: plan.id,
        billing,
      });
    } catch (err) {
      const msg = String(err?.json?.msg || err?.message || '');
      if (/already|registered|exists/i.test(msg)) {
        await login(email.trim(), password);
        await updatePlan(plan.id, billing);
      } else {
        throw err;
      }
    }
  }

  async function onPay(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setStep('paying');
    try {
      await ensureIdentitySession();

      const payEmail = email.trim();
      const payPass = password;
      sessionStorage.setItem('pp_demo_pass', payPass);

      let nexusPayload = { enterUrl: '/pp' };
      try {
        const nexus = await demoCheckoutNexus({
          email: payEmail,
          password: payPass,
          fullName: fullName.trim() || payEmail.split('@')[0],
          plan: plan.id,
          billing,
        });
        nexusPayload = nexus;
      } catch (err) {
        console.warn('demo checkout nexus', err);
      }

      setStep('done');
      setTimeout(() => goToNexusPanel(nexusPayload), 600);
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

  if (authLoading || !readyForm) {
    return (
      <div className="container page-pad auth-page">
        <div className="auth-card">
          <p className="auth-lead">Preparando checkout…</p>
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
          Crea tu cuenta aquí (campos en blanco). <strong>No se pide tarjeta</strong>. Al confirmar
          entras a tu panel.
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
            <li>
              <strong>{formatSites(plan.sites)}</strong>
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

        <form className="auth-form" onSubmit={onPay} autoComplete="off">
          <label>
            Nombre
            <input
              type="text"
              name="pp_checkout_name"
              autoComplete="off"
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
              name="pp_checkout_email"
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
              name="pp_checkout_password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
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
          {' · '}
          <Link to="/entrar-panel">Ya tengo cuenta · abrir panel</Link>
        </p>
      </div>
    </div>
  );
}
