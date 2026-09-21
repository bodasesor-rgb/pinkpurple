import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import '../../styles/panel.css';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  async function onLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={`pp-app${drawerOpen ? ' pp-app--drawer-open' : ''}`}>
      <AppTopbar onMenuToggle={() => setDrawerOpen((v) => !v)} onLogout={onLogout} />
      <AppSidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="pp-main">
        <div className="pp-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
