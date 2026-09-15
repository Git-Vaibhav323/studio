'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './LoadingScreen.module.css';
import Image from 'next/image';
import {
  BOOT_EVENTS,
  CRITICAL_SITE_IMAGES,
  getBootProgress,
  isBootReady,
  markBootReady,
  preloadImage,
  reportBootProgress,
  waitForBootReady,
} from './boot/siteBoot';

/**
 * Homepage splash: waits until hero frames + critical images are warm.
 * Longer start load is OK — site should feel instant after this dismisses.
 */
export default function LoadingScreen() {
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '';

  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('Preparing experience');
  const [done, setDone] = useState(!isHome);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setDone(true);
      return undefined;
    }

    let cancelled = false;
    document.documentElement.style.overflow = 'hidden';

    const onProgress = (e) => {
      const next = e.detail?.progress ?? getBootProgress();
      const nextLabel = e.detail?.label;
      setProgress(next);
      if (nextLabel) setLabel(nextLabel);
    };

    window.addEventListener(BOOT_EVENTS.PROGRESS_EVENT, onProgress);

    // Warm critical section images in parallel with hero boot
    (async () => {
      const total = CRITICAL_SITE_IMAGES.length;
      let loaded = 0;
      await Promise.all(
        CRITICAL_SITE_IMAGES.map(async (src) => {
          await preloadImage(src);
          loaded += 1;
          if (!cancelled && !isBootReady()) {
            // Images contribute up to ~25% while hero owns the rest
            reportBootProgress(Math.min(25, Math.round((loaded / total) * 25)), 'Loading visuals');
          }
        }),
      );
    })();

    // Hard ceiling so a stalled network never traps users forever
    const failSafe = window.setTimeout(() => {
      if (!cancelled) markBootReady();
    }, 18000);

    waitForBootReady().then(() => {
      if (cancelled) return;
      window.clearTimeout(failSafe);
      setProgress(100);
      setLabel('Ready');
      window.setTimeout(() => {
        if (cancelled) return;
        setFadeOut(true);
        window.setTimeout(() => {
          if (!cancelled) {
            setDone(true);
            document.documentElement.style.overflow = '';
          }
        }, 500);
      }, 220);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      window.removeEventListener(BOOT_EVENTS.PROGRESS_EVENT, onProgress);
      document.documentElement.style.overflow = '';
    };
  }, [isHome]);

  if (done) return null;

  return (
    <div className={`${styles.loader} ${fadeOut ? styles.loaderDone : ''}`} aria-hidden="true">
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <div className={styles.brandSection}>
            <Image
              src="/logo.png"
              alt="The Spatial Edit"
              width={200}
              height={60}
              style={{ objectFit: 'contain' }}
              priority
            />
            <p className={styles.subtitle}>Spaces designed to work. Finished to last.</p>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressMeta}>
            <span className={styles.loadingText}>{label}</span>
            <span className={styles.percentText}>{progress}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ transform: `scaleX(${Math.max(progress, 4) / 100})` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
