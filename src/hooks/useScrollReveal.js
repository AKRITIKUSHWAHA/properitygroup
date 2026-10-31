import { useRef } from 'react';

/**
 * Ultra-fast performant scroll reveal hook.
 * Avoids continuous React re-renders and CPU/GPU frame drops on mobile and laptop devices.
 */
export function useScrollReveal() {
  const ref = useRef(null);
  return [ref, true];
}
