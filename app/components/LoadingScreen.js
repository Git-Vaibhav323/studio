'use client';

import { useEffect, useState, useRef } from 'react';
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

// ─── Floor plan path ──────────────────────────────────────────────────────────
// Simplified architectural floor plan in a 300×220 viewBox
const PLAN_PATH = [
  'M 20,200',   // start bottom-left
  'L 20,20',    // left wall up
  'L 280,20',   // top wall across
  'L 280,200',  // right wall down
  'L 20,200',   // bottom wall back (close outer)
  // Interior partitions
  'M 100,200 L 100,120', // vertical divider left
  'M 100,120 L 280,120', // horizontal mid-right
  'M 180,120 L 180,20',  // vertical divider right
  'M 100,120 L 100,20',  // full vertical left
  'M 20,100 L 100,100',  // horizontal left section
  'M 180,160 L 280,160', // horizontal right section
  // Door notches (small gaps shown as arcs)
  'M 100,70 L 130,70 L 130,20', // room top-right partition
].join(' ');

const VIEWBOX = '0 0 300 220';

export default function LoadingScreen() {
  const pathname = usePathname();
  const isHome   = pathname === '/' || pathname === '';

  const [progress,    setProgress]    = useState(0);
  const [displayPct,  setDisplayPct]  = useState(0);
  const [done,        setDone]        = useState(!isHome);
  const [fadeOut,     setFadeOut]     = useState(false);
  const [planReady,   setPlanReady]   = useState(false);

  const svgRef      = useRef(null);
  const pathRef     = useRef(null);
  const dotRef      = useRef(null);
  const rafRef      = useRef(0);
  const smoothRef   = useRef(0);   // smoothed progress for animation
  const targetRef   = useRef(0);   // real progress target
  const totalRef    = useRef(0);   // total path length

  // ── Initialise path once SVG is in DOM ──────────────────────────────────────
  useEffect(() => {
    if (!planReady) return;
    const path = pathRef.current;
    if (!path) return;

    const len = path.getTotalLength?.() ?? 800;
    totalRef.current = len;

    // Hide completely before first paint
    path.style.strokeDasharray  = `${len}`;
    path.style.strokeDashoffset = `${len}`;

    if (dotRef.current) {
      dotRef.current.style.opacity = '0';
    }
  }, [planReady]);

  // ── rAF loop: smooth progress → update line + dot ──────────────────────────
  useEffect(() => {
    if (done || !isHome) return;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);

      const target  = targetRef.current;
      const current = smoothRef.current;

      // Ease toward target — 8% per frame feels natural
      const next = current + (target - current) * 0.08;
      smoothRef.current = next;

      // Update percentage display
      setDisplayPct(Math.round(next));

      const len = totalRef.current;
      const path = pathRef.current;
      const dot  = dotRef.current;

      if (!len || !path) return;

      const drawn  = (next / 100) * len;
      const offset = len - drawn;
      path.style.strokeDashoffset = `${offset}`;

      // Position dot at tip of drawn line
      if (dot && path.getPointAtLength && drawn > 2) {
        const pt = path.getPointAtLength(Math.min(drawn, len - 0.5));
        dot.setAttribute('cx', String(pt.x.toFixed(2)));
        dot.setAttribute('cy', String(pt.y.toFixed(2)));
        dot.style.opacity = '1';
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [done, isHome]);

  // ── Boot coordination ────────────────────────────────────────────────────────
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

      // Hold at 100% so complete floor plan is visible, then fade out
      window.setTimeout(() => {
        if (cancelled) return;
        setFadeOut(true);
        window.setTimeout(() => {
          if (!cancelled) {
            cancelAnimationFrame(rafRef.current);
            setDone(true);
            document.documentElement.style.overflow = '';
          }
        }, 900);
      }, 700);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      window.removeEventListener(BOOT_EVENTS.PROGRESS_EVENT, onProgress);
      cancelAnimationFrame(rafRef.current);
      document.documentElement.style.overflow = '';
    };
  }, [isHome]);

  if (done) return null;

  return (
    <div
      className={`${styles.loader} ${fadeOut ? styles.loaderDone : ''}`}
      aria-label="Loading"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.content}>

        {/* Logo */}
        <div className={styles.logoWrap}>
          <Image
            src="/logo.png"
            alt="The Spatial Edit"
            width={64}
            height={64}
            style={{ objectFit: 'contain', display: 'block' }}
            priority
          />
          <div className={styles.logoName}>The Spatial Edit</div>
          <div className={styles.logoSub}>Interior Design Studio</div>
        </div>

        {/* Floor plan */}
        <div className={styles.planWrap}>
          <svg
            className={styles.planSvg}
            viewBox={VIEWBOX}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            ref={(el) => {
              svgRef.current = el;
              if (el && !planReady) setPlanReady(true);
            }}
          >
            {/* Faint grid reference dots */}
            {[20, 100, 130, 180, 280].flatMap(x =>
              [20, 100, 120, 160, 200].map(y => (
                <circle key={`d${x}-${y}`} cx={x} cy={y} r="1.2"
                  fill="rgba(180,144,79,0.15)" />
              ))
            )}

            {/* Ghost — full path at very low opacity */}
            <path
              d={PLAN_PATH}
              stroke="rgba(180,144,79,0.15)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active drawn line — JS controls strokeDashoffset */}
            <path
              ref={pathRef}
              d={PLAN_PATH}
              stroke="#b4904f"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0"
              strokeDashoffset="0"
            />

            {/* Travelling dot */}
            <circle
              ref={dotRef}
              cx="20" cy="200" r="3"
              fill="#b4904f"
              style={{
                opacity: 0,
                filter: 'drop-shadow(0 0 4px rgba(180,144,79,0.9))',
              }}
            />

            {/* Room labels */}
            <text x="30"  y="165" className={styles.roomLabel}>LIVING</text>
            <text x="108" y="165" className={styles.roomLabel}>DINING</text>
            <text x="108" y="75"  className={styles.roomLabel}>KITCHEN</text>
            <text x="190" y="145" className={styles.roomLabel}>BEDROOM</text>
            <text x="190" y="75"  className={styles.roomLabel}>STUDY</text>

            {/* Compass */}
            <g transform="translate(262, 185)">
              <circle cx="10" cy="10" r="9"
                stroke="rgba(180,144,79,0.3)" strokeWidth="0.8" fill="none"/>
              <line x1="10" y1="2" x2="10" y2="18"
                stroke="rgba(180,144,79,0.4)" strokeWidth="0.8"/>
              <line x1="2" y1="10" x2="18" y2="10"
                stroke="rgba(180,144,79,0.4)" strokeWidth="0.8"/>
              <polygon points="10,3 11,9 10,8 9,9"
                fill="rgba(180,144,79,0.8)"/>
              <text x="7.5" y="2"
                style={{fontSize:'4px',fill:'rgba(180,144,79,0.7)',fontFamily:'serif'}}>N</text>
            </g>
          </svg>
        </div>

        {/* Meta row */}
        <div className={styles.meta}>
          <span className={styles.metaLabel}>PREPARING SPACE</span>
          <span className={styles.metaPct}>
            {String(displayPct).padStart(2, '0')}
            <span className={styles.metaPctSymbol}>%</span>
          </span>
        </div>

      </div>
    </div>
  );
}
