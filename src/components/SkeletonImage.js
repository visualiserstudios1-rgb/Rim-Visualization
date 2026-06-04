// src/components/SkeletonImage.js

import { useState } from 'react';

export function SkeletonImage({ src, alt, style = {}, dark = false }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: 'relative', width: style.width || '100%', height: style.height || '100%', flexShrink: 0, ...(style.borderRadius ? { borderRadius: style.borderRadius } : {}) }}>
      {!loaded && (
        <div className={dark ? 'skeleton-dark' : 'skeleton'} style={{ position: 'absolute', inset: 0, borderRadius: style.borderRadius || 0 }} />
      )}
      <img src={src} alt={alt} onLoad={() => setLoaded(true)} style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease', display: 'block' }} />
    </div>
  );
}
