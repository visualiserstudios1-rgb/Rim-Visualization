import { useEffect, useState } from 'react';
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
  position: fixed; inset: 0; z-index: 1000; display: flex; padding: 24px; overflow-y: auto;
  background: rgba(255,255,255,0.92); -webkit-backdrop-filter: blur(22px); backdrop-filter: blur(22px);
  animation: pl-fade .35s ease both;
}
.pl-card { width: 100%; max-width: 400px; margin: auto; text-align: center; }
.pl-brand { font-size: 15px; font-weight: 400; letter-spacing: -0.3px; color: #111; margin: 0 0 44px; }
.pl-title { font-size: 40px; font-weight: 300; letter-spacing: -1.5px; line-height: 1.1; color: #000; margin: 0 0 14px; }
.pl-title b { font-weight: 700; }
.pl-stage { font-size: 16px; color: #6b7280; margin: 0 0 36px; min-height: 24px; animation: pl-rise .5s ease both; }
.pl-track { position: relative; height: 2px; border-radius: 2px; background: #e5e7eb; overflow: hidden; }
.pl-fill { position: relative; height: 100%; background: #000; border-radius: 2px; overflow: hidden; transition: width 2.6s cubic-bezier(0.22, 1, 0.36, 1); }
.pl-fill::after {
  content: ''; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
  animation: pl-sheen 1.7s ease-in-out infinite;
}
.pl-meta { display: flex; justify-content: space-between; margin: 12px 0 0; font-size: 12px; color: #9ca3af; font-variant-numeric: tabular-nums; }

.pl-summary { margin: 32px 0 0; padding: 14px; border: 1px solid #eceef1; border-radius: 18px; background: #fff; display: flex; align-items: center; gap: 14px; text-align: left; }
.pl-thumbs { display: flex; gap: 8px; flex-shrink: 0; }
.pl-thumb { position: relative; width: 52px; height: 52px; border-radius: 12px; overflow: hidden; }
.pl-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; animation: pl-reveal .6s ease both; }
.pl-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.pl-price { flex-shrink: 0; min-width: 64px; display: flex; justify-content: flex-end; }
.pl-line { height: 12px; border-radius: 6px; }
.pl-line.l1 { width: 112px; height: 13px; }
.pl-line.l2 { width: 72px; height: 10px; }
.pl-line.l3 { width: 58px; height: 20px; border-radius: 7px; }
.pl-sk {
  background: linear-gradient(90deg, #f1f2f4 25%, #e5e7ea 37%, #f1f2f4 63%);
  background-size: 400% 100%; animation: pl-shimmer 1.5s ease infinite;
}
.pl-name { font-size: 15px; font-weight: 600; color: #111; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; animation: pl-rise .5s ease both; }
.pl-sub { font-size: 13px; color: #9ca3af; margin: 0; animation: pl-rise .5s ease both; }
.pl-amount { font-size: 20px; font-weight: 700; color: #000; letter-spacing: -0.5px; animation: pl-rise .5s ease both; }

.pl-note { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 32px 0 0; font-size: 12px; color: #9ca3af; }

@keyframes pl-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pl-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pl-reveal { from { opacity: 0; transform: scale(1.08); } to { opacity: 1; transform: scale(1); } }
@keyframes pl-sheen { to { transform: translateX(100%); } }
@keyframes pl-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
@media (max-width: 520px) {
  .pl-brand { margin-bottom: 28px; }
  .pl-title { font-size: 30px; }
  .pl-stage { margin-bottom: 28px; }
  .pl-summary { margin-top: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-overlay, .pl-stage, .pl-thumb img, .pl-name, .pl-sub, .pl-amount { animation: none; }
  .pl-fill { transition: none; }
  .pl-fill::after { animation: none; display: none; }
  .pl-sk { animation: none; }
}
`;

function useObjectUrl(file, active) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!active || !file) { setUrl(''); return undefined; }
    const created = URL.createObjectURL(file);
    setUrl(created);
    return () => URL.revokeObjectURL(created);
  }, [file, active]);
  return url;
}

export default function PaymentLoader({ open, stage, packageName, price, rimSize, rimFile, carFile }) {
  const rimUrl = useObjectUrl(rimFile, open);
  const carUrl = useObjectUrl(carFile, open);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open) return null;
  const index = Math.min(Math.max(stage, 0), STAGES.length - 1);

  const rimReady     = index >= 1 && rimUrl;
  const carReady     = index >= 2 && carUrl;
  const detailsReady = index >= 2;
  const priceReady   = index >= 3;

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

        <div className="pl-summary" aria-hidden="true">
          <div className="pl-thumbs">
            <div className={`pl-thumb${rimReady ? '' : ' pl-sk'}`}>{rimReady && <img src={rimUrl} alt="" />}</div>
            <div className={`pl-thumb${carReady ? '' : ' pl-sk'}`}>{carReady && <img src={carUrl} alt="" />}</div>
          </div>
          <div className="pl-info">
            {detailsReady ? (
              <>
                <p className="pl-name">{packageName} package</p>
                <p className="pl-sub">{rimSize ? `${rimSize} inch rims` : 'Rim visualisation'}</p>
              </>
            ) : (
              <>
                <div className="pl-line l1 pl-sk" />
                <div className="pl-line l2 pl-sk" />
              </>
            )}
          </div>
          <div className="pl-price">
            {priceReady ? <span className="pl-amount">R{price}</span> : <div className="pl-line l3 pl-sk" />}
          </div>
        </div>

        <p className="pl-note"><IconLock size={12} color="#9ca3af" /> Please keep this page open</p>
      </div>
    </div>
  );
}
