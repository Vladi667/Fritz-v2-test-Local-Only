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

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    context.save();
    context.fillStyle = '#05070b';
    context.fillRect(0, 0, width, height);
    context.restore();

    const {drawWidth, drawHeight, offsetX, offsetY} = getContainDrawRect(
      image.naturalWidth,
      image.naturalHeight,
      width,
      height,
      0.7,
    );

    // Outside-only blur halo that helps the rectangular frame melt into the page background.
    context.save();
    context.filter = 'blur(32px) brightness(0.92) saturate(0.9)';
    context.globalAlpha = 0.5;
    context.drawImage(image, offsetX - 22, offsetY - 22, drawWidth + 44, drawHeight + 44);

    // Cut the center back out so the blur only remains outside the image boundary.
    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = '#000';
    context.fillRect(offsetX + 2, offsetY + 2, drawWidth - 4, drawHeight - 4);
    context.restore();

    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.18)';
    context.shadowBlur = 14;
    context.shadowOffsetY = 4;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.filter = 'brightness(1.05) contrast(1.03) saturate(1.02)';
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
