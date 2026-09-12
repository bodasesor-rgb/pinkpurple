import GoTrue from 'gotrue-js';

const identityUrl =
  import.meta.env.VITE_NETLIFY_IDENTITY_URL ||
  `${typeof window !== 'undefined' ? window.location.origin : ''}/.netlify/identity`;

let client;

export function getAuthClient() {
  if (!client) {
    client = new GoTrue({
      APIUrl: identityUrl,
      setCookie: true,
    });
  }
  return client;
}

export function getCurrentUser() {
  return getAuthClient().currentUser();
}

export function getExternalLoginUrl(provider) {
  return getAuthClient().loginExternalUrl(provider);
}

export function getGoogleLoginUrl() {
  return getExternalLoginUrl('google');
}

/** Completa sesión si el usuario vuelve de OAuth con tokens en el hash. */
export async function completeExternalLoginFromUrl() {
  if (typeof window === 'undefined') return null;

  const rawHash = window.location.hash?.replace(/^#/, '') || '';
  if (!rawHash.includes('access_token=')) return null;

  const params = new URLSearchParams(rawHash);
  const accessToken = params.get('access_token');
  if (!accessToken) return null;

  const session = {
    access_token: accessToken,
    refresh_token: params.get('refresh_token') || '',
    expires_in: params.get('expires_in') || '3600',
    token_type: params.get('token_type') || 'bearer',
  };

  const user = await getAuthClient().createUser(session, true);

  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, document.title, cleanUrl);

  return user;
}
