/**
 * Fixed-plane canvas renderer — no transforms / parallax.
 * Never clears to fill color between frames (that caused flicker).
 * Only paints when a decoded frame is ready — never flashes empty.
 */

const FILL = '#f4ede0';

let coverCache = { w: 0, h: 0, srcW: 0, srcH: 0, dw: 0, dh: 0, ox: 0, oy: 0 };

function getCoverRect(canvasWidth, canvasHeight, srcW, srcH) {
  if (
    coverCache.w === canvasWidth
    && coverCache.h === canvasHeight
    && coverCache.srcW === srcW
    && coverCache.srcH === srcH
  ) {
    return coverCache;
  }

  const imgAspect = srcW / srcH;
  const canvasAspect = canvasWidth / canvasHeight;
  let dw;
  let dh;
  let ox;
  let oy;

  if (imgAspect > canvasAspect) {
    dh = canvasHeight;
    dw = dh * imgAspect;
    ox = (canvasWidth - dw) / 2;
    oy = 0;
  } else {
    dw = canvasWidth;
    dh = dw / imgAspect;
    ox = 0;
    oy = (canvasHeight - dh) / 2;
  }

  coverCache = { w: canvasWidth, h: canvasHeight, srcW, srcH, dw, dh, ox, oy };
  return coverCache;
}

export function drawCoverFrame(canvas, ctx, img, { clear = false, alpha = 1 } = {}) {
  const rect = canvas.getBoundingClientRect();
  const canvasWidth = rect.width;
  const canvasHeight = rect.height;
  if (canvasWidth <= 0 || canvasHeight <= 0) return;

  const srcW = img.videoWidth || img.naturalWidth || img.width;
  const srcH = img.videoHeight || img.naturalHeight || img.height;
  if (!srcW || !srcH) return;

  const { dw, dh, ox, oy } = getCoverRect(canvasWidth, canvasHeight, srcW, srcH);

  // Only clear once (first paint). Overwriting with drawImage avoids flicker.
  if (clear) {
    ctx.fillStyle = FILL;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const previousAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, ox, oy, dw, dh);
  ctx.globalAlpha = previousAlpha;
}

export function resizeCanvas(canvas, ctx, { maxDpr = 1.25 } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const nextW = Math.round(width * dpr);
  const nextH = Math.round(height * dpr);

  if (canvas.width !== nextW || canvas.height !== nextH) {
    canvas.width = nextW;
    canvas.height = nextH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    coverCache = { w: 0, h: 0, srcW: 0, srcH: 0, dw: 0, dh: 0, ox: 0, oy: 0 };
    return true;
  }
  return false;
}

export function createFrameRenderer(canvas, store) {
  // alpha:false + no desynchronized → stable compositing (desync caused flicker)
  const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: false,
    colorSpace: 'srgb',
  });

  let lastRequested = -1;
  let lastDrawnKey = -1;
  let lastDrawnImg = null;
  let lastDrawnUpperImg = null;
  let lastDrawnLowerKey = -1;
  let lastDrawnUpperKey = -1;
  let lastBlend = 0;
  let pendingIndex = -1;
  let sized = false;
  let paintedOnce = false;
  let prefetchTimer = 0;
  let upgradeTimer = 0;

  const paintFrames = (lowerImg, upperImg, blend, lowerKey, upperKey) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      // Layout not ready yet — retry next frame (prevents black empty canvas)
      requestAnimationFrame(() => {
        if (lowerImg) paintFrames(lowerImg, upperImg, blend, lowerKey, upperKey);
      });
      return;
    }
    const resized = !sized ? resizeCanvas(canvas, ctx) : false;
    if (!sized) sized = true;
    drawCoverFrame(canvas, ctx, lowerImg, { clear: !paintedOnce || resized });
    if (blend > 0 && upperImg && upperImg !== lowerImg) {
      drawCoverFrame(canvas, ctx, upperImg, { alpha: blend });
    }
    paintedOnce = true;
    lastDrawnKey = blend >= 0.5 ? upperKey : lowerKey;
    lastDrawnImg = lowerImg;
    lastDrawnUpperImg = upperImg;
    lastDrawnLowerKey = lowerKey;
    lastDrawnUpperKey = upperKey;
    lastBlend = blend;
  };

  const schedulePrefetch = (frameIndex, velocity) => {
    if (prefetchTimer) cancelAnimationFrame(prefetchTimer);
    prefetchTimer = requestAnimationFrame(() => {
      prefetchTimer = 0;
      store.prefetch(frameIndex, { velocity });
      // Hot neighbours — must be ready for the next wheel notch
      for (let d = 1; d <= 4; d += 1) {
        if (frameIndex - d >= 0) store.ensure(frameIndex - d);
        store.ensure(frameIndex + d);
      }
    });
  };

  return {
    getCssSize() {
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    },

    show(framePosition, { velocity = 0 } = {}) {
      const position = Math.max(0, Math.min(store.frameCount - 1, framePosition));
      const lowerKey = Math.floor(position);
      const upperKey = Math.min(store.frameCount - 1, lowerKey + 1);
      const blend = position - lowerKey;
      lastRequested = position;
      pendingIndex = position;

      const lower = store.getBitmap(lowerKey);
      const upper = upperKey === lowerKey ? lower : store.getBitmap(upperKey);
      if (lower && (blend === 0 || upper)) {
        paintFrames(lower, upper || lower, blend, lowerKey, upperKey);
        schedulePrefetch(Math.round(position), velocity);
        return lastDrawnKey;
      } else {
        // Hold the closest ready image while either side of the blend decodes.
        const { key, bitmap } = store.nearestBitmap(Math.round(position));
        if (bitmap && Math.abs(key - position) <= 2 && key !== lastDrawnKey) {
          paintFrames(bitmap, bitmap, 0, key, key);
        }
      }

      const loadLower = lower ? Promise.resolve(lower) : store.ensure(lowerKey);
      const loadUpper = upperKey === lowerKey
        ? loadLower
        : upper ? Promise.resolve(upper) : store.ensure(upperKey);
      Promise.all([loadLower, loadUpper]).then(([lowerBitmap, upperBitmap]) => {
        if (pendingIndex !== position || (!lowerBitmap && !upperBitmap)) return;
        if (upgradeTimer) cancelAnimationFrame(upgradeTimer);
        upgradeTimer = requestAnimationFrame(() => {
          upgradeTimer = 0;
          if (pendingIndex !== position) return;
          const first = lowerBitmap || upperBitmap;
          const second = upperBitmap || first;
          paintFrames(first, second, lowerBitmap && upperBitmap ? blend : 0, lowerKey, upperKey);
        });
      });

      schedulePrefetch(Math.round(position), velocity);
      return lastDrawnKey;
    },

    redraw() {
      sized = false;
      const resized = resizeCanvas(canvas, ctx);
      if (resized) paintedOnce = false;
      if (lastDrawnImg) {
        paintFrames(
          lastDrawnImg,
          lastDrawnUpperImg || lastDrawnImg,
          lastBlend,
          lastDrawnLowerKey,
          lastDrawnUpperKey,
        );
      } else if (lastRequested >= 0) {
        this.show(lastRequested);
      }
    },

    get lastIndex() {
      return lastDrawnKey;
    },

    destroy() {
      if (prefetchTimer) cancelAnimationFrame(prefetchTimer);
      if (upgradeTimer) cancelAnimationFrame(upgradeTimer);
      lastDrawnImg = null;
      lastDrawnUpperImg = null;
      pendingIndex = -1;
      lastDrawnKey = -1;
      lastRequested = -1;
    },
  };
}
