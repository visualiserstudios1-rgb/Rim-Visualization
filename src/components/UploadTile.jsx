import { useState, useEffect } from 'react';

const css = `
.ut-tile {
  position: relative; display: flex; align-items: center; gap: 16px; width: 100%; box-sizing: border-box;
  padding: 16px 18px; border: 1.5px dashed #d1d5db; border-radius: 16px; background: #fff; cursor: pointer;
  transition: border-color .2s, background .2s, box-shadow .2s;
}
.ut-tile:hover { border-color: #111; background: #fafafa; }
.ut-tile:focus-within { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,0.08); }
.ut-tile.drag { border-color: #111; background: #f3f4f6; }
.ut-tile.filled { border-style: solid; border-color: #e5e7eb; }
.ut-tile input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.ut-icon { width: 48px; height: 48px; border-radius: 14px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ut-thumb { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; flex-shrink: 0; background: #f3f4f6; animation: ut-in .35s ease both; }
.ut-text { min-width: 0; flex: 1; }
.ut-title { font-size: 15px; font-weight: 500; color: #111; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ut-sub { font-size: 13px; color: #9ca3af; margin: 3px 0 0; }
.ut-action { font-size: 14px; font-weight: 600; color: #111; flex-shrink: 0; }
@keyframes ut-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .ut-thumb { animation: none; } .ut-tile { transition: none; } }
`;

const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export default function UploadTile({ file, onChange, id }) {
  const [preview, setPreview] = useState('');
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(''); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const dropped = e.dataTransfer.files && e.dataTransfer.files[0];
    if (dropped) onChange(dropped);
  };

  return (
    <label
      className={`ut-tile${file ? ' filled' : ''}${drag ? ' drag' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
    >
      <style>{css}</style>
      <input id={id} type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => onChange(e.target.files[0] || null)} />
      {file ? (
        <>
          <img className="ut-thumb" src={preview} alt="" />
          <div className="ut-text">
            <p className="ut-title">{file.name}</p>
            <p className="ut-sub">{formatSize(file.size)}</p>
          </div>
          <span className="ut-action">Change</span>
        </>
      ) : (
        <>
          <span className="ut-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
          </span>
          <div className="ut-text">
            <p className="ut-title">Choose a photo or drop it here</p>
            <p className="ut-sub">JPG or PNG, up to 35MB</p>
          </div>
        </>
      )}
    </label>
  );
}
