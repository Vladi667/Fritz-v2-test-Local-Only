import {useEffect, useMemo, useState} from 'react';
import {buildFramePaths} from '../lib/motion';

const CRITICAL_COUNT = 24;
const BATCH_SIZE = 30;

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
  });
}

function loadBatch(paths: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(paths.map(loadImage));
}

export function useImageSequence() {
  const paths = useMemo(() => buildFramePaths(), []);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    // Pass 1: load critical first frames so avatar appears immediately
    loadBatch(paths.slice(0, CRITICAL_COUNT)).then((critical) => {
      if (!active) return;
      setImages(critical);
      setIsReady(true);

      // Pass 2: load remaining frames in background batches
      let offset = CRITICAL_COUNT;

      function loadNext() {
        if (!active || offset >= paths.length) return;
        const batch = paths.slice(offset, offset + BATCH_SIZE);
        offset += BATCH_SIZE;
        loadBatch(batch).then((loaded) => {
          if (!active) return;
          setImages((prev) => [...prev, ...loaded]);
          setTimeout(loadNext, 0);
        });
      }

      setTimeout(loadNext, 0);
    });

    return () => {
      active = false;
    };
  }, [paths]);

  return {images, isReady};
}
