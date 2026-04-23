import type {CategoryBeat} from '../types';

export const FRAME_COUNT = 300;

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function buildFramePaths(frameCount = FRAME_COUNT) {
  return Array.from({length: frameCount}, (_, index) => {
    return `/assets/frames/frame-${String(index + 1).padStart(3, '0')}.jpg`;
  });
}

export function getFrameIndex(progress: number, frameCount: number) {
  if (frameCount <= 1) {
    return 0;
  }

  return Math.round(clamp(progress) * (frameCount - 1));
}

export function getContainDrawRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  scale = 1,
) {
  const safeScale = clamp(scale, 0.1, 1);
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;
  let drawWidth = targetWidth;
  let drawHeight = targetHeight;

  if (sourceRatio > targetRatio) {
    drawWidth = targetWidth * safeScale;
    drawHeight = drawWidth / sourceRatio;
  } else {
    drawHeight = targetHeight * safeScale;
    drawWidth = drawHeight * sourceRatio;
  }

  return {
    drawWidth,
    drawHeight,
    offsetX: (targetWidth - drawWidth) / 2,
    offsetY: (targetHeight - drawHeight) / 2,
  };
}

export function getCoverDrawRect(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number) {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;
  let drawWidth = targetWidth;
  let drawHeight = targetHeight;

  if (sourceRatio > targetRatio) {
    drawHeight = targetHeight;
    drawWidth = drawHeight * sourceRatio;
  } else {
    drawWidth = targetWidth;
    drawHeight = drawWidth / sourceRatio;
  }

  return {
    drawWidth,
    drawHeight,
    offsetX: (targetWidth - drawWidth) / 2,
    offsetY: (targetHeight - drawHeight) / 2,
  };
}

export function getActiveBeat(progress: number, beats: CategoryBeat[]) {
  return beats.find((beat) => progress >= beat.start && progress <= beat.end) ?? null;
}

export function quantizeProgress(progress: number) {
  const stops = [0, 0.25, 0.5, 0.75, 1];
  return stops.reduce((closest, value) => {
    return Math.abs(value - progress) < Math.abs(closest - progress) ? value : closest;
  }, 0);
}
