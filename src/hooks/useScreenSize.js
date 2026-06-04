// src/hooks/useScreenSize.js

import { useState, useEffect } from 'react';

export function useScreenSize() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);
  return {
    isMobile: width < 480,
    isTablet: width >= 480 && width < 1024,
    isDesktop: width >= 1024,
  };
}
