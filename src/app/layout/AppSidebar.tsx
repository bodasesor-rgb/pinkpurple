import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { STUDIO_NAV, isGroupActive, type NavItem } from '../nav/studioNav';

type Props = {
  open: boolean;
  onClose: () => void;
};

function NavRow({
  item,
  depth = 0,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const enabled = item.enabled !== false;
  const hasChildren = Boolean(item.children?.length);
  const groupActive = isGroupActive(location.pathname, item);
  const [expanded, setExpanded] = useState(groupActive);

  useEffect(() => {
    if (groupActive) setExpanded(true);
  }, [groupActive]);

  if (!enabled) {
    return (
      <div className={`pp-nav__soon${depth ? ' pp-nav__soon--child' : ''}`} title="Próximamente">
        <span className="pp-nav__icon" aria-hidden="true">
          {item.icon}
        </span>
        <span className="pp-nav__label">
          {item.label}
          <em>Próximamente</em>
        </span>
      </div>
    );
  }

  if (hasChildren) {
    return (
      <div className="pp-nav__group">
        <button
          type="button"
          className={`pp-nav__link pp-nav__link--parent${groupActive ? ' is-active' : ''}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="pp-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="pp-nav__label">{item.label}</span>
          <span className="pp-nav__chev" aria-hidden="true">
            {expanded ? '▾' : '▸'}
          </span>
        </button>
        {expanded ? (
          <div className="pp-nav__children" role="group" aria-label={item.label}>
            {item.children!.map((child) => (
              <NavRow key={child.id} item={child} depth={depth + 1} onNavigate={onNavigate} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (!item.to) return null;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `pp-nav__link${depth ? ' pp-nav__link--child' : ''}${isActive ? ' is-active' : ''}`
      }
      onClick={onNavigate}
    >
      <span className="pp-nav__icon" aria-hidden="true">
        {item.icon}
      </span>
      <span className="pp-nav__label">{item.label}</span>
    </NavLink>
  );
}

export default function AppSidebar({ open, onClose }: Props) {
  return (
    <>
      <button
        type="button"
        className={`pp-sidebar-backdrop${open ? ' is-open' : ''}`}
        aria-label="Cerrar menú"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside className={`pp-sidebar${open ? ' is-open' : ''}`} aria-label="Menú Pink Purple Studio">
        <p className="pp-nav__section">Studio</p>
        <nav className="pp-nav" aria-label="Navegación del panel">
          {STUDIO_NAV.map((item) => (
            <NavRow key={item.id} item={item} onNavigate={onClose} />
          ))}
        </nav>
        <p className="pp-nav__section">Más herramientas</p>
        <p className="pp-nav__footnote">Nuevas automatizaciones aparecerán aquí.</p>
      </aside>
    </>
  );
}
