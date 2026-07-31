/**
 * Symmetric scroll → progress for enter + exit alignment.
 * Light time-based smoothing (same both directions) kills wheel jitter
 * without lagging one way more than the other.
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

/**
 * Symmetric frame pick — same threshold entering and exiting.
 * Small hysteresis (0.5) prevents boundary flicker both ways.
 */
export function progressToFrameIndexStable(progress, frameCount, lastFrame = -1) {
  if (frameCount <= 1) return 0;
  const exact = clamp01(progress) * (frameCount - 1);
  const rounded = Math.round(exact);

  if (lastFrame < 0 || lastFrame === rounded) {
    return Math.min(frameCount - 1, Math.max(0, rounded));
  }

  // Identical threshold both directions
  const threshold = 0.52;
  if (rounded > lastFrame) {
    return exact >= lastFrame + threshold ? Math.min(frameCount - 1, rounded) : lastFrame;
  }
  return exact <= lastFrame - threshold ? Math.max(0, rounded) : lastFrame;
}

export function progressToFrameFloat(progress, frameCount) {
  if (frameCount <= 1) return 0;
  return clamp01(progress) * (frameCount - 1);
}

/**
 * @param {HTMLElement} section
 * @param {(progress: number, meta: { velocity: number }) => void} onProgress
 * @param {{ smoothing?: number }} [options]
 */
export function bindScrollProgress(section, onProgress, options = {}) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Symmetric smoothing — identical enter/exit response
  const smoothing = reduceMotion ? 80 : (options.smoothing ?? 18);

  let active = true;
  let enabled = true;
  let rafId = 0;
  let running = false;
  let targetProgress = getScrollProgress(section);
  let currentProgress = targetProgress;
  let velocity = 0;
  let lastY = window.scrollY;
  let lastTime = performance.now();
  let lastEmitted = -1;

  const emit = (progress) => {
    if (Math.abs(progress - lastEmitted) < 0.00004) return;
    lastEmitted = progress;
    onProgress(progress, { velocity });
  };

  const tick = (now) => {
    if (!active) return;

    const dt = Math.min(0.048, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;

    targetProgress = getScrollProgress(section);

    const dy = window.scrollY - lastY;
    lastY = window.scrollY;
    velocity = velocity * 0.75 + dy * 0.25;

    const diff = targetProgress - currentProgress;
    // Same exponential ease both ways
    const alpha = 1 - Math.exp(-smoothing * dt);
    currentProgress += diff * alpha;

    // No overshoot either direction
    if (diff > 0) currentProgress = Math.min(currentProgress, targetProgress);
    else currentProgress = Math.max(currentProgress, targetProgress);

    emit(currentProgress);

    const settled = Math.abs(targetProgress - currentProgress) < 0.00012 && Math.abs(dy) < 0.4;
    if (settled) {
      currentProgress = targetProgress;
      emit(currentProgress);
      running = false;
      rafId = 0;
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  const kick = () => {
    if (!active || !enabled) return;
    if (!running) {
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  };

  const onScroll = () => kick();

  const onResize = () => {
    targetProgress = getScrollProgress(section);
    currentProgress = targetProgress;
    lastY = window.scrollY;
    emit(currentProgress);
  };

  emit(currentProgress);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  const destroy = () => {
    active = false;
    running = false;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const setEnabled = (next) => {
    if (enabled === next) return;
    enabled = next;
    if (!enabled) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    } else {
      // Re-sync so we don't jump when returning to the hero.
      lastY = window.scrollY;
      lastTime = performance.now();
      currentProgress = getScrollProgress(section);
      targetProgress = currentProgress;
      emit(currentProgress);
    }
  };

  destroy.destroy = destroy;
  destroy.setEnabled = setEnabled;
  return destroy;
}
