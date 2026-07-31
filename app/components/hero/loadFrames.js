import {
  frameUrl,
  HERO_FRAME_COUNT_FALLBACK,
  HERO_FRAME_EXT,
  HERO_FRAME_HEIGHT_FALLBACK,
  HERO_FRAME_PAD,
  HERO_FRAME_PREFIX,
  HERO_FRAME_WIDTH_FALLBACK,
  HERO_MANIFEST_URL,
  resolveBitmapBudget,
  resolveDecodeMaxWidth,
  resolveFrameStep,
  resolvePrefetchRadius,
} from './config';

export function buildFrameIndexList(frameCount, step) {
  const indices = [];
  for (let i = 0; i < frameCount; i += step) indices.push(i);
  const last = frameCount - 1;
  if (indices[indices.length - 1] !== last) indices.push(last);
  return indices;
}

export function snapToLoadedFrame(rawIndex, frameCount, step) {
  const clamped = Math.min(frameCount - 1, Math.max(0, Math.round(rawIndex)));
  if (step <= 1) return clamped;
  return Math.min(frameCount - 1, Math.round(clamped / step) * step);
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
      prefix: data.prefix || undefined,
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
 * Fixed-size ImageBitmap store.
 * Decode size never changes with viewport → cache is never wiped mid-scroll
 * (wiping on resize was a primary flicker source).
 */
export function createFrameStore({
  frameCount,
  step,
  pad,
  ext,
  prefix = HERO_FRAME_PREFIX,
  sourceWidth,
  sourceHeight,
}) {
  const indices = buildFrameIndexList(frameCount, step);
  const indexSet = new Set(indices);
  const budget = resolveBitmapBudget();
  const maxDecodeW = resolveDecodeMaxWidth();
  const prefetchRadius = resolvePrefetchRadius();

  // Fixed decode size once — canvas drawImage scales to cover.
  const decodeWidth = Math.max(2, Math.min(sourceWidth, maxDecodeW) - (Math.min(sourceWidth, maxDecodeW) % 2));
  const decodeHeight = Math.max(
    2,
    Math.round(decodeWidth * (sourceHeight / sourceWidth))
      - (Math.round(decodeWidth * (sourceHeight / sourceWidth)) % 2),
  );

  /** @type {Map<number, Blob>} */
  const blobs = new Map();
  /** @type {Map<number, ImageBitmap>} */
  const bitmaps = new Map();
  /** @type {Map<number, Promise<Blob|null>>} */
  const blobLoads = new Map();
  /** @type {Map<number, Promise<ImageBitmap|null>>} */
  const bitmapLoads = new Map();

  const blobBudget = Math.min(indices.length, Math.max(budget * 4, 120));

  let disposed = false;
  let active = true;
  let lastCenter = 0;
  let bgAbort = false;

  const fetchBlob = (index) => {
    if (blobs.has(index)) return Promise.resolve(blobs.get(index));
    if (blobLoads.has(index)) return blobLoads.get(index);

    const url = frameUrl(index, { pad, ext, prefix });
    const promise = fetch(url, { cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        return res.blob();
      })
      .then((blob) => {
        blobs.set(index, blob);
        blobLoads.delete(index);
        if (blobs.size > blobBudget) {
          const ranked = [...blobs.keys()]
            .filter((k) => !bitmaps.has(k))
            .sort((a, b) => Math.abs(b - lastCenter) - Math.abs(a - lastCenter));
          let over = blobs.size - blobBudget;
          for (let i = 0; i < ranked.length && over > 0; i += 1) {
            blobs.delete(ranked[i]);
            over -= 1;
          }
        }
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
    const protect = new Set([center, indices[0], indices[indices.length - 1]]);
    for (let i = 0; i < Math.min(8, indices.length); i += 1) protect.add(indices[i]);
    for (let i = Math.max(0, indices.length - 8); i < indices.length; i += 1) {
      protect.add(indices[i]);
    }
    // Protect a dense window around center
    for (let d = -prefetchRadius; d <= prefetchRadius; d += 1) {
      protect.add(snapToLoadedFrame(center + d * step, frameCount, step));
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

    const promise = (async () => {
      const blob = await fetchBlob(index);
      if (!blob || disposed) return null;
      try {
        // 'low' = fastest decode; frames are already 1600px so quality is fine
        const bmp = await createImageBitmap(blob, {
          resizeWidth: decodeWidth,
          resizeHeight: decodeHeight,
          resizeQuality: 'low',
        });
        if (disposed) {
          bmp.close();
          return null;
        }
        bitmaps.set(index, bmp);
        evictFarBitmaps(lastCenter || index);
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
    decodeWidth,
    decodeHeight,

    get readyCount() {
      return bitmaps.size;
    },

    isReady(index) {
      return bitmaps.has(index);
    },

    async ensure(index) {
      if (!indexSet.has(index)) index = snapToLoadedFrame(index, frameCount, step);
      lastCenter = index;
      return decodeBitmap(index);
    },

    prefetch(center, opts = {}) {
      if (disposed || !active) return Promise.resolve();
      const radius = opts.radius ?? prefetchRadius;
      const velocity = opts.velocity || 0;
      const dir = velocity > 1 ? 1 : velocity < -1 ? -1 : 0;
      const ahead = dir === 0 ? radius : Math.round(radius * 1.75);
      const behind = dir === 0 ? radius : Math.max(6, Math.round(radius * 0.45));

      lastCenter = center;
      const tasks = [];
      const maxD = Math.max(ahead, behind);

      for (let d = 0; d <= maxD; d += 1) {
        const fwd = center + (dir >= 0 ? 1 : -1) * d * step;
        const back = center - (dir >= 0 ? 1 : -1) * d * step;
        const candidates = d === 0 ? [fwd] : [fwd, back];
        for (const raw of candidates) {
          if (d > ahead && raw === fwd) continue;
          if (d > behind && raw === back) continue;
          const idx = snapToLoadedFrame(raw, frameCount, step);
          if (!indexSet.has(idx)) continue;
          if (bitmaps.has(idx) || bitmapLoads.has(idx)) continue;
          tasks.push(decodeBitmap(idx));
          if (tasks.length >= 12) break;
        }
        if (tasks.length >= 12) break;
      }

      return Promise.all(tasks);
    },

    setActive(next) {
      if (active === next) return;
      active = next;
      if (!active) {
        bgAbort = true;
        const ranked = [...bitmaps.keys()]
          .sort((a, b) => Math.abs(a - lastCenter) - Math.abs(b - lastCenter));
        for (let i = 4; i < ranked.length; i += 1) {
          const bmp = bitmaps.get(ranked[i]);
          bitmaps.delete(ranked[i]);
          try { bmp?.close(); } catch { /* ignore */ }
        }
      } else {
        bgAbort = false;
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
     * Decode a solid opening runway BEFORE scrub unlocks, then keep decoding
     * the rest in the background so mid-sequence never gaps.
     */
    /**
     * Decode a solid opening runway BEFORE returning (so splash can wait),
     * then keep decoding the rest in the background.
     */
    async warmStart({ onProgress, signal, blockingCount = 64 } = {}) {
      const total = indices.length;
      const runwayLen = Math.min(indices.length, Math.max(24, blockingCount));
      const runway = indices.slice(0, runwayLen);
      const concurrency = 4;

      let done = 0;
      for (let i = 0; i < runway.length; i += concurrency) {
        if (signal?.aborted || disposed) return;
        await Promise.all(runway.slice(i, i + concurrency).map(decodeBitmap));
        done += Math.min(concurrency, runway.length - i);
        onProgress?.(Math.min(done, runwayLen), runwayLen);
        await new Promise((r) => setTimeout(r, 0));
      }

      onProgress?.(runwayLen, runwayLen);

      bgAbort = false;
      (async () => {
        for (let i = runwayLen; i < indices.length; i += 3) {
          if (signal?.aborted || disposed || bgAbort || !active) break;
          await Promise.all(indices.slice(i, i + 3).map(fetchBlob));
          await new Promise((r) => setTimeout(r, 10));
        }
        for (let i = runwayLen; i < indices.length; i += 2) {
          if (signal?.aborted || disposed || bgAbort || !active) break;
          await Promise.all(indices.slice(i, i + 2).map(decodeBitmap));
          evictFarBitmaps(lastCenter);
          await new Promise((r) => setTimeout(r, 12));
        }
        onProgress?.(total, total);
      })();
    },

    onResize() {
      // Intentionally no-op: decode size is fixed so cache never wipes.
    },

    dispose() {
      disposed = true;
      bgAbort = true;
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

export async function loadFrameSequence({
  onProgress,
  onFirstFrame,
  signal,
  blockingCount = 64,
} = {}) {
  const manifest = await loadManifest();
  const step = resolveFrameStep();

  const store = createFrameStore({
    frameCount: manifest.frameCount,
    step,
    pad: manifest.pad,
    ext: manifest.ext,
    prefix: manifest.prefix || HERO_FRAME_PREFIX,
    sourceWidth: manifest.width,
    sourceHeight: manifest.height,
  });

  const first = store.indices[0];
  const firstBmp = await store.ensure(first);
  if (!firstBmp) {
    throw new Error('Failed to load hero poster frame');
  }

  if (!signal?.aborted) {
    onFirstFrame?.({
      store,
      frameCount: manifest.frameCount,
      step,
      indices: store.indices,
    });
  }

  // Block until a solid runway is decoded — splash waits on this
  await store.warmStart({ onProgress, signal, blockingCount });

  return {
    store,
    frameCount: manifest.frameCount,
    step,
    indices: store.indices,
  };
}
