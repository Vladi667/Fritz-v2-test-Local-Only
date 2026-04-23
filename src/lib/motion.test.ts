import {categories} from '../data/categories';
import {
  buildFramePaths,
  clamp,
  getContainDrawRect,
  getCoverDrawRect,
  getActiveBeat,
  getFrameIndex,
  quantizeProgress,
} from './motion';

describe('motion helpers', () => {
  it('builds ordered frame paths for the full sequence', () => {
    const paths = buildFramePaths(3);

    expect(paths).toEqual([
      '/assets/frames/frame-001.jpg',
      '/assets/frames/frame-002.jpg',
      '/assets/frames/frame-003.jpg',
    ]);
  });

  it('maps progress to the expected frame index', () => {
    expect(getFrameIndex(0, 240)).toBe(0);
    expect(getFrameIndex(0.5, 240)).toBe(120);
    expect(getFrameIndex(1, 240)).toBe(239);
  });

  it('finds the active category beat for a progress value', () => {
    expect(getActiveBeat(0.12, categories)?.id).toBe('arrival');
    expect(getActiveBeat(0.84, categories)?.id).toBe('drift');
    expect(getActiveBeat(1, categories)).toBeNull();
  });

  it('quantizes progress for reduced motion mode', () => {
    expect(quantizeProgress(0.1)).toBe(0);
    expect(quantizeProgress(0.62)).toBe(0.5);
    expect(quantizeProgress(0.91)).toBe(1);
  });

  it('clamps values into a given range', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(0.4)).toBe(0.4);
  });

  it('calculates a centered contain rect for portrait imagery in a tall stage', () => {
    const rect = getContainDrawRect(720, 1280, 420, 760, 0.92);

    expect(rect.drawWidth).toBeLessThanOrEqual(420);
    expect(rect.drawHeight).toBeLessThanOrEqual(760);
    expect(rect.offsetX).toBeCloseTo((420 - rect.drawWidth) / 2, 4);
    expect(rect.offsetY).toBeCloseTo((760 - rect.drawHeight) / 2, 4);
  });

  it('keeps a portrait subject smaller inside a wide viewport to avoid cropping', () => {
    const rect = getContainDrawRect(720, 1280, 1440, 900, 0.78);

    expect(rect.drawHeight).toBeCloseTo(702, 0);
    expect(rect.drawWidth).toBeCloseTo(394.875, 3);
    expect(rect.offsetX).toBeCloseTo((1440 - rect.drawWidth) / 2, 4);
    expect(rect.offsetY).toBeCloseTo((900 - rect.drawHeight) / 2, 4);
  });

  it('calculates a cover rect for using the image as the full background', () => {
    const rect = getCoverDrawRect(720, 1280, 1440, 900);

    expect(rect.drawWidth).toBeCloseTo(1440, 0);
    expect(rect.drawHeight).toBeGreaterThan(900);
    expect(rect.offsetX).toBeCloseTo(0, 4);
    expect(rect.offsetY).toBeLessThan(0);
  });
});
