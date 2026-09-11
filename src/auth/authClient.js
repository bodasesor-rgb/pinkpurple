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
