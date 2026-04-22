import {useEffect, useMemo, useState} from 'react';
import {buildFramePaths} from '../lib/motion';

export function useImageSequence() {
  const paths = useMemo(() => buildFramePaths(), []);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all(
      paths.map(
        (path) =>
          new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            img.src = path;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
          }),
      ),
    ).then((loaded) => {
      if (!active) {
        return;
      }

      setImages(loaded);
      setIsReady(true);
    });

    return () => {
      active = false;
    };
  }, [paths]);

  return {images, isReady};
}
