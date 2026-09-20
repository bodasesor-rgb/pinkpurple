/**
 * Puente de sesión + proxy hacia Nexus (Hostinger PinkPurple).
 *
 * Auth real → https://…/api/pinkpurple/{login,register,me,logout}
 * Sesión Hostinger = cookie `nexus_sid`; aquí se guarda en `pp_at` (httpOnly).
 * Rutas de panel (/projects, /jobs, …) aún no existen en Nexus → 404 al cliente
 * (el front puede caer a mocks según VITE_USE_MOCKS / MOCK_ONLY).
 *
 * Variable: NEXUS_API_URL = origen Hostinger (sin /api).
 */

const ACCESS_COOKIE = 'pp_at';
const REFRESH_COOKIE = 'pp_rt';
const ACCESS_MAX_AGE = 60 * 60 * 12; // 12 h (sesión browser en Nexus es sessionOnly)
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

interface NexusTokens {
  accessToken: string;
  refreshToken?: string;
}

function nexusBase(): string {
  const base = process.env.NEXUS_API_URL;
  if (!base) throw new Error('Falta la variable de entorno NEXUS_API_URL');
  return base.replace(/\/$/, '');
}

function json(body: unknown, status = 200, headers?: Headers): Response {
  const merged = headers ?? new Headers();
  merged.set('Content-Type', 'application/json; charset=utf-8');
  merged.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(body), { status, headers: merged });
}

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return null;
}

function cookieHeader(
  name: string,
  value: string,
  maxAge: number,
  secure: boolean,
): string {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (secure) attrs.push('Secure');
  return attrs.join('; ');
}

function isSecureRequest(req: Request): boolean {
  return new URL(req.url).protocol === 'https:';
}

function setSessionCookies(headers: Headers, tokens: NexusTokens, secure: boolean): void {
  headers.append('Set-Cookie', cookieHeader(ACCESS_COOKIE, tokens.accessToken, ACCESS_MAX_AGE, secure));
  if (tokens.refreshToken) {
    headers.append(
      'Set-Cookie',
      cookieHeader(REFRESH_COOKIE, tokens.refreshToken, REFRESH_MAX_AGE, secure),
    );
  }
}

function clearSessionCookies(headers: Headers, secure: boolean): void {
  headers.append('Set-Cookie', cookieHeader(ACCESS_COOKIE, '', 0, secure));
  headers.append('Set-Cookie', cookieHeader(REFRESH_COOKIE, '', 0, secure));
}

/** Extrae nexus_sid de Set-Cookie (una o varias). */
function extractNexusSid(response: Response): string | null {
  const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const list =
    typeof getSetCookie === 'function'
      ? getSetCookie.call(response.headers)
      : [response.headers.get('set-cookie')].filter(Boolean) as string[];

  for (const raw of list) {
    const m = /(?:^|,\s*)nexus_sid=([^;,\s]+)/i.exec(raw);
    if (m?.[1]) {
      try {
        return decodeURIComponent(m[1]);
      } catch {
        return m[1];
      }
    }
  }
  return null;
}

type AccountLike = Record<string, unknown>;

function mapUser(account: AccountLike | null | undefined) {
  if (!account) return null;
  const siteKey = String(account.siteKey || '').trim();
  return {
    id: String(account.id || ''),
    email: String(account.email || ''),
    fullName: String(account.fullName || ''),
    tenantId: siteKey || String(account.id || ''),
    planId: String(account.plan || 'trial'),
    createdAt: String(account.createdAt || new Date().toISOString()),
  };
}

function mapUsage(account: AccountLike) {
  const planId = String(account.plan || 'trial');
  const landingLeft = Number(account.trial_credits_landings ?? 0);
  const blogLeft = Number(account.trial_credits_blogs ?? 0);
  const landingLimit = planId === 'trial' || planId === 'free' ? 5 : null;
  const blogLimit = planId === 'trial' || planId === 'free' ? 5 : null;
  const started = String(account.trial_started_at || account.createdAt || new Date().toISOString());
  const start = new Date(started);
  const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    planId,
    planName: planId.charAt(0).toUpperCase() + planId.slice(1),
    billing: (account.billing as string) || 'monthly',
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    landings: {
      used: landingLimit == null ? 0 : Math.max(0, landingLimit - landingLeft),
      limit: landingLimit,
    },
    blogs: {
      used: blogLimit == null ? 0 : Math.max(0, blogLimit - blogLeft),
      limit: blogLimit,
    },
    sites: { used: account.siteKey ? 1 : 0, limit: planId === 'mini' ? 1 : planId === 'trial' ? 1 : 3 },
  };
}

async function callPinkpurple(
  path: string,
  init: RequestInit & { sid?: string } = {},
): Promise<{ status: number; body: unknown; sid: string | null; response: Response }> {
  const { sid, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set('Accept', 'application/json');
  headers.set('User-Agent', 'PinkPurple-Netlify-Proxy/1.0');
  if (sid) headers.set('Cookie', `nexus_sid=${sid}`);
  if (rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${nexusBase()}/api/pinkpurple${path}`, { ...rest, headers });
  const raw = await response.text();
  let body: unknown = null;
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = { message: raw };
    }
  }
  return { status: response.status, body, sid: extractNexusSid(response), response };
}

async function handleAuth(req: Request, action: string): Promise<Response> {
  const secure = isSecureRequest(req);
  const payload = (req.method === 'POST' ? await req.json().catch(() => ({})) : {}) as Record<
    string,
    unknown
  >;

  if (action === 'logout') {
    const token = readCookie(req, ACCESS_COOKIE);
    if (token) {
      await callPinkpurple('/logout', { method: 'POST', sid: token }).catch(() => null);
    }
    const headers = new Headers();
    clearSessionCookies(headers, secure);
    return json({ ok: true }, 200, headers);
  }

  if (action === 'login') {
    const { status, body, sid } = await callPinkpurple('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });
    if (status < 200 || status >= 300) {
      const err = (body ?? {}) as Record<string, unknown>;
      return json({ error: err.error || err.message || 'Credenciales incorrectas' }, status);
    }
    if (!sid) {
      return json({ error: 'Nexus no devolvió cookie de sesión.' }, 502);
    }
    const data = (body ?? {}) as Record<string, unknown>;
    const account = (data.account ?? data) as AccountLike;
    const headers = new Headers();
    setSessionCookies(headers, { accessToken: sid }, secure);
    return json({ user: mapUser(account) }, 200, headers);
  }

  if (action === 'register') {
    const { status, body } = await callPinkpurple('/register', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        fullName: payload.fullName ?? payload.full_name,
        plan: payload.plan || 'trial',
        billing: payload.billing || 'monthly',
      }),
    });
    if (status < 200 || status >= 300) {
      const err = (body ?? {}) as Record<string, unknown>;
      return json({ error: err.error || err.message || 'No se pudo registrar' }, status);
    }

    // Tras registro: login inmediato (authenticate no exige emailVerified).
    const login = await callPinkpurple('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });
    if (login.status >= 200 && login.status < 300 && login.sid) {
      const data = (login.body ?? {}) as Record<string, unknown>;
      const account = (data.account ?? data) as AccountLike;
      const headers = new Headers();
      setSessionCookies(headers, { accessToken: login.sid }, secure);
      return json({ user: mapUser(account) }, 200, headers);
    }

    const reg = (body ?? {}) as Record<string, unknown>;
    return json({
      user: mapUser((reg.account as AccountLike) || null),
      pendingVerification: true,
      message: reg.message || 'Cuenta creada. Confirma tu correo o inicia sesión.',
    });
  }

  if (action === 'me') {
    const token = readCookie(req, ACCESS_COOKIE);
    if (!token) {
      const headers = new Headers();
      clearSessionCookies(headers, secure);
      return json({ error: 'Sesión no válida' }, 401, headers);
    }
    const { status, body } = await callPinkpurple('/me', { sid: token });
    if (status >= 200 && status < 300) {
      const data = (body ?? {}) as Record<string, unknown>;
      return json({ user: mapUser((data.account as AccountLike) || null) });
    }
    const headers = new Headers();
    clearSessionCookies(headers, secure);
    return json({ error: 'Sesión no válida' }, 401, headers);
  }

  if (action === 'refresh') {
    // PinkPurple Hostinger no emite refresh tokens; la cookie nexus_sid basta.
    const token = readCookie(req, ACCESS_COOKIE);
    if (!token) return json({ error: 'Sin sesión' }, 401);
    const { status, body } = await callPinkpurple('/me', { sid: token });
    if (status < 200 || status >= 300) return json({ error: 'Sesión expirada' }, 401);
    return json({ accessToken: token, user: mapUser(((body as Record<string, unknown>)?.account as AccountLike) || null) });
  }

  if (action === 'forgot-password' || action === 'reset-password') {
    return json(
      {
        error: 'Recuperación de contraseña aún no está disponible en Nexus. Contacta soporte.',
        code: 'NOT_IMPLEMENTED',
      },
      501,
    );
  }

  return json({ error: 'Ruta de sesión desconocida' }, 404);
}

async function handleProxy(req: Request, path: string): Promise<Response> {
  const token = readCookie(req, ACCESS_COOKIE);
  const secure = isSecureRequest(req);

  if (!token) {
    return json({ error: 'Inicia sesión para continuar.' }, 401);
  }

  // Endpoints mapeados a lo que Hostinger ya tiene
  if (path === '/me' || path === '/me/') {
    const { status, body } = await callPinkpurple('/me', { sid: token });
    if (status === 401) {
      const headers = new Headers();
      clearSessionCookies(headers, secure);
      return json({ error: 'Sesión no válida' }, 401, headers);
    }
    if (status < 200 || status >= 300) {
      const err = (body ?? {}) as Record<string, unknown>;
      return json({ error: err.error || 'Error' }, status);
    }
    const data = (body ?? {}) as Record<string, unknown>;
    return json(mapUser((data.account as AccountLike) || null));
  }

  if (path === '/usage' || path === '/usage/') {
    const { status, body } = await callPinkpurple('/me', { sid: token });
    if (status === 401) {
      const headers = new Headers();
      clearSessionCookies(headers, secure);
      return json({ error: 'Sesión no válida' }, 401, headers);
    }
    if (status < 200 || status >= 300) {
      const err = (body ?? {}) as Record<string, unknown>;
      return json({ error: err.error || 'Error' }, status);
    }
    const data = (body ?? {}) as Record<string, unknown>;
    const account = (data.account as AccountLike) || {};
    return json(mapUsage(account));
  }

  // El resto del panel (projects/jobs/connections) aún no existe en Hostinger.
  return json(
    {
      error: 'Este endpoint aún no está en Nexus. Usa mocks en desarrollo o espera el siguiente deploy.',
      code: 'NOT_IMPLEMENTED',
      path,
    },
    404,
  );
}

export default async function handler(req: Request): Promise<Response> {
  const path =
    new URL(req.url).pathname
      .replace(/^\/\.netlify\/functions\/nexus-proxy/, '')
      .replace(/^\/api/, '') || '/';

  try {
    if (path.startsWith('/auth/')) {
      return await handleAuth(req, path.replace('/auth/', ''));
    }
    return await handleProxy(req, path);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado en el puente con Nexus';
    return json({ error: message }, 500);
  }
}
