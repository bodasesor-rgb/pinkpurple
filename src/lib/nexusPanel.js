/** Base del panel Nexus (Hostinger). */
export const NEXUS_ORIGIN = String(
  import.meta.env.VITE_NEXUS_URL || 'https://white-ferret-567834.hostingersite.com',
).replace(/\/$/, '');

/**
 * Tras login válido: ir al panel PinkPurple en Hostinger.
 * panelUrl viene de Nexus (ej. /panel?en=…) o se usa /pp.
 */
export function goToNexusPanel(panelUrl) {
  const path = panelUrl || '/pp';
  const normalized = path.startsWith('http') ? path : `${NEXUS_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
  window.location.href = normalized;
}

/** Crea sesión Nexus (cookie) y devuelve panelUrl / enterUrl. */
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
