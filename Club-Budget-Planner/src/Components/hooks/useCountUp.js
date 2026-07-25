import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 -> target once `start` becomes true.
 * Designed to pair with useReveal() so the count-up fires when the
 * element scrolls into view, not on mount.
 *
 * @param {number} target - final value to count up to
 * @param {boolean} start - when true (and hasn't already run), begins the animation
 * @param {number} duration - animation length in ms
 */
export function useCountUp(target, start, duration = 1200) {
  const [value, setValue] = useState(0);
  const hasRunRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!start || hasRunRef.current) return;
    hasRunRef.current = true;

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic — fast start, gentle settle
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start, target, duration]);

  return value;
}