import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import InquiriesPage from './pages/InquiriesPage';
import BrandsCollabsPage from './pages/BrandsCollabsPage';

import VisitorsPage from './pages/VisitorsPage';

import AnalyticsPage from './pages/AnalyticsPage';

import ServicesPage from './pages/ServicesPage';

import PortfolioPage from './pages/PortfolioPage';

import NotesPage from './pages/NotesPage';
import CatalogsPage from './pages/CatalogsPage';
import CatalogInquiriesPage from './pages/CatalogInquiriesPage';
import InvoiceGeneratorPage from './pages/InvoiceGeneratorPage';

const RequireAuth = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="visitors" element={<VisitorsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="inquiries" element={<InquiriesPage />} />
                <Route path="brands-collabs" element={<BrandsCollabsPage />} />
                <Route path="notes" element={<NotesPage />} />
                <Route path="catalogs" element={<CatalogsPage />} />
                <Route path="catalog-inquiries" element={<CatalogInquiriesPage />} />
                <Route path="users" element={<div>Users Page</div>} />
                <Route path="invoices" element={<InvoiceGeneratorPage />} />
                <Route path="settings" element={<div>Settings Page</div>} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
