import {useEffect, useMemo, useRef} from 'react';
import {keyConnectedNearBlackPixels} from '../lib/backgroundKeying';
import {getContainDrawRect, getFrameIndex} from '../lib/motion';

type SequenceCanvasProps = {
  images: HTMLImageElement[];
  progress: number;
  ready: boolean;
  subjectScale?: number;
};

function createKeyedFrameCanvas(image: HTMLImageElement, width: number, height: number) {
  const keyedCanvas = document.createElement('canvas');
  keyedCanvas.width = Math.max(1, Math.round(width));
  keyedCanvas.height = Math.max(1, Math.round(height));

  const keyedContext = keyedCanvas.getContext('2d', {willReadFrequently: true});
  if (!keyedContext) {
    return keyedCanvas;
  }

  keyedContext.drawImage(image, 0, 0, keyedCanvas.width, keyedCanvas.height);
  const imageData = keyedContext.getImageData(0, 0, keyedCanvas.width, keyedCanvas.height);
  keyConnectedNearBlackPixels(imageData.data, keyedCanvas.width, keyedCanvas.height);
  keyedContext.putImageData(imageData, 0, 0);
  return keyedCanvas;
}

function paintWatermarkCleanup(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const cleanupX = x + width * 0.02;
  const cleanupY = y + height * 0.02;
  const cleanupWidth = width * 0.12;
  const cleanupHeight = height * 0.09;
  const radius = Math.min(cleanupWidth, cleanupHeight) * 0.22;

  context.save();
  context.fillStyle = '#000000';
  context.shadowColor = '#000000';
  context.shadowBlur = 18;
  context.beginPath();
  context.moveTo(cleanupX + radius, cleanupY);
  context.lineTo(cleanupX + cleanupWidth - radius, cleanupY);
  context.quadraticCurveTo(cleanupX + cleanupWidth, cleanupY, cleanupX + cleanupWidth, cleanupY + radius);
  context.lineTo(cleanupX + cleanupWidth, cleanupY + cleanupHeight - radius);
  context.quadraticCurveTo(
    cleanupX + cleanupWidth,
    cleanupY + cleanupHeight,
    cleanupX + cleanupWidth - radius,
    cleanupY + cleanupHeight,
  );
  context.lineTo(cleanupX + radius, cleanupY + cleanupHeight);
  context.quadraticCurveTo(cleanupX, cleanupY + cleanupHeight, cleanupX, cleanupY + cleanupHeight - radius);
  context.lineTo(cleanupX, cleanupY + radius);
  context.quadraticCurveTo(cleanupX, cleanupY, cleanupX + radius, cleanupY);
  context.closePath();
  context.fill();
  context.restore();
}

export function SequenceCanvas({images, progress, ready, subjectScale = 0.7}: SequenceCanvasProps) {
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

    const {drawWidth, drawHeight, offsetX, offsetY} = getContainDrawRect(
      image.naturalWidth,
      image.naturalHeight,
      width,
      height,
      subjectScale,
    );
    const keyedFrame = createKeyedFrameCanvas(image, drawWidth, drawHeight);

    // Outside-only blur halo that helps the rectangular frame melt into the page background.
    context.save();
    context.filter = 'blur(24px) brightness(0.72) saturate(0.82)';
    context.globalAlpha = 0.38;
    context.drawImage(keyedFrame, offsetX - 16, offsetY - 16, drawWidth + 32, drawHeight + 32);

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
    context.drawImage(keyedFrame, offsetX, offsetY, drawWidth, drawHeight);
    paintWatermarkCleanup(context, offsetX, offsetY, drawWidth, drawHeight);
    context.restore();
  }, [frameIndex, images, subjectScale]);

  return (
    <div className={`sequence-canvas-shell ${ready ? 'is-ready' : ''}`}>
      <canvas className="sequence-canvas" ref={canvasRef} aria-label="Animated personage sequence" />
      {!ready ? <p className="sequence-loading">Preparing the sequence…</p> : null}
    </div>
  );
}
