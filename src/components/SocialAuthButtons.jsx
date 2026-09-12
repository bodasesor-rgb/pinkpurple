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
  apple: (
    <svg className="btn-social__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3.1-1.6-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.7-1.4.1-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1-.1 1.5-.7 2.8-.7s1.7.7 2.8.7 1.9-1.1 2.6-2.1c.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.4-3.7zM14.2 6.5c.6-.7 1-1.7.9-2.7-1 .1-2.1.6-2.8 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2.1-.5 2.8-1.4z"
      />
    </svg>
  ),
  facebook: (
    <svg className="btn-social__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23.1 10.1 24v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.9v2.3h3.3l-.5 3.5h-2.8V24C19.6 23.1 24 18.1 24 12.1z"
      />
    </svg>
  ),
};

const PROVIDERS = [
  { id: 'google', label: 'Iniciar sesión con Google' },
  { id: 'apple', label: 'Iniciar sesión con Apple' },
  { id: 'facebook', label: 'Iniciar sesión con Facebook' },
];

export default function SocialAuthButtons({ onProvider, disabled, mode = 'login' }) {
  const labels =
    mode === 'register'
      ? {
          google: 'Registrarme con Google',
          apple: 'Registrarme con Apple',
          facebook: 'Registrarme con Facebook',
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
