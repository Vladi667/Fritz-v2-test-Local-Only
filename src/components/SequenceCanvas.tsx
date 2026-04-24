import {useCallback, useEffect, useRef, useState} from 'react';
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
  // Cached context — getContext is cheap but caching is cleaner
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Progress mirrored to ref so draw closure stays current
  const displayProgressRef = useRef(progress);
  const rafIdRef = useRef(0);

  // Props mirrored to refs so the RAF closure doesn't go stale
  const imagesRef = useRef(images);
  const subjectScaleRef = useRef(subjectScale);
  const prefersReducedMotionRef = useRef(prefersReducedMotion);

  // Canvas dimension cache to avoid GPU texture reallocation every frame
  const canvasDimsRef = useRef({cssW: 0, cssH: 0, ratio: 0});

  // Keyed frame cache — keyed by frame index, cleared when draw dims change
  const keyedFrameCacheRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const cacheDimsRef = useRef('');

  // Last drawn frame index — used to remap displayProgress when images.length grows
  const lastFrameIndexRef = useRef(0);

  // Entrance animation — only this uses React state (one-shot, fine)
  const [entering, setEntering] = useState(false);
  const wasReadyRef = useRef(false);

  // Keep refs in sync with props
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    subjectScaleRef.current = subjectScale;
  }, [subjectScale]);

  useEffect(() => {
    prefersReducedMotionRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  // Entrance animation when frames first become ready
  useEffect(() => {
    if (ready && !wasReadyRef.current) {
      wasReadyRef.current = true;
      setEntering(true);
      const t = setTimeout(() => setEntering(false), 1000);
      return () => clearTimeout(t);
    }
  }, [ready]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const imgs = imagesRef.current;
    if (!canvas || imgs.length === 0) return;

    const currentProgress = displayProgressRef.current;
    const frameSample = getFrameSample(currentProgress, imgs.length);
    const baseImage = imgs[frameSample.baseIndex];
    if (!baseImage || baseImage.naturalWidth === 0 || baseImage.naturalHeight === 0) return;

    if (!contextRef.current) {
      contextRef.current = canvas.getContext('2d');
    }
    const context = contextRef.current;
    if (!context) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    // Only reallocate GPU texture when dimensions actually change
    const cached = canvasDimsRef.current;
    if (cached.cssW !== cssW || cached.cssH !== cssH || cached.ratio !== ratio) {
      canvas.width = Math.max(1, Math.floor(cssW * ratio));
      canvas.height = Math.max(1, Math.floor(cssH * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      canvasDimsRef.current = {cssW, cssH, ratio};
    }

    context.clearRect(0, 0, cssW, cssH);

    const rect = getContainDrawRect(
      baseImage.naturalWidth,
      baseImage.naturalHeight,
      cssW,
      cssH,
      subjectScaleRef.current,
    );
    // Round to integer pixels — eliminates sub-pixel fringing on subject edges
    const drawWidth = Math.round(rect.drawWidth);
    const drawHeight = Math.round(rect.drawHeight);
    const offsetX = Math.round(rect.offsetX);
    const offsetY = Math.round(rect.offsetY);

    const cacheKey = `${Math.round(drawWidth)}x${Math.round(drawHeight)}`;
    if (cacheDimsRef.current !== cacheKey) {
      keyedFrameCacheRef.current.clear();
      cacheDimsRef.current = cacheKey;
    }

    const getKeyedFrame = (index: number) => {
      const cache = keyedFrameCacheRef.current;
      const hit = cache.get(index);
      if (hit) {
        // Move to end so eviction always removes least-recently-used
        cache.delete(index);
        cache.set(index, hit);
        return hit;
      }

      const sourceImage = imgs[index];
      if (!sourceImage || sourceImage.naturalWidth === 0 || sourceImage.naturalHeight === 0) return null;

      const nextFrame = createKeyedFrameCanvas(sourceImage, drawWidth, drawHeight);
      cache.set(index, nextFrame);

      // 28 frames covers ~3s of smooth scroll buffer without re-keying
      if (cache.size > 28) {
        const lruKey = cache.keys().next().value;
        if (lruKey !== undefined) cache.delete(lruKey);
      }

      return nextFrame;
    };

    lastFrameIndexRef.current = frameSample.baseIndex;

    const keyedBaseFrame = getKeyedFrame(frameSample.baseIndex);
    if (!keyedBaseFrame) return;

    const reducedMotion = prefersReducedMotionRef.current;
    const easedMix = frameSample.mix * frameSample.mix * (3 - 2 * frameSample.mix);
    const blendAlpha = reducedMotion ? 0 : easedMix * 0.22;
    const keyedNextFrame =
      blendAlpha > 0.001 && frameSample.nextIndex !== frameSample.baseIndex
        ? getKeyedFrame(frameSample.nextIndex)
        : null;

    // Outer bloom — 8px blur (2× cheaper than 16px), low opacity
    context.save();
    context.filter = 'blur(8px) brightness(0.58) saturate(0.62)';
    context.globalAlpha = 0.18;
    context.drawImage(keyedBaseFrame, offsetX - 10, offsetY - 10, drawWidth + 20, drawHeight + 20);
    if (keyedNextFrame && blendAlpha > 0) {
      context.globalAlpha = blendAlpha * 0.9;
      context.drawImage(keyedNextFrame, offsetX - 10, offsetY - 10, drawWidth + 20, drawHeight + 20);
    }
    // Cut center so bloom only exists outside image boundary
    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = '#000';
    context.fillRect(offsetX + 2, offsetY + 2, drawWidth - 4, drawHeight - 4);
    context.restore();

    // Shadow moved to CSS drop-shadow (GPU path) — no canvas shadowBlur here
    context.save();
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
  }, []);

  // Scroll drives frames directly — no lerp, no trailing motion
  useEffect(() => {
    displayProgressRef.current = progress;
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(draw);
  }, [progress, draw]);

  // Redraw when images array changes (progressive loading batches arrive)
  useEffect(() => {
    if (images.length === 0) return;
    // Remap displayProgress so the same visual frame stays on screen when
    // the array grows from 24 → 300. Without this, progress=0.5 would jump
    // from frame 11 (of 24) to frame 149 (of 300).
    const newTotal = images.length;
    if (newTotal > 1) {
      displayProgressRef.current = lastFrameIndexRef.current / (newTotal - 1);
    }
    draw();
  }, [images, draw]);

  // Redraw on subjectScale change
  useEffect(() => {
    draw();
  }, [subjectScale, draw]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Handle canvas resize (window resize)
  useEffect(() => {
    const onResize = () => {
      // Invalidate dimension cache so next draw reallocates
      canvasDimsRef.current = {cssW: 0, cssH: 0, ratio: 0};
      // Also clear keyed frame cache since draw dimensions change
      keyedFrameCacheRef.current.clear();
      cacheDimsRef.current = '';
      draw();
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  return (
    <div className={`sequence-canvas-shell ${ready ? 'is-ready' : ''} ${entering ? 'is-entering' : ''}`}>
      <canvas className="sequence-canvas" ref={canvasRef} aria-label="Animated personage sequence" />
      {!ready ? <p className="sequence-loading">—</p> : null}
    </div>
  );
}
