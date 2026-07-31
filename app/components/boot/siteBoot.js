/**
 * Homepage boot coordinator — LoadingScreen waits until hero (+ critical
 * assets) are warm so the site feels instant after the splash, not delayed.
 */

const PROGRESS_EVENT = 'tse:boot-progress';
const READY_EVENT = 'tse:boot-ready';

let ready = false;
let progress = 0;
/** @type {Array<() => void>} */
const readyWaiters = [];

export function reportBootProgress(pct, label = '') {
  progress = Math.max(0, Math.min(100, Math.round(pct)));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PROGRESS_EVENT, { detail: { progress, label } }),
    );
  }
}

export function markBootReady() {
  if (ready) return;
  ready = true;
  progress = 100;
  reportBootProgress(100, 'Ready');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(READY_EVENT));
  }
  while (readyWaiters.length) {
    try { readyWaiters.shift()?.(); } catch { /* ignore */ }
  }
}

export function isBootReady() {
  return ready;
}

export function getBootProgress() {
  return progress;
}

export function waitForBootReady() {
  if (ready) return Promise.resolve();
  return new Promise((resolve) => {
    readyWaiters.push(resolve);
  });
}

export const BOOT_EVENTS = { PROGRESS_EVENT, READY_EVENT };

/** Critical below-hero images to warm during splash (small set). */
export const CRITICAL_SITE_IMAGES = [
  '/images/bg/bg-sec-2.webp',
  '/images/bg/bg-sec-3.webp',
  '/images/bg/bg-sec-4.webp',
  '/images/rightfinal2.png',
  '/images/with_spatial_room.png',
  '/images/without_spatial_room.png',
  '/images/card_circulation.png',
  '/images/card_proportion.png',
  '/images/card_light.png',
];

export function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.decoding = 'async';
    img.onload = resolve;
    img.onerror = resolve;
    img.src = src;
  });
}
