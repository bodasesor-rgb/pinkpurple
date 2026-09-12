/** Base del panel Nexus (Hostinger). */
export const NEXUS_ORIGIN = String(
  import.meta.env.VITE_NEXUS_URL || 'https://white-ferret-567834.hostingersite.com',
).replace(/\/$/, '');

/**
 * Contrato entrada panel:
 * - Preferido: /pp (Nexus decide onboarding vs panel aislado)
 * - Con handoffToken: /api/pinkpurple/enter?h=… (fija cookie first-party)
 * - Nunca hub admin /
 */
export function resolveNexusEntry(data) {
  if (!data) return '/pp';
  if (typeof data === 'string') {
    const path = data.trim() || '/pp';
    if (path === '/' || path === '') return '/pp';
    return path;
  }
  const handoff = data.handoffToken || data.handoff;
  if (handoff) {
    return `/api/pinkpurple/enter?h=${encodeURIComponent(handoff)}`;
  }
  if (data.openUrl && String(data.openUrl).startsWith('/')) {
    return data.openUrl;
  }
  // Preferido: enterUrl (/pp). No deep-link a /onboarding desde Pink.
  const enter = data.enterUrl || '/pp';
  if (enter === '/' || enter === '') return '/pp';
  return enter;
}

/**
 * Redirect de navegador completo al panel Nexus (no solo fetch).
 */
export function goToNexusPanel(panelUrlOrResponse) {
  const path = resolveNexusEntry(panelUrlOrResponse);
  const normalized = path.startsWith('http')
    ? path
    : `${NEXUS_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
  window.location.assign(normalized);
}

/** Crea sesión Nexus (cookie) y devuelve panelUrl / enterUrl / handoffToken. */
export async function loginNexusPinkpurple(email, password) {
  const res = await fetch(`${NEXUS_ORIGIN}/api/pinkpurple/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'No se pudo abrir el panel Nexus');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Registro en Nexus (opcional; si falla, igual se puede entrar después). */
export async function registerNexusPinkpurple({ email, password, fullName, plan, billing }) {
  const res = await fetch(`${NEXUS_ORIGIN}/api/pinkpurple/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email,
      password,
      fullName,
      plan: plan === 'free' ? 'trial' : plan,
      billing,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 409) {
    const err = new Error(data.error || 'No se pudo registrar en Nexus');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Checkout demo: crea/activa plan y sesión Nexus sin tarjeta. */
export async function demoCheckoutNexus({ email, password, fullName, plan, billing }) {
  const res = await fetch(`${NEXUS_ORIGIN}/api/pinkpurple/demo-checkout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email,
      password,
      fullName,
      plan: plan === 'free' ? 'trial' : plan,
      billing,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'No se pudo activar el plan en el panel');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
