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
    context.fillStyle = '#000000';
    context.fillRect(0, 0, width, height);
    context.restore();

    const {drawWidth, drawHeight, offsetX, offsetY} = getContainDrawRect(
      image.naturalWidth,
      image.naturalHeight,
      width,
      height,
      0.7,
    );

    // Soft blurred integration layer that gets denser near the center image.
    context.save();
    context.filter = 'blur(26px) brightness(1.02)';
    context.globalAlpha = 0.42;
    context.drawImage(image, offsetX - 12, offsetY - 12, drawWidth + 24, drawHeight + 24);
    const centerFade = context.createRadialGradient(
      width * 0.5,
      height * 0.52,
      Math.min(width, height) * 0.12,
      width * 0.5,
      height * 0.52,
      Math.min(width, height) * 0.44,
    );
    centerFade.addColorStop(0, 'rgba(255,255,255,0.9)');
    centerFade.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    centerFade.addColorStop(0.75, 'rgba(255,255,255,0.12)');
    centerFade.addColorStop(1, 'rgba(255,255,255,0)');
    context.globalCompositeOperation = 'destination-in';
    context.fillStyle = centerFade;
    context.fillRect(0, 0, width, height);
    context.restore();

    context.save();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.shadowColor = 'rgba(0, 0, 0, 0.22)';
    context.shadowBlur = 18;
    context.shadowOffsetY = 6;
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
