// src/components/BeforeAfterSlider.js

import { useState, useEffect, useCallback, useRef } from 'react';

export function BeforeAfterSlider({ before, after, alt, height }) {
  const [pos, setPos]                   = useState(50);
  const [dragging, setDragging]         = useState(false);
  const [beforeLoaded, setBeforeLoaded] = useState(false);
  const [afterLoaded, setAfterLoaded]   = useState(false);
  const [hinted, setHinted]             = useState(false);
  const containerRef                    = useRef(null);
  const bothLoaded                      = beforeLoaded && afterLoaded;

  useEffect(() => {
    if (!bothLoaded || hinted) return;
    let frame;
    let start = null;
    const duration = 700;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setPos(50 - eased * 15);
      if (p < 1) { frame = requestAnimationFrame(animate); }
      else { setPos(50); setHinted(true); }
    };
    const timer = setTimeout(() => { frame = requestAnimationFrame(animate); }, 600);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [bothLoaded, hinted]);

  const getPercent = useCallback((clientX) => {
    if (!containerRef.current) return 50;
    const rect = containerRef.current.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onMouseDown  = (e) => { e.preventDefault(); setDragging(true); };
  const onMouseMove  = useCallback((e) => { if (dragging) setPos(getPercent(e.clientX)); }, [dragging, getPercent]);
  const onMouseUp    = useCallback(() => setDragging(false), []);
  const onTouchStart = (e) => { e.preventDefault(); setDragging(true); };
  const onTouchMove  = useCallback((e) => { if (dragging) setPos(getPercent(e.touches[0].clientX)); }, [dragging, getPercent]);
  const onTouchEnd   = useCallback(() => setDragging(false), []);

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ position: 'relative', width: '100%', height, overflow: 'hidden', cursor: dragging ? 'grabbing' : 'ew-resize', userSelect: 'none', touchAction: 'none', WebkitUserSelect: 'none' }}
    >
      {!bothLoaded && <div className="skeleton" style={{ position: 'absolute', inset: 0, zIndex: 3 }} />}

      <img src={before} alt={`${alt} before`} onLoad={() => setBeforeLoaded(true)} draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: bothLoaded ? 1 : 0, display: 'block' }} />

      <div style={{ position: 'absolute', inset: 0, width: `${pos}%`, overflow: 'hidden' }}>
        <img src={after} alt={`${alt} after`} onLoad={() => setAfterLoaded(true)} draggable={false}
          style={{ position: 'absolute', inset: 0, width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%', height: '100%', objectFit: 'cover', opacity: bothLoaded ? 1 : 0, display: 'block', maxWidth: 'none' }} />
      </div>

      {bothLoaded && (
        <>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, transform: 'translateX(-50%)', width: '2px', background: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.5)', zIndex: 4, pointerEvents: 'none' }} />
          <div onMouseDown={onMouseDown} onTouchStart={onTouchStart}
            style={{ position: 'absolute', top: '50%', left: `${pos}%`, transform: 'translate(-50%, -50%)', zIndex: 5, width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 2px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', gap: '3px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
          </div>
          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 4, pointerEvents: 'none', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px' }}>After</div>
          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 4, pointerEvents: 'none', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px' }}>Before</div>
        </>
      )}
    </div>
  );
}
