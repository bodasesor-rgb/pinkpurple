import { Routes, Route } from 'react-router-dom';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import HomePage from './pages/HomePage.jsx';
import BlogIndexPage from './pages/BlogIndexPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}
