'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeroSection.module.css';
import { TITLE_RANGES, titleOpacity, frameUrl } from '../hero/config';
import { loadFrameSequence, snapToLoadedFrame } from '../hero/loadFrames';
import { bindScrollProgress, progressToFrameIndex, getScrollProgress } from '../hero/scrollProgress';
import { createFrameRenderer } from '../hero/frameRenderer';
import { markBootReady, reportBootProgress } from '../boot/siteBoot';

const POSTER_SRC = frameUrl(0);

export default function HeroSection() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRefs = useRef([]);
  const cueRef = useRef(null);
  const progressBarRef = useRef(null);

  const [canvasLive, setCanvasLive] = useState(false);

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
    let visibilityObserver = null;
    let frameCount = 0;
    let step = 1;
    let lastFrame = -1;
    let lastChromeProgress = -1;
    let scrollBound = false;

    const updateChrome = (progress) => {
      if (Math.abs(progress - lastChromeProgress) < 0.003) return;
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
      }
    };

    const paintForProgress = (progress, velocity = 0) => {
      if (!renderer || frameCount <= 0) return;
      const index = snapToLoadedFrame(
        progressToFrameIndex(progress, frameCount),
        frameCount,
        step,
      );
      lastFrame = index;
      renderer.show(index, { velocity });
      updateChrome(progress);
    };

    const bindScrollIfNeeded = () => {
      const section = heroRef.current;
      if (!section || scrollBound || !store) return;
      scrollBound = true;

      unbindScroll = bindScrollProgress(section, (progress, meta) => {
        paintForProgress(progress, meta?.velocity ?? 0);
      });

      visibilityObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries[0]?.isIntersecting ?? true;
          store?.setActive(visible);
          unbindScroll?.setEnabled?.(visible);
        },
        { rootMargin: '150px 0px' },
      );
      visibilityObserver.observe(section);

      paintForProgress(getScrollProgress(section));
    };

    (async () => {
      try {
        reportBootProgress(8, 'Loading hero');

        const result = await loadFrameSequence({
          signal: controller.signal,
          blockingCount: 72,
          onProgress: (loaded, total) => {
            // Hero owns ~25–95% of the splash bar
            const pct = 25 + Math.round((loaded / Math.max(1, total)) * 70);
            reportBootProgress(pct, 'Preparing scroll');
          },
          onFirstFrame: ({ store: frameStore, frameCount: count, step: frameStep }) => {
            if (controller.signal.aborted) return;
            store = frameStore;
            frameCount = count;
            step = frameStep;
            renderer = createFrameRenderer(canvas, store);

            const painted = renderer.show(0, { force: true });
            lastFrame = 0;
            updateChrome(0);
            if (painted >= 0 || store.getBitmap(0)) {
              setCanvasLive(true);
            }

            let resizeRaf = 0;
            resizeObserver = new ResizeObserver(() => {
              if (resizeRaf) return;
              resizeRaf = requestAnimationFrame(() => {
                resizeRaf = 0;
                renderer?.redraw();
              });
            });
            resizeObserver.observe(canvas);
          },
        });

        if (controller.signal.aborted) return;

        store = result.store;
        frameCount = result.frameCount;
        step = result.step;
        setCanvasLive(true);
        bindScrollIfNeeded();

        reportBootProgress(98, 'Almost ready');
        markBootReady();
      } catch (err) {
        console.warn('Hero frame load failed', err);
        // Don't trap the splash forever
        markBootReady();
      }
    })();

    return () => {
      controller.abort();
      unbindScroll?.();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      renderer?.destroy();
      store?.dispose();
      root.style.scrollBehavior = prevScrollBehavior;
    };
  }, []);

  return (
    <section id="hero" className={styles.hero} ref={heroRef} aria-label="The Spatial Edit introduction">
      <div className={styles.sticky}>
        <img
          className={styles.poster}
          src={POSTER_SRC}
          alt=""
          width={1600}
          height={900}
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />

        <canvas
          ref={canvasRef}
          className={styles.sequence}
          aria-label="Contemporary residence designed around effortless living"
          style={{ opacity: canvasLive ? 1 : 0 }}
        />

        <div className={styles.vignette} aria-hidden="true" />

        <div className={styles.titleStage} aria-live="off">
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

        <div className={styles.scrollCue} ref={cueRef} aria-hidden="true">
          <span>Scroll to explore</span>
          <i />
        </div>

        <div className={styles.progressTrack} aria-hidden="true">
          <span ref={progressBarRef} />
        </div>
      </div>
    </section>
  );
}
