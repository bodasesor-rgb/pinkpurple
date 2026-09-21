import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

type Props = {
  onMenuToggle: () => void;
  onLogout: () => void;
};

export default function AppTopbar({ onMenuToggle, onLogout }: Props) {
  const { user } = useAuth();

  return (
    <header className="pp-topbar">
      <div className="pp-topbar__left">
        <button
          type="button"
          className="pp-topbar__menu"
          aria-label="Abrir menú"
          onClick={onMenuToggle}
        >
          <span />
          <span />
          <span />
        </button>
        <NavLink to="/app" className="pp-topbar__brand" end>
          <img src="/brand/logo-mark.svg" alt="" width={24} height={28} />
          <span className="pp-topbar__brand-text">
            <strong>Pink Purple</strong>
            <em>Studio</em>
          </span>
        </NavLink>
      </div>

      <div className="pp-topbar__right">
        <div className="pp-topbar__user-menu">
          <span className="pp-topbar__user" title={user?.email || ''}>
            {user?.fullName || user?.email || 'Cuenta'}
          </span>
          <button type="button" className="pp-btn pp-btn--ghost pp-btn--sm" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
