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
  resolvePrefetchRadius,
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
  const prefetchRadius = resolvePrefetchRadius();

  /** @type {Map<number, Blob>} */
  const blobs = new Map();
  /** @type {Map<number, ImageBitmap>} */
  const bitmaps = new Map();
  /** @type {Map<number, Promise<Blob|null>>} */
  const blobLoads = new Map();
  /** @type {Map<number, Promise<ImageBitmap|null>>} */
  const bitmapLoads = new Map();

  // Cap retained compressed blobs so we don't hold the whole 4K set in RAM.
  const blobBudget = Math.min(indices.length, Math.max(budget * 3, 96));

  let decodeWidth = 0;
  let decodeHeight = 0;
  let disposed = false;
  let active = true;
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

  const evictFarBlobs = (center) => {
    if (blobs.size <= blobBudget) return;
    const ranked = [...blobs.keys()]
      .filter((key) => !bitmaps.has(key)) // never drop a blob whose bitmap is live
      .sort((a, b) => Math.abs(b - center) - Math.abs(a - center)); // farthest first
    let over = blobs.size - blobBudget;
    for (let i = 0; i < ranked.length && over > 0; i += 1) {
      blobs.delete(ranked[i]);
      over -= 1;
    }
  };

  const fetchBlob = (index) => {
    if (blobs.has(index)) return Promise.resolve(blobs.get(index));
    if (blobLoads.has(index)) return blobLoads.get(index);

    const url = frameUrl(index, { pad, ext });
    // HTTP cache (force-cache) keeps frames on disk, so re-fetching an evicted
    // blob is cheap — we don't need to hoard every decoded blob in memory.
    const promise = fetch(url, { cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        return res.blob();
      })
      .then((blob) => {
        blobs.set(index, blob);
        blobLoads.delete(index);
        evictFarBlobs(lastCenter);
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
    if (!decodeWidth) syncTargetSize();

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
     * Decode a window around the current frame, biased toward the scroll
     * direction so frames are ready *before* we reach them (kills the
     * "stops in between" gaps). No-op when the hero is off-screen so it
     * never competes with the rest of the page for the main thread.
     */
    prefetch(center, opts = {}) {
      if (disposed || !active) return Promise.resolve();
      if (!decodeWidth) syncTargetSize();

      const radius = opts.radius ?? prefetchRadius;
      const velocity = opts.velocity || 0;
      // Look further ahead in the direction of travel, keep a small cushion behind.
      const dir = velocity > 0.5 ? 1 : velocity < -0.5 ? -1 : 0;
      const ahead = dir === 0 ? radius : Math.round(radius * 1.6);
      const behind = dir === 0 ? radius : Math.max(4, Math.round(radius * 0.5));

      lastCenter = center;

      // Build an ordered list: nearest frames first, ahead prioritised.
      const wanted = [];
      const maxD = Math.max(ahead, behind);
      for (let d = 0; d <= maxD; d += 1) {
        const forward = center + (dir >= 0 ? 1 : -1) * d * step;
        const backward = center - (dir >= 0 ? 1 : -1) * d * step;
        if (d <= ahead) wanted.push(forward);
        if (d !== 0 && d <= behind) wanted.push(backward);
      }

      const tasks = [];
      for (const raw of wanted) {
        const idx = snapToLoadedFrame(raw, frameCount, step);
        if (!indexSet.has(idx)) continue;
        if (bitmaps.has(idx) || bitmapLoads.has(idx)) continue;
        tasks.push(decodeBitmap(idx));
        if (tasks.length >= 16) break;
      }

      return Promise.all(tasks);
    },

    /**
     * Enable/disable heavy work. When the hero scrolls out of view we stop
     * decoding and release most bitmaps so the rest of the site stays smooth.
     */
    setActive(next) {
      if (active === next) return;
      active = next;
      if (!active) {
        // Keep a tiny cushion around the last position; drop the rest.
        const ranked = [...bitmaps.keys()]
          .sort((a, b) => Math.abs(a - lastCenter) - Math.abs(b - lastCenter));
        for (let i = 6; i < ranked.length; i += 1) {
          const bmp = bitmaps.get(ranked[i]);
          bitmaps.delete(ranked[i]);
          try { bmp?.close(); } catch { /* ignore */ }
        }
      }
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
     * Decode a short opening runway so the top of the scroll is instantly
     * smooth. Everything else is decoded on demand via prefetch — we do NOT
     * decode the whole sequence (that pinned the CPU and lagged the site).
     */
    async warmStart({ onProgress, signal } = {}) {
      syncTargetSize();
      const total = indices.length;
      const runway = indices.slice(0, Math.min(indices.length, 20));
      const concurrency = 6;

      let done = 0;
      for (let i = 0; i < runway.length; i += concurrency) {
        if (signal?.aborted || disposed) return;
        await Promise.all(runway.slice(i, i + concurrency).map(decodeBitmap));
        done += Math.min(concurrency, runway.length - i);
        onProgress?.(Math.min(done, total), total);
      }

      // Warm just the disk/HTTP cache for the next stretch (blobs only, no
      // decode) so early scrubbing has data ready without heavy work.
      (async () => {
        const netConcurrency = 3;
        const warmBlobs = indices.slice(0, Math.min(indices.length, 60));
        for (let i = 0; i < warmBlobs.length; i += netConcurrency) {
          if (signal?.aborted || disposed) break;
          await Promise.all(warmBlobs.slice(i, i + netConcurrency).map(fetchBlob));
        }
      })();

      onProgress?.(total, total);
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
