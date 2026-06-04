// src/pages/ThreeDPage.js

import { NavBar, DropdownMenu, SearchBar } from '../components/NavBar';

export function ThreeDPage({ isMobile, isTablet, setPage, menuOpen, setMenuOpen, searchOpen, setSearchOpen, searchText, setSearchText, handleStartNow, scrollTo }) {
  const bodyFontSize = isMobile ? '15px' : isTablet ? '16px' : '18px';

  const searchTargets = buildSearchTargets({ setPage, setMenuOpen, handleStartNow, scrollTo });

  const onSelect = (target) => { target.action(); setSearchOpen(false); setSearchText(''); };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
      {searchOpen && <SearchBar searchText={searchText} setSearchText={setSearchText} searchTargets={searchTargets} onSelect={onSelect} onClose={() => { setSearchOpen(false); setSearchText(''); }} />}
      <NavBar isMobile={isMobile} onHome={() => { setPage('home'); setMenuOpen(false); }} onSearch={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }} onMenu={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }} />
      {menuOpen && <DropdownMenu isMobile={isMobile} items={buildMenuItems({ setPage, setMenuOpen, handleStartNow, scrollTo })} />}

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
        <p style={{ fontSize: isMobile ? '60px' : '80px', marginBottom: '24px' }}>🔧</p>
        <h1 style={{ fontSize: isMobile ? '36px' : isTablet ? '48px' : '64px', fontWeight: '300', color: 'black', marginBottom: '16px', letterSpacing: '-2px' }}>
          Coming <span style={{ fontWeight: '700' }}>Soon</span>
        </h1>
        <p style={{ fontSize: bodyFontSize, color: '#6b7280', fontWeight: '300', maxWidth: '500px', lineHeight: 1.8, marginBottom: '40px' }}>
          We are working hard on our 3D Visualization feature. Stay tuned!
        </p>
        <button onClick={() => setPage('home')} style={{ padding: '14px 36px', borderRadius: '9999px', backgroundColor: 'black', color: 'white', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
          Go Back Home
        </button>
      </div>
    </div>
  );
}

export function buildMenuItems({ setPage, setMenuOpen, handleStartNow, scrollTo }) {
  return [
    { label: 'Home',             action: () => { setPage('home'); setMenuOpen(false); } },
    { label: 'Get Started',      action: handleStartNow },
    { label: '3D Visualization', action: () => { setPage('3d'); setMenuOpen(false); } },
    { label: 'Transformations',  action: () => { setPage('transformations'); setMenuOpen(false); } },
    { label: 'Gallery',          action: () => { setPage('home'); scrollTo('gallery'); } },
    { label: 'About',            action: () => { setPage('home'); scrollTo('about'); } },
    { label: 'Support',          action: () => { setPage('home'); scrollTo('support'); } },
  ];
}

export function buildSearchTargets({ setPage, setMenuOpen, handleStartNow, scrollTo }) {
  return [
    { keywords: ['home', 'start', 'hero', 'top'], label: 'Home', action: () => { setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { keywords: ['get started', 'order', 'submit', 'upload', 'form', 'buy', 'pay', 'payment', 'visuali', 'rim size', 'request'], label: 'Get Started', action: () => { setPage('home'); handleStartNow(); } },
    { keywords: ['3d', 'three', 'coming soon', '3d visual'], label: '3D Visualization', action: () => { setPage('3d'); setMenuOpen(false); } },
    { keywords: ['before', 'after', 'transformation', 'results', 'compare', 'showcase', 'examples'], label: 'Transformations', action: () => { setPage('transformations'); setMenuOpen(false); } },
    { keywords: ['gallery', 'showcase', 'photos', 'images', 'examples', 'cars', 'wheels'], label: 'Gallery', action: () => { setPage('home'); setTimeout(() => scrollTo('gallery'), 100); } },
    { keywords: ['about', 'rimviz', 'who', 'company', 'south african', 'turnaround', '24h', 'nationwide'], label: 'About', action: () => { setPage('home'); setTimeout(() => scrollTo('about'), 100); } },
    { keywords: ['terms', 'conditions', 'privacy', 'policy', 'refund', 'legal'], label: 'Terms & Conditions', action: () => { setPage('terms'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { keywords: ['support', 'help', 'faq', 'question', 'contact', 'email', 'how', 'format', 'jpg', 'png', 'price', 'cost', 'r49', '49.99', 'hours', 'delivery', 'work'], label: 'Support', action: () => { setPage('home'); setTimeout(() => scrollTo('support'), 100); } },
  ];
}
