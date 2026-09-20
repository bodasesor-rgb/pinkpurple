import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.tsx';
import SiteGate from './components/SiteGate.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SiteGate>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SiteGate>
    </BrowserRouter>
  </StrictMode>,
);
