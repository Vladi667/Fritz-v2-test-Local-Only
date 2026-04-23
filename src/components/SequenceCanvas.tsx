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
    context.filter = 'blur(34px) brightness(0.32) saturate(0.8)';
    context.drawImage(
      image,
      backgroundRect.offsetX - 56,
      backgroundRect.offsetY - 56,
      backgroundRect.drawWidth + 112,
      backgroundRect.drawHeight + 112,
    );
    context.restore();

    context.save();
    context.fillStyle = 'rgba(6, 9, 13, 0.36)';
    context.fillRect(0, 0, width, height);
    context.restore();

    // Ease the background filter near the subject so the sharp center image feels embedded.
    context.save();
    context.drawImage(
      image,
      backgroundRect.offsetX,
      backgroundRect.offsetY,
      backgroundRect.drawWidth,
      backgroundRect.drawHeight,
    );
    const subjectReveal = context.createRadialGradient(
      width * 0.5,
      height * 0.52,
      Math.min(width, height) * 0.09,
      width * 0.5,
      height * 0.52,
      Math.min(width, height) * 0.5,
    );
    subjectReveal.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
    subjectReveal.addColorStop(0.42, 'rgba(255, 255, 255, 0.38)');
    subjectReveal.addColorStop(0.78, 'rgba(255, 255, 255, 0.08)');
    subjectReveal.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.globalCompositeOperation = 'destination-in';
    context.fillStyle = subjectReveal;
    context.fillRect(0, 0, width, height);
    context.restore();

    context.save();
    const outerVeil = context.createRadialGradient(
      width * 0.5,
      height * 0.52,
      Math.min(width, height) * 0.16,
      width * 0.5,
      height * 0.52,
      Math.min(width, height) * 0.72,
    );
    outerVeil.addColorStop(0, 'rgba(6, 9, 13, 0)');
    outerVeil.addColorStop(0.5, 'rgba(6, 9, 13, 0.1)');
    outerVeil.addColorStop(1, 'rgba(6, 9, 13, 0.42)');
    context.fillStyle = outerVeil;
    context.fillRect(0, 0, width, height);
    context.restore();

    const {drawWidth, drawHeight, offsetX, offsetY} = getContainDrawRect(
      image.naturalWidth,
      image.naturalHeight,
      width,
      height,
      0.7,
    );

    context.save();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.shadowColor = 'rgba(0, 0, 0, 0.3)';
    context.shadowBlur = 28;
    context.shadowOffsetY = 10;
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
