import {describe, expect, it} from 'vitest';
import {keyConnectedNearBlackPixels} from './backgroundKeying';

function pixelIndex(x: number, y: number, width: number) {
  return (y * width + x) * 4;
}

describe('keyConnectedNearBlackPixels', () => {
  it('removes near-black pixels connected to the image edge', () => {
    const width = 3;
    const height = 3;
    const data = new Uint8ClampedArray(width * height * 4).fill(255);

    const edgeBlack = pixelIndex(0, 0, width);
    data[edgeBlack] = 8;
    data[edgeBlack + 1] = 8;
    data[edgeBlack + 2] = 8;

    const connectedBlack = pixelIndex(1, 0, width);
    data[connectedBlack] = 12;
    data[connectedBlack + 1] = 12;
    data[connectedBlack + 2] = 12;

    keyConnectedNearBlackPixels(data, width, height);

    expect(data[edgeBlack + 3]).toBe(0);
    expect(data[connectedBlack + 3]).toBe(0);
  });

  it('keeps isolated dark interior pixels opaque', () => {
    const width = 3;
    const height = 3;
    const data = new Uint8ClampedArray(width * height * 4).fill(255);

    const edgeLit = pixelIndex(0, 1, width);
    data[edgeLit] = 140;
    data[edgeLit + 1] = 120;
    data[edgeLit + 2] = 90;

    const centerDark = pixelIndex(1, 1, width);
    data[centerDark] = 10;
    data[centerDark + 1] = 10;
    data[centerDark + 2] = 10;

    keyConnectedNearBlackPixels(data, width, height);

    expect(data[centerDark + 3]).toBe(255);
  });
});
