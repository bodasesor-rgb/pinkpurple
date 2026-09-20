import { Routes, Route, Navigate, Outlet, useSearchParams } from 'react-router-dom';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

// Sitio público
import HomePage from './pages/HomePage.jsx';
import BlogIndexPage from './pages/BlogIndexPage.jsx';
import ProductsIndexPage from './pages/ProductsIndexPage.jsx';
import SeoProductPage from './pages/SeoProductPage.jsx';
import HowItWorksPage from './pages/HowItWorksPage.jsx';

// Auth
import LoginPage from './auth/pages/LoginPage.tsx';
import RegisterPage from './auth/pages/RegisterPage.tsx';
import ForgotPasswordPage from './auth/pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './auth/pages/ResetPasswordPage.tsx';

// Panel de clientes
import AppLayout from './app/layout/AppLayout.tsx';
import DashboardPage from './app/dashboard/DashboardPage.tsx';
import ProjectsPage from './app/projects/ProjectsPage.tsx';
import ProjectFormPage from './app/projects/ProjectFormPage.tsx';
import GeneratePage from './app/generate/GeneratePage.tsx';
import HistoryPage from './app/history/HistoryPage.tsx';
import ConnectionsPage from './app/connections/ConnectionsPage.tsx';
import BillingPage from './app/billing/BillingPage.tsx';

// Sitio público — prototipo config Nexus (antes de mandarlo a clientes)
import NexusClientConfigPage from './pages/NexusClientConfigPage.tsx';

/** Marketing + auth comparten cabecera y pie; el panel tiene su propio layout. */
function PublicShell() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

/** El checkout real aún no existe: /pago manda al registro con el plan elegido. */
function CheckoutRedirect() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={`/registro${query ? `?${query}` : ''}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="proyectos" element={<ProjectsPage />} />
        <Route path="proyectos/nuevo" element={<ProjectFormPage />} />
        <Route path="proyectos/:projectId" element={<ProjectFormPage />} />
        <Route path="generar" element={<GeneratePage />} />
        <Route path="historial" element={<HistoryPage />} />
        <Route path="conexiones" element={<ConnectionsPage />} />
        <Route path="plan" element={<BillingPage />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>

      <Route element={<PublicShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsIndexPage />} />
        <Route path="/productos/seo" element={<SeoProductPage />} />
        <Route path="/como-funciona" element={<HowItWorksPage />} />
        <Route path="/configuracion-nexus" element={<NexusClientConfigPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/servicios" element={<Navigate to="/productos/seo" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar" element={<ForgotPasswordPage />} />
        <Route path="/nueva-password" element={<ResetPasswordPage />} />

        <Route path="/pago" element={<CheckoutRedirect />} />
        <Route path="/entrar-panel" element={<Navigate to="/app" replace />} />
        <Route path="/cuenta" element={<Navigate to="/app" replace />} />
        <Route path="/app/configuracion-nexus" element={<Navigate to="/configuracion-nexus" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
