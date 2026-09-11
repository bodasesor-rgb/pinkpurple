import { Routes, Route } from 'react-router-dom';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import BlogIndexPage from './pages/BlogIndexPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AccountPage from './pages/AccountPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
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
