// src/App.js — Root file, handles routing only
import { useState, useEffect } from 'react';
import { inject } from '@vercel/analytics';
import ReactGA from 'react-ga4';
import ReactPixel from 'react-facebook-pixel';
import { useScreenSize } from './hooks/useScreenSize';
import { SkeletonStyles } from './components/NavBar';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { TransformationsPage } from './pages/TransformationsPage';
import { TermsPage } from './pages/TermsPage';
import { ThreeDPage } from './pages/ThreeDPage';
inject();
ReactGA.initialize('G-5RX50YTJPJ');
ReactPixel.init('1539732854496459');
export default function App() {
  const { isMobile, isTablet } = useScreenSize();
  const [page, setPage]             = useState('home');
  const [showForm, setShowForm]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  // Admin via hash
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin');
  useEffect(() => {
    const handleHash = () => setIsAdmin(window.location.hash === '#admin');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  // Page view tracking
  useEffect(() => {
    if (isAdmin) return;
    ReactGA.send({ hitType: 'pageview', page: `/${page}` });
    ReactPixel.pageView();
  }, [page, isAdmin]);
  // Shared navigation helpers
  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const goToForm = () => {
    setPage('home');
    setShowForm(true);
    setTimeout(() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' }), 150);
  };
  const handleStartNow = () => {
    ReactGA.event({ category: 'CTA', action: 'clicked_start_now' });
    setShowForm(true);
    setMenuOpen(false);
    setTimeout(() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  // Shared props passed to every page
  const sharedProps = {
    isMobile, isTablet,
    page, setPage,
    menuOpen, setMenuOpen,
    searchOpen, setSearchOpen,
    searchText, setSearchText,
    showForm, setShowForm,
    scrollTo, goToForm, handleStartNow,
  };
  if (isAdmin) return <><SkeletonStyles /><AdminPage isMobile={isMobile} /></>;
  return (
    <>
      <SkeletonStyles />
      {page === 'home'            && <HomePage           {...sharedProps} />}
      {page === '3d'              && <ThreeDPage          {...sharedProps} />}
      {page === 'transformations' && <TransformationsPage {...sharedProps} />}
      {page === 'terms'           && <TermsPage           {...sharedProps} />}
    </>
  );
}
