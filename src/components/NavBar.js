// src/components/NavBar.js

import { useState } from 'react';
import { IconSearch, IconMenu, IconChevronRight } from './icons';

const skeletonCSS = `
  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #e8e8e8 25%, #f2f2f2 50%, #e8e8e8 75%);
    background-size: 700px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 4px;
  }
  .skeleton-dark {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 700px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 4px;
  }
`;

export function SkeletonStyles() {
  return <style>{skeletonCSS}</style>;
}

export function NavBar({ isMobile, onHome, onSearch, onMenu, searchOpen, menuOpen }) {
  return (
    <nav style={{ position: 'fixed', width: '100%', zIndex: 100, top: 0, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #d2d2d7', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onHome} style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '300', color: '#1d1d1f', cursor: 'pointer', letterSpacing: '-0.5px' }}>RimViz</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <IconSearch size={18} color="#1d1d1f" />
          </button>
          <button onClick={onMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <IconMenu size={18} color="#1d1d1f" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export function DropdownMenu({ isMobile, items }) {
  return (
    <div style={{ position: 'fixed', top: '52px', left: 0, right: 0, zIndex: 150, backgroundColor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e0e0e0', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: '8px 0 16px 0' }}>
      {items.map((item, i) => (
        <button key={i} onClick={item.action}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '13px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? '15px' : '17px', color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}
          onMouseEnter={e => e.target.style.background = '#f5f5f7'}
          onMouseLeave={e => e.target.style.background = 'none'}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBar({ searchText, setSearchText, searchTargets, onSelect, onClose }) {
  const getResults = (text) => {
    if (!text.trim()) return [];
    const lower = text.toLowerCase();
    return searchTargets.filter(t => t.keywords.some(k => k.includes(lower) || lower.includes(k)));
  };
  const results = getResults(searchText);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200 }}>
      <div style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <IconSearch size={18} color="#333" />
        <input autoFocus type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && results.length > 0) onSelect(results[0]); if (e.key === 'Escape') onClose(); }}
          placeholder="Search rimviz.com"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '17px', background: 'transparent', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }} />
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '15px', color: '#0071e3', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
      </div>
      {searchText.trim() && (
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          {results.length > 0 ? results.map((r, i) => (
            <button key={i} onClick={() => onSelect(r)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '14px 24px', background: 'none', border: 'none', borderBottom: i < results.length - 1 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer', fontSize: '16px', color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f7'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <IconChevronRight size={16} color="#9ca3af" />
              {r.label}
            </button>
          )) : (
            <div style={{ padding: '16px 24px', color: '#9ca3af', fontSize: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>No results for "{searchText}"</div>
          )}
        </div>
      )}
    </div>
  );
}
