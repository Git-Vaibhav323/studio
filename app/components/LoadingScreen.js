'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './LoadingScreen.module.css';

/** Minimal boot assets — never preload multi‑MB maps / unused room shots. */
const HOME_BOOT_ASSETS = [
  '/images/bg/bg-sec-2.webp',
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.decoding = 'async';
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });
}

export default function LoadingScreen() {
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '';

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(!isHome);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setDone(true);
      return undefined;
    }

    let cancelled = false;
    const assets = HOME_BOOT_ASSETS;
    let loaded = 0;

    const finish = () => {
      if (cancelled) return;
      setProgress(100);
      // Short fade — don't hold the page hostage
      window.setTimeout(() => {
        if (cancelled) return;
        setFadeOut(true);
        window.setTimeout(() => {
          if (!cancelled) setDone(true);
        }, 400);
      }, 180);
    };

    // Hard timeout so a stalled asset never blocks the site
    const timeoutId = window.setTimeout(finish, 1800);

    Promise.all(
      assets.map((src) =>
        preloadImage(src).then(() => {
          loaded += 1;
          if (!cancelled) {
            setProgress(Math.round((loaded / Math.max(1, assets.length)) * 100));
          }
        }),
      ),
    ).then(() => {
      window.clearTimeout(timeoutId);
      finish();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isHome]);

  if (done) return null;

  return (
    <div className={`${styles.loader} ${fadeOut ? styles.loaderDone : ''}`} aria-hidden="true">
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <div className={styles.brandSection}>
            <h1 className={styles.brand}>The Spatial Edit</h1>
            <p className={styles.subtitle}>Spaces designed to work. Finished to last.</p>
          </div>
        </div>
        <div className={styles.progressSection}>
          <div className={styles.progressMeta}>
            <span className={styles.loadingText}>Loading</span>
            <span className={styles.percentText}>{progress}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
