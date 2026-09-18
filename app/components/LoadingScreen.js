'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from './LoadingScreen.module.css';
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

// ─── Floor plan path definition ───────────────────────────────────────────────
// A simplified architectural floor plan drawn as a single SVG path.
// Rooms are drawn left-to-right, bottom-to-top — outer walls first, then
// interior partitions, then door notches. All coordinates fit in a 280×200 viewBox.
const PLAN_PATH = `
  M 20,180
  L 20,20
  L 260,20
  L 260,180
  L 160,180
  L 160,160
  L 200,160
  L 200,120
  L 260,120
  M 160,180
  L 20,180
  M 80,180
  L 80,120
  L 160,120
  L 160,180
  M 80,120
  L 80,60
  L 160,60
  L 160,20
  M 160,120
  L 260,120
  M 80,60
  L 20,60
  M 140,60
  L 140,120
  M 200,120
  L 200,60
  L 260,60
  M 200,60
  L 260,60
  M 48,60
  L 48,20
  M 20,100
  L 80,100
  M 170,160
  L 200,160
`
  .trim()
  .replace(/\n\s*/g, ' ');

// Total path length — measured empirically for this exact path.
// We compute it from the SVG element at runtime instead.
const VIEWBOX = '0 0 280 200';

export default function LoadingScreen() {
  const pathname  = usePathname();
  const isHome    = pathname === '/' || pathname === '';

  const [progress, setProgress] = useState(0);
  const [done,     setDone]     = useState(!isHome);
  const [fadeOut,  setFadeOut]  = useState(false);

  const pathRef       = useRef(null);
  const dotRef        = useRef(null);
  const totalLenRef   = useRef(0);
  const rafRef        = useRef(0);
  const displayedRef  = useRef(0);  // smoothed display value
  const targetRef     = useRef(0);

  // Compute total path length once the SVG is mounted
  const onPathMount = useCallback((el) => {
    pathRef.current = el;
    if (el) {
      totalLenRef.current = el.getTotalLength?.() ?? 900;
      // Start fully hidden
      el.style.strokeDasharray  = `${totalLenRef.current}`;
      el.style.strokeDashoffset = `${totalLenRef.current}`;
    }
  }, []);

  // rAF loop — smoothly animate the drawn line to match progress
  useEffect(() => {
    if (done || !isHome) return;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const target    = targetRef.current;
      const current   = displayedRef.current;
      // Ease toward target — fast catch-up, smooth feel
      const next      = current + (target - current) * 0.06;
      displayedRef.current = next;

      const totalLen  = totalLenRef.current;
      if (!totalLen || !pathRef.current) return;

      const drawn   = (next / 100) * totalLen;
      const offset  = totalLen - drawn;

      pathRef.current.style.strokeDashoffset = `${offset}`;

      // Move dot to tip of drawn line
      if (dotRef.current && pathRef.current.getPointAtLength) {
        const pt = pathRef.current.getPointAtLength(Math.min(drawn, totalLen - 0.1));
        dotRef.current.setAttribute('cx', String(pt.x));
        dotRef.current.setAttribute('cy', String(pt.y));
        dotRef.current.style.opacity = next < 1 ? '0' : '1';
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [done, isHome]);

  useEffect(() => {
    if (!isHome) { setDone(true); return undefined; }

    let cancelled = false;
    document.documentElement.style.overflow = 'hidden';

    const onProgress = (e) => {
      const next = e.detail?.progress ?? getBootProgress();
      targetRef.current = next;
      setProgress(next);
    };

    window.addEventListener(BOOT_EVENTS.PROGRESS_EVENT, onProgress);

    (async () => {
      const total  = CRITICAL_SITE_IMAGES.length;
      let   loaded = 0;
      await Promise.all(
        CRITICAL_SITE_IMAGES.map(async (src) => {
          await preloadImage(src);
          loaded += 1;
          if (!cancelled && !isBootReady()) {
            reportBootProgress(
              Math.min(25, Math.round((loaded / total) * 25)),
              'Loading visuals',
            );
          }
        }),
      );
    })();

    const failSafe = window.setTimeout(() => {
      if (!cancelled) markBootReady();
    }, 18000);

    waitForBootReady().then(() => {
      if (cancelled) return;
      window.clearTimeout(failSafe);
      targetRef.current = 100;
      setProgress(100);

      // Hold at 100% briefly so the complete floor plan is visible
      window.setTimeout(() => {
        if (cancelled) return;
        setFadeOut(true);
        window.setTimeout(() => {
          if (!cancelled) {
            setDone(true);
            document.documentElement.style.overflow = '';
          }
        }, 900);
      }, 600);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      window.removeEventListener(BOOT_EVENTS.PROGRESS_EVENT, onProgress);
      document.documentElement.style.overflow = '';
      cancelAnimationFrame(rafRef.current);
    };
  }, [isHome]);

  if (done) return null;

  return (
    <div
      className={`${styles.loader} ${fadeOut ? styles.loaderDone : ''}`}
      aria-hidden="true"
      aria-label="Loading"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Subtle warm radial bg */}
      <div className={styles.bg} />

      <div className={styles.content}>

        {/* Logo */}
        <div className={styles.logoWrap}>
          <Image
            src="/logo.png"
            alt="The Spatial Edit"
            width={72}
            height={72}
            style={{ objectFit: 'contain', display: 'block', margin: '0 auto' }}
            priority
          />
          <div className={styles.logoName}>The Spatial Edit</div>
          <div className={styles.logoSub}>Interior Design Studio</div>
        </div>

        {/* Floor plan SVG */}
        <div className={styles.planWrap}>
          {/* Room labels — faint, appear as sections complete */}
          <svg
            className={styles.planSvg}
            viewBox={VIEWBOX}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Grid dots — architectural reference */}
            {[20,80,140,200,260].map(x =>
              [20,60,120,180].map(y => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="1"
                  fill="rgba(180,144,79,0.18)" />
              ))
            )}

            {/* Shadow line — ghost of the full plan */}
            <path
              d={PLAN_PATH}
              stroke="rgba(180,144,79,0.12)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Active drawn line — progress controlled via JS ref */}
            <path
              ref={onPathMount}
              d={PLAN_PATH}
              stroke="rgba(180,144,79,0.9)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ transition: 'none' }}
            />

            {/* Travelling dot — positioned by JS ref */}
            <circle
              ref={dotRef}
              cx="20" cy="180" r="2.5"
              fill="#b4904f"
              style={{ opacity: 0, filter: 'drop-shadow(0 0 3px rgba(180,144,79,0.8))' }}
            />

            {/* Room label overlays — very faint architectural text */}
            <text x="38" y="145" className={styles.roomLabel}>LIVING</text>
            <text x="92" y="145" className={styles.roomLabel}>DINING</text>
            <text x="92" y="95" className={styles.roomLabel}>KITCHEN</text>
            <text x="170" y="145" className={styles.roomLabel}>BEDROOM</text>
            <text x="170" y="95" className={styles.roomLabel}>STUDY</text>
            <text x="28" y="42" className={styles.roomLabel}>ENTRY</text>
          </svg>

          {/* Compass rose — bottom right of plan */}
          <div className={styles.compass} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(180,144,79,0.25)" strokeWidth="0.8"/>
              <line x1="12" y1="4" x2="12" y2="20" stroke="rgba(180,144,79,0.4)" strokeWidth="0.8"/>
              <line x1="4" y1="12" x2="20" y2="12" stroke="rgba(180,144,79,0.4)" strokeWidth="0.8"/>
              <polygon points="12,5 13.2,11 12,10.5 10.8,11" fill="rgba(180,144,79,0.7)"/>
              <text x="11.2" y="3.5" style={{fontSize:'3px',fill:'rgba(180,144,79,0.6)',fontFamily:'serif'}}>N</text>
            </svg>
          </div>
        </div>

        {/* Percentage — refined, minimal */}
        <div className={styles.meta}>
          <span className={styles.metaLabel}>PREPARING SPACE</span>
          <span className={styles.metaPct}>{String(progress).padStart(2,'0')}%</span>
        </div>

      </div>
    </div>
  );
}
