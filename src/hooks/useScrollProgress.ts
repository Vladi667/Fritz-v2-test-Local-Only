import {useEffect, useRef, useState} from 'react';
import {clamp} from '../lib/motion';

const DEAD_BAND = 0.0005;

export function useScrollProgress(target: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const node = target.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const travelled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const next = total <= 0 ? 0 : clamp(travelled / total);

      if (Math.abs(next - lastProgressRef.current) < DEAD_BAND) return;
      lastProgressRef.current = next;
      setProgress(next);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [target]);

  return progress;
}
