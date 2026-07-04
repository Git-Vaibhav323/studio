'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './HeroSection.module.css';

const FRAME_COUNT = 267;

const titleRanges = [
  { start: 0, fadeInEnd: 0, fadeOutStart: 0.14, end: 0.23 },
  { start: 0.34, fadeInEnd: 0.4, fadeOutStart: 0.53, end: 0.6 },
  { start: 0.7, fadeInEnd: 0.77, fadeOutStart: 0.9, end: 0.97 },
];

function framePath(index) {
  return `/motion/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;
}

function titleOpacity(progress, range) {
  if (progress < range.start || progress > range.end) return 0;
  if (range.fadeInEnd > range.start && progress < range.fadeInEnd) {
    return (progress - range.start) / (range.fadeInEnd - range.start);
  }
  if (progress > range.fadeOutStart) {
    return (range.end - progress) / (range.end - range.fadeOutStart);
  }
  return 1;
}

export default function HeroSection() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRefs = useRef([]);
  const cueRef = useRef(null);
  const progressRef = useRef(null);
  const loadingProgressRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Canvas-based rendering with complete frame cache
  const frameCache = useRef(new Map());
  const lastFrameRef = useRef(-1);
  const animationFrameRef = useRef(null);
  const canvasContextRef = useRef(null);
  const frameStepRef = useRef(2);

  // Preload ALL frames that will be used (respecting frameStep)
  useEffect(() => {
    // Determine if mobile
    const checkMobile = window.matchMedia('(max-width: 768px)').matches;
    setIsMobile(checkMobile);
    frameStepRef.current = checkMobile ? 4 : 2;

    const preloadFrames = async () => {
      const frameStep = frameStepRef.current;
      const framesToLoad = [];
      
      // Generate list of frames we'll actually use based on frameStep
      for (let i = 0; i < FRAME_COUNT; i += frameStep) {
        framesToLoad.push(i);
      }
      // Always include the last frame
      if (!framesToLoad.includes(FRAME_COUNT - 1)) {
        framesToLoad.push(FRAME_COUNT - 1);
      }

      let loaded = 0;
      const total = framesToLoad.length;

      const promises = framesToLoad.map(frameIndex => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = async () => {
            try {
              // Use decode() to ensure image is fully ready
              await img.decode();
              frameCache.current.set(frameIndex, img);
              loaded++;
              setLoadProgress(Math.round((loaded / total) * 100));
              resolve();
            } catch (err) {
              console.warn(`Failed to decode frame ${frameIndex}`, err);
              resolve(); // Continue even if decode fails
            }
          };
          img.onerror = () => {
            console.warn(`Failed to load frame ${frameIndex}`);
            loaded++;
            setLoadProgress(Math.round((loaded / total) * 100));
            resolve(); // Continue even if some fail
          };
          img.src = framePath(frameIndex);
        });
      });
      
      await Promise.allSettled(promises);
      setIsLoaded(true);
    };

    preloadFrames();
  }, []);

  // Setup canvas context and size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true, // Better performance for animations
    });
    canvasContextRef.current = ctx;

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      // Redraw current frame after resize
      if (lastFrameRef.current >= 0) {
        drawFrame(lastFrameRef.current);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize, { passive: true });

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    if (!canvas || !ctx) return;

    const img = frameCache.current.get(frameIndex);
    if (!img) {
      // Frame not cached yet - hold on last valid frame (no flicker)
      return;
    }

    // Get canvas display size (not scaled size)
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    // Calculate cover positioning (like object-fit: cover)
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspect > canvasAspect) {
      // Image is wider - fit to height
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgAspect;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller - fit to width
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgAspect;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    }

    // Clear and draw
    ctx.fillStyle = '#15130f';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  const updateSequence = useCallback((frameIndex) => {
    if (lastFrameRef.current === frameIndex) return;
    
    lastFrameRef.current = frameIndex;
    drawFrame(frameIndex);
  }, [drawFrame]);

  const render = useCallback((progress) => {
    const frameStep = frameStepRef.current;
    const rawFrame = Math.min(FRAME_COUNT - 1, Math.round(progress * (FRAME_COUNT - 1)));
    // Snap to nearest frame that exists in our cache
    const frameIndex = Math.min(FRAME_COUNT - 1, Math.round(rawFrame / frameStep) * frameStep);

    updateSequence(frameIndex);

    // Update titles with GPU acceleration
    titleRefs.current.forEach((title, index) => {
      if (!title) return;
      const opacity = titleOpacity(progress, titleRanges[index]);
      const y = (1 - opacity) * 22;
      
      title.style.opacity = String(opacity);
      title.style.transform = `translate3d(0, ${y}px, 0)`;
      title.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
    });

    // Update scroll cue
    if (cueRef.current) {
      cueRef.current.style.opacity = String(Math.max(0, 1 - progress * 8));
    }

    // Update progress bar
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${progress})`;
    }
  }, [updateSequence]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !isLoaded) return;

    let targetProgress = 0;
    let currentProgress = 0;
    let isAnimating = false;
    let scrollListenerActive = true;

    const calculateProgress = () => {
      const rect = hero.getBoundingClientRect();
      const scrollDistance = hero.offsetHeight - window.innerHeight;
      return Math.min(1, Math.max(0, -rect.top / Math.max(1, scrollDistance)));
    };

    const animate = () => {
      if (!scrollListenerActive) return;
      
      const diff = targetProgress - currentProgress;
      
      if (Math.abs(diff) < 0.001) {
        currentProgress = targetProgress;
        render(currentProgress);
        isAnimating = false;
        return;
      }

      // Smooth interpolation (lerp)
      currentProgress += diff * 0.4;
      render(currentProgress);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const onScroll = () => {
      if (!scrollListenerActive) return;
      targetProgress = calculateProgress();
      
      if (!isAnimating) {
        isAnimating = true;
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Initial render
    targetProgress = calculateProgress();
    currentProgress = targetProgress;
    render(currentProgress);

    // Use passive listeners for better performance
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      scrollListenerActive = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoaded, render]);

  return (
    <section id="hero" className={styles.hero} ref={heroRef} aria-label="The Spatial Edit introduction">
      <div className={styles.sticky}>
        {/* Loading state with progress indicator */}
        {!isLoaded && (
          <div className={styles.loadingState}>
            <div className={styles.loadingContent}>
              <div className={styles.loadingBar}>
                <span 
                  ref={loadingProgressRef}
                  className={styles.loadingProgress}
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <p className={styles.loadingText}>{loadProgress}%</p>
            </div>
          </div>
        )}

        {/* Canvas for flicker-free frame rendering */}
        <canvas
          ref={canvasRef}
          className={styles.sequence}
          aria-label="Contemporary residence designed around effortless living"
          style={{ opacity: isLoaded ? 1 : 0 }}
        />

        <div className={styles.titleStage} aria-live="off" style={{ opacity: isLoaded ? 1 : 0 }}>
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

        <div className={styles.scrollCue} ref={cueRef} aria-hidden="true" style={{ opacity: isLoaded ? 1 : 0 }}>
          <span>Scroll to explore</span>
          <i />
        </div>

        <div className={styles.progressTrack} aria-hidden="true" style={{ opacity: isLoaded ? 1 : 0 }}>
          <span ref={progressRef} />
        </div>
      </div>
    </section>
  );
}
