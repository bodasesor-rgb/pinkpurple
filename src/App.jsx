import { Routes, Route, Navigate } from 'react-router-dom';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import BlogIndexPage from './pages/BlogIndexPage.jsx';
import ProductsIndexPage from './pages/ProductsIndexPage.jsx';
import SeoProductPage from './pages/SeoProductPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import AccountPage from './pages/AccountPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductsIndexPage />} />
          <Route path="/productos/seo" element={<SeoProductPage />} />
          <Route path="/servicios" element={<Navigate to="/productos/seo" replace />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/pago" element={<CheckoutPage />} />
          <Route
            path="/cuenta"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}
