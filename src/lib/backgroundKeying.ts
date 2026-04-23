function maxChannel(data: Uint8ClampedArray, pixelIndex: number) {
  return Math.max(data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2]);
}

export function keyConnectedNearBlackPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  hardThreshold = 14,
  softThreshold = 26,
) {
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const tryEnqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const flatIndex = y * width + x;
    if (visited[flatIndex]) {
      return;
    }

    const pixelOffset = flatIndex * 4;
    if (maxChannel(data, pixelOffset) > softThreshold) {
      return;
    }

    visited[flatIndex] = 1;
    queue.push(flatIndex);
  };

  for (let x = 0; x < width; x += 1) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }

  for (let y = 1; y < height - 1; y += 1) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const flatIndex = queue.shift()!;
    const pixelOffset = flatIndex * 4;
    const tone = maxChannel(data, pixelOffset);

    if (tone <= hardThreshold) {
      data[pixelOffset + 3] = 0;
    } else {
      const alpha = (tone - hardThreshold) / Math.max(1, softThreshold - hardThreshold);
      data[pixelOffset + 3] = Math.round(data[pixelOffset + 3] * alpha);
    }

    const x = flatIndex % width;
    const y = Math.floor(flatIndex / width);

    tryEnqueue(x - 1, y);
    tryEnqueue(x + 1, y);
    tryEnqueue(x, y - 1);
    tryEnqueue(x, y + 1);
  }

  return data;
}
