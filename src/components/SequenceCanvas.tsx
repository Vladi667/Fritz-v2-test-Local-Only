import {useEffect, useMemo, useRef} from 'react';
import {getContainDrawRect, getCoverDrawRect, getFrameIndex} from '../lib/motion';

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

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const backgroundRect = getCoverDrawRect(image.naturalWidth, image.naturalHeight, width, height);
    context.save();
    context.filter = 'blur(22px) brightness(0.28) saturate(0.75)';
    context.drawImage(
      image,
      backgroundRect.offsetX - 24,
      backgroundRect.offsetY - 24,
      backgroundRect.drawWidth + 48,
      backgroundRect.drawHeight + 48,
    );
    context.restore();

    context.save();
    context.fillStyle = 'rgba(6, 9, 13, 0.42)';
    context.fillRect(0, 0, width, height);
    context.restore();

    const {drawWidth, drawHeight, offsetX, offsetY} = getContainDrawRect(
      image.naturalWidth,
      image.naturalHeight,
      width,
      height,
      0.74,
    );

    context.save();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.shadowColor = 'rgba(0, 0, 0, 0.38)';
    context.shadowBlur = 38;
    context.shadowOffsetY = 16;
    context.filter = 'brightness(1.06) contrast(1.04) saturate(1.02)';
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    context.restore();
  }, [frameIndex, images]);

  return (
    <div className={`sequence-canvas-shell ${ready ? 'is-ready' : ''}`}>
      <canvas className="sequence-canvas" ref={canvasRef} aria-label="Animated personage sequence" />
      {!ready ? <p className="sequence-loading">Preparing the sequence…</p> : null}
    </div>
  );
}
