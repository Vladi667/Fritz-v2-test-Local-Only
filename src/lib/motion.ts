import type {CategoryBeat} from '../types';

export const FRAME_COUNT = 240;

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

export function getActiveBeat(progress: number, beats: CategoryBeat[]) {
  return beats.find((beat) => progress >= beat.start && progress <= beat.end) ?? null;
}

export function quantizeProgress(progress: number) {
  const stops = [0, 0.25, 0.5, 0.75, 1];
  return stops.reduce((closest, value) => {
    return Math.abs(value - progress) < Math.abs(closest - progress) ? value : closest;
  }, 0);
}
