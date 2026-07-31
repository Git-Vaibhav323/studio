/**
 * Hero scroll-frame sequence configuration.
 * Paths match output of `npm run generate:hero-frames`.
 */

export const HERO_FRAMES_BASE = '/hero/frames';
export const HERO_MANIFEST_URL = `${HERO_FRAMES_BASE}/manifest.json`;

/** Fallback when manifest is unavailable (must match last generate run). */
export const HERO_FRAME_COUNT_FALLBACK = 269;
export const HERO_FRAME_WIDTH_FALLBACK = 3840;
export const HERO_FRAME_HEIGHT_FALLBACK = 2160;

export const HERO_FRAME_PAD = 4;
export const HERO_FRAME_EXT = 'webp';

/** Title fade windows mapped to scroll progress 0–1. */
export const TITLE_RANGES = [
  { start: 0, fadeInEnd: 0, fadeOutStart: 0.14, end: 0.23 },
  { start: 0.34, fadeInEnd: 0.4, fadeOutStart: 0.53, end: 0.6 },
  { start: 0.7, fadeInEnd: 0.77, fadeOutStart: 0.9, end: 0.97 },
];

export function frameUrl(index, { pad = HERO_FRAME_PAD, ext = HERO_FRAME_EXT } = {}) {
  const n = String(index + 1).padStart(pad, '0');
  return `${HERO_FRAMES_BASE}/frame_${n}.${ext}`;
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

/**
 * How densely to index frames on weaker devices (decode step).
 * Keep step at 1 so scroll up/down advances one frame at a time.
 */
export function resolveFrameStep() {
  if (typeof window === 'undefined') return 1;
  if (navigator.connection?.saveData === true) return 2;
  return 1;
}

/**
 * Max decoded ImageBitmaps retained.
 * Sized for smooth scrubbing without holding all 4K bitmaps.
 */
export function resolveDecodeMaxWidth() {
  if (typeof window === 'undefined') return 1600;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  // Faster decode = fewer scrub gaps (still sharp on retina displays)
  if (mobile) return 1280;
  return 1600;
}

export function resolveBitmapBudget() {
  if (typeof window === 'undefined') return 96;

  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const memory = navigator.deviceMemory;

  if (mobile || (memory != null && memory <= 4)) return 56;
  if (memory != null && memory <= 8) return 80;
  return 120;
}
