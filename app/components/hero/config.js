/**
 * Hero scroll-frame sequence — EZGIF JPG frames in /public/hero/frames.
 */

export const HERO_FRAMES_BASE = '/hero/frames';
export const HERO_MANIFEST_URL = `${HERO_FRAMES_BASE}/manifest.json`;

export const HERO_FRAME_COUNT_FALLBACK = 269;
export const HERO_FRAME_WIDTH_FALLBACK = 1600;
export const HERO_FRAME_HEIGHT_FALLBACK = 900;

export const HERO_FRAME_PREFIX = 'ezgif-frame-';
export const HERO_FRAME_PAD = 3;
export const HERO_FRAME_EXT = 'jpg';

export const TITLE_RANGES = [
  { start: 0, fadeInEnd: 0, fadeOutStart: 0.14, end: 0.23 },
  { start: 0.34, fadeInEnd: 0.4, fadeOutStart: 0.53, end: 0.6 },
  { start: 0.7, fadeInEnd: 0.77, fadeOutStart: 0.9, end: 0.97 },
];

export function frameUrl(index, {
  pad = HERO_FRAME_PAD,
  ext = HERO_FRAME_EXT,
  prefix = HERO_FRAME_PREFIX,
} = {}) {
  const n = String(index + 1).padStart(pad, '0');
  return `${HERO_FRAMES_BASE}/${prefix}${n}.${ext}`;
}

export function titleOpacity(progress, range) {
  if (progress < range.start || progress > range.end) return 0;
  if (range.fadeInEnd > range.start && progress < range.fadeInEnd) {
    return (progress - range.start) / (range.fadeInEnd - range.start);
  }
  if (progress > range.fadeOutStart) {
    return (range.end - progress) / (range.end - range.fadeOutStart);
  }
  return 1;
}

/** Always step 1 — skipping frames looks like stutter/stops. */
export function resolveFrameStep() {
  return 1;
}

/**
 * Fixed decode width. Independent of viewport so we never wipe the
 * ImageBitmap cache on resize (that was a major flicker cause).
 */
export function resolveDecodeMaxWidth() {
  if (typeof window === 'undefined') return 1280;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const memory = navigator.deviceMemory;
  if (mobile || (memory != null && memory <= 4)) return 960;
  if (memory != null && memory <= 8) return 1120;
  return 1280;
}

export function resolveBitmapBudget() {
  if (typeof window === 'undefined') return 72;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const memory = navigator.deviceMemory;
  if (mobile || (memory != null && memory <= 4)) return 40;
  if (memory != null && memory <= 8) return 60;
  return 80;
}

export function resolvePrefetchRadius() {
  if (typeof window === 'undefined') return 20;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  return mobile ? 12 : 24;
}
