/**
 * Native scroll -> progress with a small frame-rate independent easing pass.
 * Scroll position remains the target; the eased value prevents decoded-frame
 * changes from feeling abrupt while the user is moving through the sequence.
 */

export function clamp01(value) {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function getScrollProgress(section) {
  if (!section) return 0;
  const rect = section.getBoundingClientRect();
  const scrollDistance = section.offsetHeight - window.innerHeight;
  return clamp01(-rect.top / Math.max(1, scrollDistance));
}

export function progressToFrameIndex(progress, frameCount) {
  if (frameCount <= 1) return 0;
  return Math.min(frameCount - 1, Math.round(clamp01(progress) * (frameCount - 1)));
}

/** Direct round — no hysteresis (hysteresis felt like sticking / stops). */
export function progressToFrameIndexStable(progress, frameCount) {
  return progressToFrameIndex(progress, frameCount);
}

export function progressToFrameFloat(progress, frameCount) {
  if (frameCount <= 1) return 0;
  return clamp01(progress) * (frameCount - 1);
}

/**
 * @param {HTMLElement} section
 * @param {(progress: number, meta: { velocity: number }) => void} onProgress
 */
export function bindScrollProgress(section, onProgress) {
  let active = true;
  let enabled = true;
  let rafId = 0;
  let queued = false;
  let lastY = window.scrollY;
  let velocity = 0;
  let lastEmitted = -1;
  let targetProgress = 0;
  let easedProgress = 0;
  let lastTime = performance.now();

  const emitNow = () => {
    queued = false;
    rafId = 0;
    if (!active || !enabled) return;

    targetProgress = getScrollProgress(section);
    const dy = window.scrollY - lastY;
    lastY = window.scrollY;
    velocity = velocity * 0.65 + dy * 0.35;

    const now = performance.now();
    const delta = Math.min(64, Math.max(1, now - lastTime));
    lastTime = now;
    const blend = 1 - Math.exp(-delta / 54);
    easedProgress += (targetProgress - easedProgress) * blend;

    if (Math.abs(easedProgress - lastEmitted) < 0.00001) {
      if (Math.abs(targetProgress - easedProgress) > 0.00001) {
        kick();
      }
      return;
    }
    lastEmitted = easedProgress;
    onProgress(easedProgress, { velocity });
  };

  const kick = () => {
    if (!active || !enabled || queued) return;
    queued = true;
    rafId = requestAnimationFrame(emitNow);
  };

  const onScroll = () => kick();

  const onResize = () => {
    lastY = window.scrollY;
    lastEmitted = -1;
    targetProgress = getScrollProgress(section);
    easedProgress = targetProgress;
    lastTime = performance.now();
    emitNow();
  };

  emitNow();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  const destroy = () => {
    active = false;
    queued = false;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  destroy.setEnabled = (next) => {
    if (enabled === next) return;
    enabled = next;
    if (!enabled) {
      queued = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    } else {
      lastY = window.scrollY;
      lastEmitted = -1;
      emitNow();
    }
  };

  return destroy;
}
