import {
  frameUrl,
  HERO_FRAME_COUNT_FALLBACK,
  HERO_FRAME_EXT,
  HERO_FRAME_HEIGHT_FALLBACK,
  HERO_FRAME_PAD,
  HERO_FRAME_WIDTH_FALLBACK,
  HERO_MANIFEST_URL,
  resolveBitmapBudget,
  resolveDecodeMaxWidth,
  resolveFrameStep,
} from './config';

export function buildFrameIndexList(frameCount, step) {
  const indices = [];
  for (let i = 0; i < frameCount; i += step) {
    indices.push(i);
  }
  const last = frameCount - 1;
  if (indices[indices.length - 1] !== last) {
    indices.push(last);
  }
  return indices;
}

export function snapToLoadedFrame(rawIndex, frameCount, step) {
  const clamped = Math.min(frameCount - 1, Math.max(0, Math.round(rawIndex)));
  if (step <= 1) return clamped;
  const snapped = Math.round(clamped / step) * step;
  return Math.min(frameCount - 1, snapped);
}

export async function loadManifest() {
  try {
    const res = await fetch(HERO_MANIFEST_URL, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      frameCount: Number(data.frameCount) || HERO_FRAME_COUNT_FALLBACK,
      pad: Number(data.pad) || HERO_FRAME_PAD,
      ext: data.extension || HERO_FRAME_EXT,
      width: Number(data.width || data.sourceWidth) || HERO_FRAME_WIDTH_FALLBACK,
      height: Number(data.height || data.sourceHeight) || HERO_FRAME_HEIGHT_FALLBACK,
    };
  } catch {
    return {
      frameCount: HERO_FRAME_COUNT_FALLBACK,
      pad: HERO_FRAME_PAD,
      ext: HERO_FRAME_EXT,
      width: HERO_FRAME_WIDTH_FALLBACK,
      height: HERO_FRAME_HEIGHT_FALLBACK,
    };
  }
}

/**
 * Frame store optimized for continuous scrubbing:
 * - Prefetch blobs aggressively
 * - Keep a large sliding window of decoded bitmaps
 * - Directional prefetch based on scroll velocity
 */
export function createFrameStore({
  frameCount,
  step,
  pad,
  ext,
  sourceWidth,
  sourceHeight,
  getTargetSize,
}) {
  const indices = buildFrameIndexList(frameCount, step);
  const indexSet = new Set(indices);
  const budget = resolveBitmapBudget();
  const maxDecodeW = resolveDecodeMaxWidth();

  /** @type {Map<number, Blob>} */
  const blobs = new Map();
  /** @type {Map<number, ImageBitmap>} */
  const bitmaps = new Map();
  /** @type {Map<number, Promise<Blob|null>>} */
  const blobLoads = new Map();
  /** @type {Map<number, Promise<ImageBitmap|null>>} */
  const bitmapLoads = new Map();

  let decodeWidth = 0;
  let decodeHeight = 0;
  let disposed = false;
  let lastCenter = 0;

  const syncTargetSize = () => {
    const size = getTargetSize?.() || { width: 0, height: 0 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(1, Math.round(size.width || window.innerWidth));
    const cssH = Math.max(1, Math.round(size.height || window.innerHeight));

    let tw = Math.min(sourceWidth, maxDecodeW, Math.round(cssW * dpr));
    let th = Math.round(tw * (sourceHeight / sourceWidth));

    const viewAspect = cssW / cssH;
    const srcAspect = sourceWidth / sourceHeight;
    if (srcAspect > viewAspect) {
      // cover: height-limited
      th = Math.min(sourceHeight, Math.round(cssH * dpr));
      tw = Math.min(sourceWidth, maxDecodeW, Math.round(th * srcAspect));
      th = Math.round(tw / srcAspect);
    }

    tw = Math.max(2, tw - (tw % 2));
    th = Math.max(2, th - (th % 2));

    if (tw !== decodeWidth || th !== decodeHeight) {
      decodeWidth = tw;
      decodeHeight = th;
      for (const bmp of bitmaps.values()) {
        try { bmp.close(); } catch { /* ignore */ }
      }
      bitmaps.clear();
      bitmapLoads.clear();
    }
  };

  const fetchBlob = (index) => {
    if (blobs.has(index)) return Promise.resolve(blobs.get(index));
    if (blobLoads.has(index)) return blobLoads.get(index);

    const url = frameUrl(index, { pad, ext });
    const promise = fetch(url, { cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        return res.blob();
      })
      .then((blob) => {
        blobs.set(index, blob);
        blobLoads.delete(index);
        return blob;
      })
      .catch((err) => {
        blobLoads.delete(index);
        console.warn(err.message || err);
        return null;
      });

    blobLoads.set(index, promise);
    return promise;
  };

  const evictFarBitmaps = (center) => {
    if (bitmaps.size <= budget) return;
    const first = indices[0];
    const last = indices[indices.length - 1];
    const protect = new Set([first, last, center]);

    // Keep short runways at both ends (enter house + exit house)
    for (let i = 0; i < Math.min(6, indices.length); i += 1) protect.add(indices[i]);
    for (let i = Math.max(0, indices.length - 6); i < indices.length; i += 1) {
      protect.add(indices[i]);
    }

    const ranked = [...bitmaps.keys()]
      .filter((key) => !protect.has(key))
      .sort((a, b) => Math.abs(a - center) - Math.abs(b - center));

    const keep = Math.max(0, budget - protect.size);
    for (let i = keep; i < ranked.length; i += 1) {
      const key = ranked[i];
      const bmp = bitmaps.get(key);
      bitmaps.delete(key);
      try { bmp?.close(); } catch { /* ignore */ }
    }
  };

  const decodeBitmap = async (index) => {
    if (disposed) return null;
    if (bitmaps.has(index)) return bitmaps.get(index);
    if (bitmapLoads.has(index)) return bitmapLoads.get(index);

    syncTargetSize();

    const promise = (async () => {
      const blob = await fetchBlob(index);
      if (!blob || disposed) return null;

      try {
        // medium = much faster decode during scrub; still sharp at decode size
        const bmp = await createImageBitmap(blob, {
          resizeWidth: decodeWidth,
          resizeHeight: decodeHeight,
          resizeQuality: 'medium',
        });
        if (disposed) {
          bmp.close();
          return null;
        }
        bitmaps.set(index, bmp);
        evictFarBitmaps(index);
        return bmp;
      } catch (err) {
        console.warn(`decode failed frame ${index}`, err);
        return null;
      } finally {
        bitmapLoads.delete(index);
      }
    })();

    bitmapLoads.set(index, promise);
    return promise;
  };

  const nearestAvailable = (target) => {
    if (bitmaps.has(target)) return target;
    let best = -1;
    let bestDist = Infinity;
    for (const key of bitmaps.keys()) {
      const dist = Math.abs(key - target);
      if (dist < bestDist) {
        bestDist = dist;
        best = key;
      }
    }
    return best;
  };

  return {
    frameCount,
    step,
    indices,
    indexSet,

    get readyCount() {
      return bitmaps.size;
    },

    get blobCount() {
      return blobs.size;
    },

    isReady(index) {
      return bitmaps.has(index);
    },

    async ensure(index) {
      if (!indexSet.has(index)) {
        index = snapToLoadedFrame(index, frameCount, step);
      }
      lastCenter = index;
      return decodeBitmap(index);
    },

    /**
     * Prefetch a wide symmetric window so enter + exit stay equally smooth.
     */
    prefetch(center, opts = {}) {
      if (disposed) return Promise.resolve();
      syncTargetSize();

      const radius = opts.radius ?? 36;
      lastCenter = center;
      const tasks = [];

      // Decode outward from center (near frames first) both directions
      for (let d = 0; d <= radius; d += 1) {
        for (const sign of d === 0 ? [0] : [-1, 1]) {
          const raw = center + sign * d * step;
          const idx = snapToLoadedFrame(raw, frameCount, step);
          if (!indexSet.has(idx)) continue;
          if (bitmaps.has(idx) || bitmapLoads.has(idx)) continue;
          tasks.push(decodeBitmap(idx));
        }
      }

      return Promise.all(tasks.slice(0, 20));
    },

    getBitmap(index) {
      return bitmaps.get(index) || null;
    },

    nearestBitmap(target) {
      const key = nearestAvailable(target);
      if (key < 0) return { key: -1, bitmap: null };
      return { key, bitmap: bitmaps.get(key) || null };
    },

    /**
     * 1) Decode a dense sequential runway so scrubbing never gaps.
     * 2) Fetch all remaining blobs in the background.
     */
    async warmStart({ onProgress, signal, minDecoded } = {}) {
      // Warm BOTH ends so entering the house and exiting are equally ready
      const half = Math.min(
        Math.floor(indices.length / 2),
        Math.max(Math.floor((minDecoded ?? 40) / 2), 24),
      );

      let done = 0;
      const total = indices.length;

      const decodeBatch = async (list) => {
        const concurrency = 10;
        for (let i = 0; i < list.length; i += concurrency) {
          if (signal?.aborted || disposed) return;
          const slice = list.slice(i, i + concurrency);
          await Promise.all(slice.map((idx) => decodeBitmap(idx)));
          done += slice.length;
          onProgress?.(Math.min(done, total), total);
        }
      };

      const startRun = indices.slice(0, half);
      const endRun = indices.slice(Math.max(half, indices.length - half));
      const middle = [];
      const stride = Math.max(2, Math.ceil(indices.length / 40));
      for (let i = half; i < indices.length - half; i += stride) {
        middle.push(indices[i]);
      }

      await decodeBatch(startRun);
      await decodeBatch(endRun);
      await decodeBatch(middle);
      onProgress?.(Math.max(done, startRun.length + endRun.length), total);

      (async () => {
        const concurrency = 10;
        for (let i = 0; i < indices.length; i += concurrency) {
          if (signal?.aborted || disposed) break;
          await Promise.all(indices.slice(i, i + concurrency).map(fetchBlob));
        }
        for (let i = 0; i < indices.length; i += concurrency) {
          if (signal?.aborted || disposed) break;
          await Promise.all(indices.slice(i, i + concurrency).map(decodeBitmap));
          evictFarBitmaps(lastCenter);
        }
        onProgress?.(total, total);
      })();
    },

    onResize() {
      syncTargetSize();
    },

    dispose() {
      disposed = true;
      for (const bmp of bitmaps.values()) {
        try { bmp.close(); } catch { /* ignore */ }
      }
      bitmaps.clear();
      bitmapLoads.clear();
      blobLoads.clear();
      blobs.clear();
    },
  };
}

export async function loadFrameSequence({ onProgress, onFirstFrame, getTargetSize, signal } = {}) {
  const manifest = await loadManifest();
  const step = resolveFrameStep();

  const store = createFrameStore({
    frameCount: manifest.frameCount,
    step,
    pad: manifest.pad,
    ext: manifest.ext,
    sourceWidth: manifest.width,
    sourceHeight: manifest.height,
    getTargetSize,
  });

  const first = store.indices[0];
  await store.ensure(first);
  if (!signal?.aborted) {
    onFirstFrame?.({
      store,
      frameCount: manifest.frameCount,
      step,
      indices: store.indices,
    });
  }

  // Keep warming before we consider scrubbing fully armed
  await store.warmStart({ onProgress, signal });

  return {
    store,
    frameCount: manifest.frameCount,
    step,
    indices: store.indices,
  };
}
