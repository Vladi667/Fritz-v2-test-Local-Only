import {categories} from '../data/categories';
import {
  buildFramePaths,
  clamp,
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
    expect(getActiveBeat(0.12, categories)?.id).toBe('reach');
    expect(getActiveBeat(0.84, categories)?.id).toBe('settle');
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
});
