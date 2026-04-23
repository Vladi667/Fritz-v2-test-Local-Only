import {useEffect, useMemo, useRef, useState} from 'react';
import {keyConnectedNearBlackPixels} from '../lib/backgroundKeying';
import {getContainDrawRect, getFrameSample} from '../lib/motion';
import {useReducedMotion} from '../hooks/useReducedMotion';

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
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetProgressRef = useRef(progress);
  const cacheDimensionsRef = useRef<string>('');
  const keyedFrameCacheRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const [displayProgress, setDisplayProgress] = useState(progress);
  const frameSample = useMemo(() => getFrameSample(displayProgress, images.length), [displayProgress, images.length]);

  useEffect(() => {
    targetProgressRef.current = progress;
    if (prefersReducedMotion) {
      setDisplayProgress(progress);
    }
  }, [prefersReducedMotion, progress]);

  useEffect(() => {
    if (prefersReducedMotion || images.length === 0) {
      return;
    }

    let rafId = 0;

    const tick = () => {
      setDisplayProgress((current) => {
        const target = targetProgressRef.current;
        const delta = target - current;

        if (Math.abs(delta) < 0.0008) {
          return target;
        }

        return current + delta * 0.14;
      });

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [images.length, prefersReducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const baseImage = images[frameSample.baseIndex];
    if (!canvas || !baseImage || baseImage.naturalWidth === 0 || baseImage.naturalHeight === 0) {
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
      baseImage.naturalWidth,
      baseImage.naturalHeight,
      width,
      height,
      subjectScale,
    );
    const cacheKey = `${Math.round(drawWidth)}x${Math.round(drawHeight)}`;
    if (cacheDimensionsRef.current !== cacheKey) {
      keyedFrameCacheRef.current.clear();
      cacheDimensionsRef.current = cacheKey;
    }

    const getKeyedFrame = (index: number) => {
      const cached = keyedFrameCacheRef.current.get(index);
      if (cached) {
        return cached;
      }

      const sourceImage = images[index];
      if (!sourceImage || sourceImage.naturalWidth === 0 || sourceImage.naturalHeight === 0) {
        return null;
      }

      const nextFrame = createKeyedFrameCanvas(sourceImage, drawWidth, drawHeight);
      keyedFrameCacheRef.current.set(index, nextFrame);

      if (keyedFrameCacheRef.current.size > 8) {
        const oldestKey = keyedFrameCacheRef.current.keys().next().value;
        if (oldestKey !== undefined) {
          keyedFrameCacheRef.current.delete(oldestKey);
        }
      }

      return nextFrame;
    };

    const keyedBaseFrame = getKeyedFrame(frameSample.baseIndex);
    if (!keyedBaseFrame) {
      return;
    }

    const easedMix = frameSample.mix * frameSample.mix * (3 - 2 * frameSample.mix);
    const blendAlpha = prefersReducedMotion ? 0 : easedMix * 0.34;
    const keyedNextFrame =
      blendAlpha > 0.001 && frameSample.nextIndex !== frameSample.baseIndex
        ? getKeyedFrame(frameSample.nextIndex)
        : null;

    // Outside-only blur halo that helps the rectangular frame melt into the page background.
    context.save();
    context.filter = 'blur(24px) brightness(0.72) saturate(0.82)';
    context.globalAlpha = 0.38;
    context.drawImage(keyedBaseFrame, offsetX - 16, offsetY - 16, drawWidth + 32, drawHeight + 32);
    if (keyedNextFrame && blendAlpha > 0) {
      context.globalAlpha = blendAlpha * 0.9;
      context.drawImage(keyedNextFrame, offsetX - 16, offsetY - 16, drawWidth + 32, drawHeight + 32);
    }

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
    context.globalAlpha = 1;
    context.drawImage(keyedBaseFrame, offsetX, offsetY, drawWidth, drawHeight);
    if (keyedNextFrame && blendAlpha > 0) {
      context.globalAlpha = blendAlpha;
      context.drawImage(keyedNextFrame, offsetX, offsetY, drawWidth, drawHeight);
      context.globalAlpha = 1;
    }
    paintWatermarkCleanup(context, offsetX, offsetY, drawWidth, drawHeight);
    context.restore();
  }, [frameSample, images, prefersReducedMotion, subjectScale]);

  return (
    <div className={`sequence-canvas-shell ${ready ? 'is-ready' : ''}`}>
      <canvas className="sequence-canvas" ref={canvasRef} aria-label="Animated personage sequence" />
      {!ready ? <p className="sequence-loading">Preparing the sequence…</p> : null}
    </div>
  );
}
