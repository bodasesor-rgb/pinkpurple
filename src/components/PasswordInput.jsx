import { useState } from 'react';

export default function PasswordInput({
  value,
  onChange,
  autoComplete = 'current-password',
  placeholder = '••••••••',
  required = true,
  minLength = 8,
  id,
  name = 'password',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
      <path
        fill="currentColor"
        d="M12 5c-5 0-9.3 3.1-11 7 1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
      <path
        fill="currentColor"
        d="M3.3 2.3 2 3.6l3.1 3.1C3.2 8 1.7 9.8 1 12c1.7 3.9 6 7 11 7 1.8 0 3.5-.4 5-1.1l3.4 3.4 1.3-1.3L3.3 2.3ZM12 17c-3.6 0-6.7-2-8.4-5 .7-1.3 1.8-2.5 3.1-3.3l1.7 1.7A4.9 4.9 0 0 0 7 12a5 5 0 0 0 7.6 4.3l1.5 1.5c-1.3.7-2.7 1.2-4.1 1.2Zm9.4-1.7-1.5-1.5c.7-.8 1.3-1.8 1.5-2.8-1.7-3.9-6-7-11-7-1 0-2 .1-2.9.4l1.7 1.7c.4-.1.8-.1 1.2-.1a5 5 0 0 1 5 5c0 .4 0 .8-.1 1.2l3.1 3.1Z"
      />
    </svg>
  );
}
