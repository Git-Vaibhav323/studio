'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './LoadingScreen.module.css';

const FRAME_COUNT = 230;

const siteImages = [
  '/images/hero_living_room.png',
  '/images/hero_interior.png',
  '/images/founders_photo.png',
  '/images/map.png',
  '/images/card_circulation.png',
  '/images/card_proportion.png',
  '/images/card_light.png',
  '/images/blueprint_desk.png',
  '/images/floor_plan_rect.png',
  '/images/blueprint_sketch_v2.png',
  '/images/dining_space.png',
  '/images/kitchen_modern.png',
  '/images/bedroom_luxury.png',
  '/images/with_spatial_room.png',
  '/images/without_spatial_room.png',
  '/images/vase_books.png',
  '/images/bg/bg-sec-2.webp',
  '/images/bg/bg-sec-3.webp',
  '/images/bg/bg-sec-3-2.webp',
  '/images/bg/bg-sec-4.webp',
  '/images/bg/bg-sec-5.webp',
  '/images/bg/bg-sec-6.webp',
  '/images/bg/bg-sec-7.webp',
  '/images/bg/bg-sec-con.webp',
];

function framePath(index) {
  return `/motion/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;
}

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
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Preparing experience');
  const [dots, setDots] = useState('');
  const [done, setDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const assets = useMemo(() => [
    ...Array.from({ length: FRAME_COUNT }, (_, index) => framePath(index)),
    ...siteImages,
  ], []);

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Update loading stage based on progress
  useEffect(() => {
    if (progress < 20) {
      setLoadingStage('Preparing experience');
    } else if (progress < 50) {
      setLoadingStage('Loading visuals');
    } else if (progress < 80) {
      setLoadingStage('Optimizing performance');
    } else if (progress < 100) {
      setLoadingStage('Almost ready');
    } else {
      setLoadingStage('Complete');
    }
  }, [progress]);

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;

    const markLoaded = () => {
      loaded += 1;
      if (!cancelled) {
        setProgress(Math.round((loaded / assets.length) * 100));
      }
    };

    Promise.all(assets.map((src) => preloadImage(src).then(markLoaded))).then(() => {
      if (cancelled) return;
      setProgress(100);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setDone(true);
        }, 800);
      }, 500);
    });

    return () => {
      cancelled = true;
    };
  }, [assets]);

  if (done) return null;

  return (
    <div className={`${styles.loader} ${fadeOut ? styles.loaderDone : ''}`} aria-hidden={done}>
      {/* Animated Background */}
      <div className={styles.background}>
        <div className={styles.backgroundPattern}></div>
        <div className={styles.floatingElements}>
          <div className={styles.floatingElement} style={{ '--delay': '0s', '--duration': '8s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '2s', '--duration': '6s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '4s', '--duration': '10s' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 80 80" className={styles.logoSvg}>
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--gold)" />
                  <stop offset="100%" stopColor="var(--gold-dark)" />
                </linearGradient>
              </defs>
              <rect x="10" y="10" width="60" height="60" fill="none" stroke="url(#goldGradient)" strokeWidth="2" className={styles.logoRect} />
              <line x1="25" y1="10" x2="25" y2="70" stroke="url(#goldGradient)" strokeWidth="1.5" className={styles.logoLine1} />
              <line x1="40" y1="10" x2="40" y2="70" stroke="url(#goldGradient)" strokeWidth="1.5" className={styles.logoLine2} />
              <line x1="55" y1="10" x2="55" y2="70" stroke="url(#goldGradient)" strokeWidth="1.5" className={styles.logoLine3} />
            </svg>
          </div>
          
          <div className={styles.brandSection}>
            <h1 className={styles.brand}>The Spatial Edit</h1>
            <p className={styles.subtitle}>Spaces designed to work. Finished to last.</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className={styles.progressSection}>
          <div className={styles.progressMeta}>
            <span className={styles.loadingText}>{loadingStage}{dots}</span>
            <span className={styles.percentText}>{progress}%</span>
          </div>
          
          <div className={styles.progressTrack}>
            <div 
              className={styles.progressFill} 
              style={{ transform: `scaleX(${progress / 100})` }}
            >
              <div className={styles.progressShimmer}></div>
            </div>
          </div>
        </div>

        {/* Loading Indicators */}
        <div className={styles.indicators}>
          <div className={styles.indicator} style={{ '--delay': '0ms' }}></div>
          <div className={styles.indicator} style={{ '--delay': '200ms' }}></div>
          <div className={styles.indicator} style={{ '--delay': '400ms' }}></div>
        </div>
      </div>
    </div>
  );
}
