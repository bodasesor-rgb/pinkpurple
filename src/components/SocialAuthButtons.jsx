const ICONS = {
  google: (
    <svg className="btn-social__icon" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.1 4 9.2 8.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.1 39.5 15.9 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  ),
  github: (
    <svg className="btn-social__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.6-.3 2.4-.3s1.6.1 2.4.3c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 4-2.3 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"
      />
    </svg>
  ),
  gitlab: (
    <svg className="btn-social__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#E24329" d="M12 21.2 16.4 8H7.6L12 21.2z" />
      <path fill="#FC6D26" d="M12 21.2 7.6 8H2.1L12 21.2z" />
      <path fill="#FCA326" d="M2.1 8 1 11.3c-.1.3 0 .7.3.9L12 21.2 2.1 8z" />
      <path fill="#FC6D26" d="M12 21.2 16.4 8h5.5L12 21.2z" />
      <path fill="#FCA326" d="M21.9 8l1.1 3.3c.1.3 0 .7-.3.9L12 21.2 21.9 8z" />
    </svg>
  ),
};

const PROVIDERS = [
  { id: 'google', label: 'Iniciar sesión con Google' },
  { id: 'github', label: 'Iniciar sesión con GitHub' },
  { id: 'gitlab', label: 'Iniciar sesión con GitLab' },
];

export default function SocialAuthButtons({ onProvider, disabled, mode = 'login' }) {
  const labels =
    mode === 'register'
      ? {
          google: 'Registrarme con Google',
          github: 'Registrarme con GitHub',
          gitlab: 'Registrarme con GitLab',
        }
      : null;

  return (
    <div className="social-auth">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className={`btn-social btn-social--${provider.id}`}
          onClick={() => onProvider(provider.id)}
          disabled={disabled}
        >
          {ICONS[provider.id]}
          <span>{labels?.[provider.id] || provider.label}</span>
        </button>
      ))}
    </div>
  );
}
