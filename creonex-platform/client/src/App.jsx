import IntroScreen from './components/IntroScreen/IntroScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage';
import ClientPage from './pages/ClientPage';
import ServicesPage from './pages/ServicesPage';

import ContactPage from './pages/ContactPage';
import PortfolioPage from './pages/PortfolioPage';
import BrandPage from './pages/BrandPage';
import OurStoryPage from './pages/OurStoryPage';
import CatalogPage from './pages/CatalogPage';
import LinksPage from './pages/LinksPage';
import { useEffect } from 'react';
import api from './services/api';
import { Routes, Route, useLocation } from 'react-router-dom';
import './styles/global.css';

import ScrollToTop from './components/ScrollToTop';

function App() {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        await api.post('/visitors/track', {
          userAgent: navigator.userAgent,
          page: location.pathname + location.hash
        });
      } catch (error) {
        console.error('Tracking failed:', error);
      }
    };
    trackVisit();
  }, [location]);

  return (
    <>
      <ScrollToTop />
      <IntroScreen />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/links" element={<LinksPage />} />

        <Route path="/brands" element={<BrandPage />} />
        <Route path="/catalogs" element={<CatalogPage />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/clients" element={<ClientPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
