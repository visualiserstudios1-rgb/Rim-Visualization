import { useEffect } from 'react';
import { IconLock } from './icons';

const STAGES = [
  'Uploading your rim image',
  'Uploading your car image',
  'Preparing secure payment',
  'Redirecting to PayFast',
];
const WIDTHS = [30, 58, 84, 100];

const css = `
.pl-overlay {
  position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center;
  padding: 24px; background: rgba(255,255,255,0.9); -webkit-backdrop-filter: blur(22px); backdrop-filter: blur(22px);
  animation: pl-fade .35s ease both;
}
.pl-card { width: 100%; max-width: 400px; text-align: center; }
.pl-brand { font-size: 15px; font-weight: 400; letter-spacing: -0.3px; color: #111; margin: 0 0 56px; }
.pl-title { font-size: 40px; font-weight: 300; letter-spacing: -1.5px; line-height: 1.1; color: #000; margin: 0 0 14px; }
.pl-title b { font-weight: 700; }
.pl-stage { font-size: 16px; color: #6b7280; margin: 0 0 40px; min-height: 24px; animation: pl-rise .5s ease both; }
.pl-track { position: relative; height: 2px; border-radius: 2px; background: #e5e7eb; overflow: hidden; }
.pl-fill { position: relative; height: 100%; background: #000; border-radius: 2px; overflow: hidden; transition: width 2.6s cubic-bezier(0.22, 1, 0.36, 1); }
.pl-fill::after {
  content: ''; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
  animation: pl-sheen 1.7s ease-in-out infinite;
}
.pl-meta { display: flex; justify-content: space-between; margin: 12px 0 0; font-size: 12px; color: #9ca3af; font-variant-numeric: tabular-nums; }
.pl-note { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 44px 0 0; font-size: 12px; color: #9ca3af; }
@keyframes pl-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pl-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pl-sheen { to { transform: translateX(100%); } }
@media (max-width: 520px) { .pl-title { font-size: 32px; } }
@media (prefers-reduced-motion: reduce) {
  .pl-overlay, .pl-stage { animation: none; }
  .pl-fill { transition: none; }
  .pl-fill::after { animation: none; display: none; }
}
`;

export default function PaymentLoader({ open, stage }) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open) return null;
  const index = Math.min(Math.max(stage, 0), STAGES.length - 1);

  return (
    <div className="pl-overlay" role="status" aria-live="polite" aria-busy="true">
      <style>{css}</style>
      <div className="pl-card">
        <p className="pl-brand">Rim Visualizer</p>
        <h2 className="pl-title">Preparing<br />your <b>order</b></h2>
        <p className="pl-stage" key={index}>{STAGES[index]}</p>
        <div className="pl-track">
          <div className="pl-fill" style={{ width: `${WIDTHS[index]}%` }} />
        </div>
        <div className="pl-meta">
          <span>Step {index + 1} of {STAGES.length}</span>
          <span>{WIDTHS[index]}%</span>
        </div>
        <p className="pl-note"><IconLock size={12} color="#9ca3af" /> Please keep this page open</p>
      </div>
    </div>
  );
}
