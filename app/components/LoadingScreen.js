'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './LoadingScreen.module.css';

/**
 * Ultra-light splash — homepage only, max ~600ms, no heavy image preloads.
 * Hero poster + frames load on their own; this must never block the site.
 */
export default function LoadingScreen() {
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '';
  const [done, setDone] = useState(!isHome);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setDone(true);
      return undefined;
    }

    const fadeTimer = window.setTimeout(() => setFadeOut(true), 280);
    const doneTimer = window.setTimeout(() => setDone(true), 560);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
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
      </div>
    </div>
  );
}
