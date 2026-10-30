import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to trigger entrance animations when elements enter the viewport.
 * Fully respectful of 'prefers-reduced-motion'.
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.12,
    rootMargin = '0px 0px -40px 0px',
    triggerOnce = true
  } = options;

  // On mobile screens (<= 768px), reveal immediately to eliminate React re-renders and touch scroll lag
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches));
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(isMobile);

  useEffect(() => {
    // Respect reduced motion preference or mobile screen performance
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isSmallScreen = window.innerWidth <= 768 || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
      if (prefersReduced || isSmallScreen) {
        setIsRevealed(true);
        return;
      }
    }

    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsRevealed(true);
        if (triggerOnce) {
          observer.unobserve(element);
        }
      } else if (!triggerOnce) {
        setIsRevealed(false);
      }
    }, { threshold, rootMargin });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isRevealed];
}

