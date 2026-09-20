import { useState, type InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export default function PasswordInput({ required = true, minLength, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-field">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        className="password-field__toggle"
        aria-pressed={visible}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? '🙈' : '👁'}
      </button>
    </span>
  );
}
