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

export function drawCoverFrame(canvas, ctx, img, { clear = false } = {}) {
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
  ctx.imageSmoothingQuality = 'low';
  ctx.drawImage(img, ox, oy, dw, dh);
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
  let pendingIndex = -1;
  let sized = false;
  let paintedOnce = false;
  let prefetchTimer = 0;
  let upgradeTimer = 0;

  const paintImage = (img, key) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      // Layout not ready yet — retry next frame (prevents black empty canvas)
      requestAnimationFrame(() => {
        if (img) paintImage(img, key);
      });
      return;
    }
    const resized = !sized ? resizeCanvas(canvas, ctx) : false;
    if (!sized) sized = true;
    drawCoverFrame(canvas, ctx, img, { clear: !paintedOnce || resized });
    paintedOnce = true;
    lastDrawnKey = key;
    lastDrawnImg = img;
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

    show(frameIndex, { force = false, velocity = 0 } = {}) {
      if (!force && frameIndex === lastDrawnKey && store.getBitmap(frameIndex)) {
        schedulePrefetch(frameIndex, velocity);
        return lastDrawnKey;
      }

      lastRequested = frameIndex;
      pendingIndex = frameIndex;

      const exact = store.getBitmap(frameIndex);
      if (exact) {
        paintImage(exact, frameIndex);
        schedulePrefetch(frameIndex, velocity);
        return lastDrawnKey;
      }

      // Prefer closest ready frame within ±2 so motion continues without jumps.
      const { key, bitmap } = store.nearestBitmap(frameIndex);
      if (bitmap && key >= 0 && Math.abs(key - frameIndex) <= 2) {
        if (key !== lastDrawnKey) paintImage(bitmap, key);
      }

      store.ensure(frameIndex).then((bmp) => {
        if (pendingIndex !== frameIndex || !bmp) return;
        if (upgradeTimer) cancelAnimationFrame(upgradeTimer);
        upgradeTimer = requestAnimationFrame(() => {
          upgradeTimer = 0;
          if (pendingIndex !== frameIndex) return;
          if (frameIndex !== lastDrawnKey || bmp !== lastDrawnImg) {
            paintImage(bmp, frameIndex);
          }
        });
      });

      schedulePrefetch(frameIndex, velocity);
      return lastDrawnKey;
    },

    redraw() {
      sized = false;
      const resized = resizeCanvas(canvas, ctx);
      if (resized) paintedOnce = false;
      if (lastDrawnImg) {
        paintImage(lastDrawnImg, lastDrawnKey);
      } else if (lastRequested >= 0) {
        store.ensure(lastRequested).then((bmp) => {
          if (bmp) paintImage(bmp, lastRequested);
        });
      }
    },

    get lastIndex() {
      return lastDrawnKey;
    },

    destroy() {
      if (prefetchTimer) cancelAnimationFrame(prefetchTimer);
      if (upgradeTimer) cancelAnimationFrame(upgradeTimer);
      lastDrawnImg = null;
      lastDrawnKey = -1;
      lastRequested = -1;
    },
  };
}
