import { useState, useRef, useEffect } from 'react';

const SIZES = ['17', '18', '19', '20', '21', '22', '23'];

const css = `
.rsd { position: relative; }
.rsd-btn {
  all: unset; box-sizing: border-box; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer;
  font-size: 16px; color: #111; font-family: inherit; transition: border-color .15s, box-shadow .15s;
}
.rsd-btn:hover { border-color: #9ca3af; }
.rsd-btn:focus-visible, .rsd-btn[aria-expanded="true"] { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,0.08); }
.rsd-placeholder { color: #9ca3af; }
.rsd-chevron { flex-shrink: 0; transition: transform .2s ease; }
.rsd-btn[aria-expanded="true"] .rsd-chevron { transform: rotate(180deg); }
.rsd-panel {
  position: absolute; left: 0; right: 0; z-index: 30; margin: 0; padding: 6px; list-style: none;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; max-height: 340px; overflow-y: auto;
  box-shadow: 0 18px 44px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.05);
  top: calc(100% + 8px); transform-origin: top; animation: rsd-pop .16s ease both;
}
.rsd-panel.up { top: auto; bottom: calc(100% + 8px); transform-origin: bottom; }
.rsd-opt {
  display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 10px;
  font-size: 15px; color: #111; cursor: pointer;
}
.rsd-opt.active { background: #f3f4f6; }
.rsd-opt.selected { font-weight: 600; }
.rsd-opt small { font-size: 13px; color: #9ca3af; font-weight: 400; margin-left: 8px; }
@keyframes rsd-pop { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (prefers-reduced-motion: reduce) { .rsd-panel { animation: none; } .rsd-chevron, .rsd-btn { transition: none; } }
`;

export default function RimSizeSelect({ value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const wrapRef = useRef(null);
  const btnRef  = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = document.getElementById(`rsd-opt-${active}`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const openList = () => {
    const rect = btnRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - rect.bottom < 360 && rect.top > 360);
    setActive(Math.max(0, SIZES.indexOf(value)));
    setOpen(true);
  };

  const choose = (size) => {
    onChange(size);
    setOpen(false);
    if (btnRef.current) btnRef.current.focus();
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, SIZES.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(SIZES.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(SIZES[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'Tab') { setOpen(false); }
  };

  return (
    <div className="rsd" ref={wrapRef}>
      <style>{css}</style>
      <button
        type="button"
        ref={btnRef}
        className="rsd-btn"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="rsd-listbox"
        aria-activedescendant={open ? `rsd-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={value ? '' : 'rsd-placeholder'}>{value ? `${value} inches` : 'Select rim size'}</span>
        <svg className="rsd-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul id="rsd-listbox" role="listbox" aria-label="Desired rim size" className={`rsd-panel${dropUp ? ' up' : ''}`}>
          {SIZES.map((size, i) => (
            <li
              key={size}
              id={`rsd-opt-${i}`}
              role="option"
              aria-selected={value === size}
              className={`rsd-opt${i === active ? ' active' : ''}${value === size ? ' selected' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(size)}
            >
              <span>{size} inches</span>
              {value === size && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
