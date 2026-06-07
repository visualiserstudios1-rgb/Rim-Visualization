// src/pages/TransformationsPage.js

import { NavBar, DropdownMenu, SearchBar } from '../components/NavBar';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { buildMenuItems, buildSearchTargets } from './ThreeDPage';

const PAIRS = [
  { before: 'https://i.imgur.com/rQ33C2j.jpeg', after: 'https://i.imgur.com/uqinPfy.png',  car: 'Toyota Corolla Quest', rim: '16" Chrome' },
  { before: 'https://i.imgur.com/FHTJy5t.jpeg', after: 'https://i.imgur.com/f2jT8fm.png',  car: 'Toyota Auris',         rim: '16" Chrome' },
  { before: 'https://i.imgur.com/aXUEiWb.jpeg', after: 'https://i.imgur.com/Irra7Am.png',  car: 'Volkswagen Golf',      rim: '17" BBS BLK Face' },
  { before: 'https://i.imgur.com/wGvD3qM.jpeg', after: 'https://i.imgur.com/IkjvnGX.png',  car: 'Suzuki Ertiga',        rim: '16" White Steel' },
];

export function TransformationsPage({ isMobile, isTablet, page, setPage, menuOpen, setMenuOpen, searchOpen, setSearchOpen, searchText, setSearchText, scrollTo, goToForm, handleStartNow }) {
  const bodyFontSize   = isMobile ? '15px' : isTablet ? '16px' : '18px';
  const sectionPadding = isMobile ? '40px 16px' : isTablet ? '60px 32px' : '80px 24px';
  const galleryGap     = isMobile ? '16px' : isTablet ? '20px' : '32px';
  const sliderHeight   = isMobile ? '300px' : isTablet ? '360px' : '420px';

  const onSelect = (target) => { target.action(); setSearchOpen(false); setSearchText(''); };
  const menuItems     = buildMenuItems({ setPage, setMenuOpen, handleStartNow, scrollTo });
  const searchTargets = buildSearchTargets({ setPage, setMenuOpen, handleStartNow, scrollTo });

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
      {searchOpen && <SearchBar searchText={searchText} setSearchText={setSearchText} searchTargets={searchTargets} onSelect={onSelect} onClose={() => { setSearchOpen(false); setSearchText(''); }} />}
      <NavBar isMobile={isMobile} onHome={() => { setPage('home'); setMenuOpen(false); }} onSearch={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }} onMenu={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }} />
      {menuOpen && <DropdownMenu isMobile={isMobile} items={menuItems} />}
      {(menuOpen || searchOpen) && <div onClick={() => { setMenuOpen(false); setSearchOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'transparent' }} />}

      <div style={{ paddingTop: '52px' }}>
        <div style={{ backgroundColor: 'black', textAlign: 'center', padding: isMobile ? '48px 20px 36px' : '80px 40px 60px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 14px' }}>Real Results</p>
          <h1 style={{ fontSize: isMobile ? '36px' : '64px', fontWeight: '300', color: 'white', margin: '0', letterSpacing: '-2px', lineHeight: 1.1 }}>
            Rim <span style={{ fontWeight: '700' }}>Transformations</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: bodyFontSize, margin: '16px auto 0', fontWeight: '300', maxWidth: '480px', lineHeight: 1.7 }}>
            Drag the slider to reveal the transformation on every car.
          </p>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: sectionPadding }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: galleryGap }}>
            {PAIRS.map((p, i) => (
              <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.09)', border: '1px solid #ebebeb' }}>
                <BeforeAfterSlider before={p.before} after={p.after} alt={p.car} height={sliderHeight} />
                <div style={{ padding: '16px 20px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '15px', color: '#1d1d1f', margin: '0 0 3px' }}>{p.car}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: '400' }}>{p.rim}</p>
                  </div>
                  <div style={{ width: '1px', height: '28px', backgroundColor: '#e5e7eb' }} />
                  <button onClick={goToForm} style={{ fontSize: '13px', fontWeight: '600', color: 'black', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Order yours
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: isMobile ? '0 20px 60px' : '0 24px 80px' }}>
          <button onClick={goToForm} style={{ width: isMobile ? '100%' : 'auto', padding: '14px 36px', borderRadius: '9999px', backgroundColor: 'black', color: 'white', fontSize: '15px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
            Get Your Visualization
          </button>
          <button onClick={() => setPage('home')} style={{ width: isMobile ? '100%' : 'auto', padding: '14px 36px', borderRadius: '9999px', backgroundColor: 'white', color: 'black', fontSize: '15px', fontWeight: '600', border: '1.5px solid #d1d5db', cursor: 'pointer' }}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
