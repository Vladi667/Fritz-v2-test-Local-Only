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

    // Soft blurred integration layer that sits just outside the subject bounds.
    context.save();
    context.filter = 'blur(26px) brightness(1.02)';
    context.globalAlpha = 0.42;
    context.drawImage(image, offsetX - 12, offsetY - 12, drawWidth + 24, drawHeight + 24);
    const blurBand = 36;
    const outerMask = context.createLinearGradient(offsetX, 0, offsetX + drawWidth, 0);
    outerMask.addColorStop(0, 'rgba(255,255,255,0)');
    outerMask.addColorStop(blurBand / drawWidth, 'rgba(255,255,255,1)');
    outerMask.addColorStop(1 - blurBand / drawWidth, 'rgba(255,255,255,1)');
    outerMask.addColorStop(1, 'rgba(255,255,255,0)');
    context.globalCompositeOperation = 'destination-in';
    context.fillStyle = outerMask;
    context.fillRect(offsetX - 14, offsetY - 14, drawWidth + 28, drawHeight + 28);
    const outerMaskVertical = context.createLinearGradient(0, offsetY, 0, offsetY + drawHeight);
    outerMaskVertical.addColorStop(0, 'rgba(255,255,255,0)');
    outerMaskVertical.addColorStop(blurBand / drawHeight, 'rgba(255,255,255,1)');
    outerMaskVertical.addColorStop(1 - blurBand / drawHeight, 'rgba(255,255,255,1)');
    outerMaskVertical.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = outerMaskVertical;
    context.fillRect(offsetX - 14, offsetY - 14, drawWidth + 28, drawHeight + 28);
    context.restore();

    // Render the sharp subject through a feathered edge mask so the seam fades slightly inward.
    const subjectCanvas = document.createElement('canvas');
    subjectCanvas.width = Math.max(1, Math.round(drawWidth));
    subjectCanvas.height = Math.max(1, Math.round(drawHeight));
    const subjectContext = subjectCanvas.getContext('2d');

    if (!subjectContext) {
      return;
    }

    subjectContext.imageSmoothingEnabled = true;
    subjectContext.imageSmoothingQuality = 'high';
    subjectContext.filter = 'brightness(1.05) contrast(1.03) saturate(1.02)';
    subjectContext.drawImage(image, 0, 0, subjectCanvas.width, subjectCanvas.height);

    const feather = 18;
    subjectContext.globalCompositeOperation = 'destination-in';

    const horizontalMask = subjectContext.createLinearGradient(0, 0, subjectCanvas.width, 0);
    horizontalMask.addColorStop(0, 'rgba(255,255,255,0)');
    horizontalMask.addColorStop(feather / subjectCanvas.width, 'rgba(255,255,255,1)');
    horizontalMask.addColorStop(1 - feather / subjectCanvas.width, 'rgba(255,255,255,1)');
    horizontalMask.addColorStop(1, 'rgba(255,255,255,0)');
    subjectContext.fillStyle = horizontalMask;
    subjectContext.fillRect(0, 0, subjectCanvas.width, subjectCanvas.height);

    const verticalMask = subjectContext.createLinearGradient(0, 0, 0, subjectCanvas.height);
    verticalMask.addColorStop(0, 'rgba(255,255,255,0)');
    verticalMask.addColorStop(feather / subjectCanvas.height, 'rgba(255,255,255,1)');
    verticalMask.addColorStop(1 - feather / subjectCanvas.height, 'rgba(255,255,255,1)');
    verticalMask.addColorStop(1, 'rgba(255,255,255,0)');
    subjectContext.fillStyle = verticalMask;
    subjectContext.fillRect(0, 0, subjectCanvas.width, subjectCanvas.height);

    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.22)';
    context.shadowBlur = 18;
    context.shadowOffsetY = 6;
    context.drawImage(subjectCanvas, offsetX, offsetY, drawWidth, drawHeight);
    context.restore();
  }, [frameIndex, images]);

  return (
    <div className={`sequence-canvas-shell ${ready ? 'is-ready' : ''}`}>
      <canvas className="sequence-canvas" ref={canvasRef} aria-label="Animated personage sequence" />
      {!ready ? <p className="sequence-loading">Preparing the sequence…</p> : null}
    </div>
  );
}
