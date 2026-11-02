import React, { useState } from 'react';

export const PACKAGES = [
  {
    id: 1, name: 'Starter', price: '24.99', visuals: 1, mods: 1, tag: null,
    summary: 'Try one look on your car.',
    details: [
      '1 visualisation: a realistic image of your car fitted with your chosen rims.',
      '1 free modification: after you see your result, ask for one adjustment to it.',
      'Delivered to the email address you provide.',
    ],
    bestFor: 'Best if you already know the rim you want and just need to see it on your car.',
  },
  {
    id: 2, name: 'Standard', price: '49.99', visuals: 3, mods: 1, tag: 'Most popular',
    summary: 'Compare a few options side by side.',
    details: [
      '3 visualisations: see your car with up to 3 different rim options or angles.',
      '1 free modification: one adjustment to your favourite result.',
      'Delivered to the email address you provide.',
    ],
    bestFor: 'Best if you are choosing between a few rims and want to compare before buying.',
  },
  {
    id: 3, name: 'Pro', price: '129.99', visuals: 10, mods: 5, tag: 'Best value',
    summary: 'Explore everything, with room to refine.',
    details: [
      '10 visualisations: try many rim designs, angles or setups on your car.',
      '5 free modifications: refine your favourites until they look right.',
      'Delivered to the email address you provide.',
      'Lowest price per visualisation of all three packages.',
    ],
    bestFor: 'Best for enthusiasts, workshops or anyone who wants to explore many ideas.',
  },
];

const css = `
.pkg-wrap { margin: 8px 0 24px; }
.pkg-label { font-size: 15px; font-weight: 500; color: #374151; margin-bottom: 10px; display: block; }
.pkg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; align-items: start; }
.pkg-card {
  position: relative; background: #fff; border: 1.5px solid #e5e7eb; border-radius: 16px;
  transition: border-color .15s, box-shadow .15s;
}
.pkg-card:hover { border-color: #9ca3af; }
.pkg-card.active { border-color: #000; box-shadow: 0 0 0 1px #000; }
.pkg-select {
  all: unset; box-sizing: border-box; display: block; width: 100%; cursor: pointer;
  padding: 20px 16px 12px; text-align: left; font-family: inherit;
}
.pkg-select:focus-visible { outline: 2px solid #000; outline-offset: 2px; border-radius: 14px; }
.pkg-tag {
  position: absolute; top: -10px; left: 16px; background: #000; color: #fff;
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px;
}
.pkg-name { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
.pkg-price { font-size: 28px; font-weight: 700; color: #111; margin: 8px 0 4px; }
.pkg-summary { font-size: 13px; color: #6b7280; margin: 0 0 12px; }
.pkg-line { font-size: 14px; color: #374151; margin: 4px 0; }
.pkg-check {
  position: absolute; top: 14px; right: 14px; width: 20px; height: 20px; border-radius: 50%;
  border: 1.5px solid #d1d5db; display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: #fff; pointer-events: none;
}
.pkg-card.active .pkg-check { background: #000; border-color: #000; }
.pkg-toggle {
  all: unset; box-sizing: border-box; cursor: pointer; width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-top: 1px solid #f0f0f0; font-family: inherit;
  font-size: 13px; font-weight: 600; color: #111;
}
.pkg-toggle:focus-visible { outline: 2px solid #000; outline-offset: -2px; border-radius: 0 0 14px 14px; }
.pkg-chevron { transition: transform .2s; font-size: 12px; }
.pkg-toggle[aria-expanded="true"] .pkg-chevron { transform: rotate(180deg); }
.pkg-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .25s ease; }
.pkg-panel.open { grid-template-rows: 1fr; }
.pkg-panel > div { overflow: hidden; }
.pkg-panel-inner { padding: 0 16px 16px; }
.pkg-list { margin: 0 0 10px; padding-left: 18px; font-size: 13px; color: #374151; line-height: 1.55; }
.pkg-list li { margin-bottom: 6px; }
.pkg-best { font-size: 12.5px; color: #6b7280; background: #f9fafb; border-radius: 10px; padding: 10px 12px; margin: 0; }
@media (max-width: 640px) { .pkg-grid { grid-template-columns: 1fr; gap: 18px; } }
@media (prefers-reduced-motion: reduce) { .pkg-panel, .pkg-chevron { transition: none; } }
`;

export default function PackageSelector({ selected, onSelect }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="pkg-wrap">
      <style>{css}</style>
      <span className="pkg-label">Choose Your Package *</span>
      <div className="pkg-grid" role="radiogroup" aria-label="Package">
        {PACKAGES.map((p) => {
          const active = selected === p.id;
          const open = openId === p.id;
          return (
            <div key={p.id} className={`pkg-card${active ? ' active' : ''}`}>
              {p.tag && <span className="pkg-tag">{p.tag}</span>}
              <span className="pkg-check">{active ? '✓' : ''}</span>

              <button
                type="button"
                role="radio"
                aria-checked={active}
                className="pkg-select"
                onClick={() => onSelect(p.id)}
              >
                <div className="pkg-name">{p.name}</div>
                <div className="pkg-price">R{p.price}</div>
                <p className="pkg-summary">{p.summary}</p>
                <div className="pkg-line">{p.visuals} {p.visuals === 1 ? 'Visualisation' : 'Visualisations'}</div>
                <div className="pkg-line">{p.mods} free {p.mods === 1 ? 'modification' : 'modifications'}</div>
              </button>

              <button
                type="button"
                className="pkg-toggle"
                aria-expanded={open}
                aria-controls={`pkg-panel-${p.id}`}
                onClick={() => setOpenId(open ? null : p.id)}
              >
                <span>What's included</span>
                <span className="pkg-chevron" aria-hidden="true">▼</span>
              </button>

              <div id={`pkg-panel-${p.id}`} className={`pkg-panel${open ? ' open' : ''}`}>
                <div>
                  <div className="pkg-panel-inner">
                    <ul className="pkg-list">
                      {p.details.map((d) => <li key={d}>{d}</li>)}
                    </ul>
                    <p className="pkg-best">{p.bestFor}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
