import {useEffect, useRef, useState} from 'react';
import {clamp} from '../lib/motion';

export function useScrollProgress(target: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    let frame = 0;

    const readProgress = () => {
      const node = target.current;
      if (!node) return progressRef.current;
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const travelled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      return total <= 0 ? 0 : clamp(travelled / total);
    };

    const update = () => {
      const next = readProgress();
      progressRef.current = next;
      setProgress(next);
    };

    const schedule = () => {
      // Update ref synchronously so any co-registered scroll listeners
      // (e.g. SequenceCanvas) can read the latest progress immediately,
      // regardless of RAF execution order.
      progressRef.current = readProgress();
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

  return {progress, progressRef};
}
