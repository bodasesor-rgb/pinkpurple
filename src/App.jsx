import { Routes, Route, Navigate, Outlet, useParams, useSearchParams } from 'react-router-dom';
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

// Panel Studio
import AppLayout from './app/layout/AppLayout.tsx';
import ProfilePage from './app/profile/ProfilePage.tsx';
import SettingsPage from './app/settings/SettingsPage.tsx';
import ProjectsPage from './app/projects/ProjectsPage.tsx';
import ProjectFormPage from './app/projects/ProjectFormPage.tsx';
import GeneratePage from './app/generate/GeneratePage.tsx';
import HistoryPage from './app/history/HistoryPage.tsx';
import ConnectionsPage from './app/connections/ConnectionsPage.tsx';
import BillingPage from './app/billing/BillingPage.tsx';

import NexusClientConfigPage from './pages/NexusClientConfigPage.tsx';

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

function CheckoutRedirect() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={`/registro${query ? `?${query}` : ''}`} replace />;
}

function LegacyProjectRedirect() {
  const { projectId } = useParams();
  return <Navigate to={`/app/seo/proyectos/${projectId}`} replace />;
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
        <Route index element={<ProfilePage />} />

        <Route path="seo">
          <Route index element={<Navigate to="proyectos" replace />} />
          <Route path="proyectos" element={<ProjectsPage />} />
          <Route path="proyectos/nuevo" element={<ProjectFormPage />} />
          <Route path="proyectos/:projectId" element={<ProjectFormPage />} />
          <Route path="generar" element={<GeneratePage />} />
          <Route path="historial" element={<HistoryPage />} />
          <Route path="conexiones" element={<ConnectionsPage />} />
        </Route>

        <Route path="configuracion" element={<SettingsPage />}>
          <Route path="plan" element={<BillingPage />} />
        </Route>

        {/* Compat rutas planas antiguas */}
        <Route path="proyectos" element={<Navigate to="/app/seo/proyectos" replace />} />
        <Route path="proyectos/nuevo" element={<Navigate to="/app/seo/proyectos/nuevo" replace />} />
        <Route path="proyectos/:projectId" element={<LegacyProjectRedirect />} />
        <Route path="generar" element={<Navigate to="/app/seo/generar" replace />} />
        <Route path="historial" element={<Navigate to="/app/seo/historial" replace />} />
        <Route path="conexiones" element={<Navigate to="/app/seo/conexiones" replace />} />
        <Route path="plan" element={<Navigate to="/app/configuracion/plan" replace />} />

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
