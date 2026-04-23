import {useEffect, useMemo, useRef} from 'react';
import {getContainDrawRect, getFrameIndex} from '../lib/motion';

type SequenceCanvasProps = {
  images: HTMLImageElement[];
  progress: number;
  ready: boolean;
};

export function SequenceCanvas({images, progress, ready}: SequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIndex = useMemo(() => getFrameIndex(progress, images.length), [images.length, progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = images[frameIndex];
    if (!canvas || !image || image.naturalWidth === 0 || image.naturalHeight === 0) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.filter = 'brightness(1.08) contrast(1.05)';

    const {drawWidth, drawHeight, offsetX, offsetY} = getContainDrawRect(
      image.naturalWidth,
      image.naturalHeight,
      width,
      height,
      0.92,
    );

    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    context.filter = 'none';
  }, [frameIndex, images]);

  return (
    <div className={`sequence-canvas-shell ${ready ? 'is-ready' : ''}`}>
      <div className="subject-column">
        <div className="subject-aura" aria-hidden="true" />
        <canvas className="sequence-canvas" ref={canvasRef} aria-label="Animated personage sequence" />
      </div>
      {!ready ? <p className="sequence-loading">Preparing the sequence…</p> : null}
    </div>
  );
}
