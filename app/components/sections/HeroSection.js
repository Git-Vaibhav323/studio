'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeroSection.module.css';
import { TITLE_RANGES, titleOpacity } from '../hero/config';
import { loadFrameSequence, snapToLoadedFrame } from '../hero/loadFrames';
import { bindScrollProgress, progressToFrameIndexStable } from '../hero/scrollProgress';
import { createFrameRenderer } from '../hero/frameRenderer';

export default function HeroSection() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRefs = useRef([]);
  const cueRef = useRef(null);
  const progressBarRef = useRef(null);

  const [loadPercent, setLoadPercent] = useState(0);
  const [hasPoster, setHasPoster] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const root = document.documentElement;
    const prevScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    const controller = new AbortController();
    let renderer = null;
    let store = null;
    let unbindScroll = null;
    let resizeObserver = null;
    let frameCount = 0;
    let step = 1;
    let lastFrame = -1;
    let lastChromeProgress = -1;

    const updateChrome = (progress) => {
      if (Math.abs(progress - lastChromeProgress) < 0.002) return;
      lastChromeProgress = progress;

      titleRefs.current.forEach((el, index) => {
        if (!el) return;
        const opacity = titleOpacity(progress, TITLE_RANGES[index]);
        el.style.opacity = String(opacity);
        el.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
      });

      if (cueRef.current) {
        cueRef.current.style.opacity = String(Math.max(0, 1 - progress * 8));
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress * 100}%`;
        progressBarRef.current.style.transform = 'none';
      }
    };

    const paintForProgress = (progress, velocity = 0) => {
      if (!renderer) return;
      const raw = progressToFrameIndexStable(progress, frameCount, lastFrame);
      const index = snapToLoadedFrame(raw, frameCount, step);
      lastFrame = index;
      renderer.show(index, { velocity });
      updateChrome(progress);
    };

    (async () => {
      const result = await loadFrameSequence({
        signal: controller.signal,
        getTargetSize: () => {
          const rect = canvas.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        },
        onProgress: (loaded, total) => {
          setLoadPercent(Math.round((loaded / Math.max(1, total)) * 100));
        },
        onFirstFrame: ({ store: frameStore, frameCount: count, step: frameStep }) => {
          if (controller.signal.aborted) return;
          store = frameStore;
          frameCount = count;
          step = frameStep;
          renderer = createFrameRenderer(canvas, store);
          renderer.show(0, { force: true });
          lastFrame = 0;
          updateChrome(0);
          setHasPoster(true);

          resizeObserver = new ResizeObserver(() => {
            renderer?.redraw();
          });
          resizeObserver.observe(canvas);
        },
      });

      if (controller.signal.aborted) return;

      store = result.store;
      frameCount = result.frameCount;
      step = result.step;

      const section = heroRef.current;
      if (section) {
        unbindScroll = bindScrollProgress(
          section,
          (progress, meta) => {
            paintForProgress(progress, meta?.velocity ?? 0);
          },
          { smoothing: 18 },
        );
      }

      setIsReady(true);
      paintForProgress(0);
    })();

    return () => {
      controller.abort();
      unbindScroll?.();
      resizeObserver?.disconnect();
      renderer?.destroy();
      store?.dispose();
      root.style.scrollBehavior = prevScrollBehavior;
    };
  }, []);

  return (
    <section id="hero" className={styles.hero} ref={heroRef} aria-label="The Spatial Edit introduction">
      <div className={styles.sticky}>
        <canvas
          ref={canvasRef}
          className={styles.sequence}
          aria-label="Contemporary residence designed around effortless living"
          style={{ opacity: hasPoster ? 1 : 0 }}
        />

        <div className={styles.vignette} aria-hidden="true" />

        <div
          className={styles.titleStage}
          aria-live="off"
          style={{ opacity: hasPoster ? 1 : 0 }}
        >
          <div
            ref={(node) => { titleRefs.current[0] = node; }}
            className={`${styles.titleCard} ${styles.titleLeft} ${styles.titleVisible}`}
          >
            <p className={styles.kicker}>The Spatial Edit</p>
            <h1>Spaces designed<br />to work.</h1>
            <p className={styles.accent}>Finished to last.</p>
          </div>

          <div
            ref={(node) => { titleRefs.current[1] = node; }}
            className={`${styles.titleCard} ${styles.titleRight}`}
          >
            <p className={styles.kicker}>Spatial intelligence</p>
            <h2>Every detail begins<br />with how you live.</h2>
          </div>

          <div
            ref={(node) => { titleRefs.current[2] = node; }}
            className={`${styles.titleCard} ${styles.titleCenter}`}
          >
            <p className={styles.kicker}>Form follows life</p>
            <h2>Beautiful spaces.<br />Effortless living.</h2>
          </div>
        </div>

        <div
          className={styles.scrollCue}
          ref={cueRef}
          aria-hidden="true"
          style={{ opacity: isReady ? 1 : 0 }}
        >
          <span>Scroll to explore</span>
          <i />
        </div>

        <div
          className={styles.progressTrack}
          aria-hidden="true"
          style={{ opacity: isReady ? 1 : 0 }}
        >
          <span ref={progressBarRef} />
        </div>

        {/* Compact prepare chip — image stays visible underneath */}
        {!isReady && (
          <div className={`${styles.prepareChip} ${hasPoster ? styles.prepareChipOverImage : ''}`}>
            {!hasPoster && (
              <div className={styles.prepareBrand}>
                <p className={styles.prepareKicker}>The Spatial Edit</p>
                <p className={styles.prepareTitle}>Crafting your experience</p>
              </div>
            )}
            <div className={styles.prepareMeta}>
              <span>{hasPoster ? 'Optimizing scroll' : 'Loading visuals'}</span>
              <span>{loadPercent}%</span>
            </div>
            <div className={styles.prepareBar}>
              <span style={{ width: `${Math.max(loadPercent, hasPoster ? 8 : 2)}%` }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
