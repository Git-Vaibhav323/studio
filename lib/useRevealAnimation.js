'use client';

import { useEffect, useRef } from 'react';

// ─── Shared reduced-motion query ─────────────────────────────────────────────
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Shared IntersectionObserver factory ─────────────────────────────────────
// threshold: element must be 12% visible before triggering
// rootMargin: pull trigger slightly above the fold bottom for a more natural feel
const makeObserver = (callback, options = {}) =>
  new IntersectionObserver(callback, {
    threshold: options.threshold ?? 0.12,
    rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
  });

// ─── useRevealAnimation ───────────────────────────────────────────────────────
// Reveals a single element with a cinematic fade + translate-up.
// delay (ms): respected — actual setTimeout used, unlike the old version.
export function useRevealAnimation(delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    // Hide immediately so there's no flash of visible content
    element.classList.add('animate-title');

    const observer = makeObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const run = () => {
          entry.target.classList.remove('animate-title');
          entry.target.classList.add('title-appear');
        };

        delay > 0 ? setTimeout(run, delay) : run();
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}

// ─── useCardAnimation ─────────────────────────────────────────────────────────
// Reveals a wrapper element or individual card.
// animationType: 'slideUp' | 'slideLeft' | 'slideRight'
// delay (ms): respected.
export function useCardAnimation(animationType = 'slideUp', delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    const initialClass =
      animationType === 'slideLeft'  ? 'animate-card-left'  :
      animationType === 'slideRight' ? 'animate-card-right' :
      'animate-card';

    element.classList.add(initialClass);

    const observer = makeObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const run = () => {
          entry.target.classList.remove(initialClass);
          const animClass =
            animationType === 'slideLeft'  ? 'card-slide-in'       :
            animationType === 'slideRight' ? 'card-slide-in-right' :
            'card-slide-up';
          entry.target.classList.add(animClass);
        };

        delay > 0 ? setTimeout(run, delay) : run();
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [animationType, delay]);

  return ref;
}

// ─── useStaggerChildren ───────────────────────────────────────────────────────
// Stagger-animates ALL direct children of a container individually.
// Much more cinematic than animating the whole wrapper as one block.
// staggerMs: delay between each child (default 120ms — architectural, not fast)
// animationType: same options as useCardAnimation
export function useStaggerChildren(staggerMs = 120, animationType = 'slideUp') {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    if (prefersReducedMotion()) return;

    const initialClass =
      animationType === 'slideLeft'  ? 'animate-card-left'  :
      animationType === 'slideRight' ? 'animate-card-right' :
      'animate-card';

    const animClass =
      animationType === 'slideLeft'  ? 'card-slide-in'       :
      animationType === 'slideRight' ? 'card-slide-in-right' :
      'card-slide-up';

    const children = Array.from(container.children);
    children.forEach((child) => child.classList.add(initialClass));

    const observer = makeObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        children.forEach((child, i) => {
          setTimeout(() => {
            child.classList.remove(initialClass);
            child.classList.add(animClass);
          }, i * staggerMs);
        });
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    observer.observe(container);
    return () => observer.disconnect();
  }, [staggerMs, animationType]);

  return ref;
}

// ─── useRevealAnimationBatch ──────────────────────────────────────────────────
// Stagger-reveal an explicit array of refs (unchanged API, fixed timing).
export function useRevealAnimationBatch() {
  const refs = useRef([]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      refs.current.forEach((r) => {
        if (r) { r.style.opacity = '1'; r.style.transform = 'none'; }
      });
      return;
    }

    const observer = makeObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = parseInt(entry.target.dataset.animationIndex, 10) || 0;
        observer.unobserve(entry.target);
        setTimeout(() => {
          entry.target.classList.remove('animate-title');
          entry.target.classList.add('title-appear');
        }, index * 120);
      });
    });

    refs.current.forEach((ref, index) => {
      if (ref) {
        ref.classList.add('animate-title');
        ref.dataset.animationIndex = index;
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (index) => (element) => { refs.current[index] = element; };
  return { setRef, refs };
}

// ─── useCinematicParallax ─────────────────────────────────────────────────────
// Scroll-driven parallax using rAF — no layout thrash.
// strength: how many px the element moves per 1px of scroll (default 0.12).
// Clamps to a max offset so it never strays too far.
// Only active on desktop (>= 900px) to avoid disrupting mobile layouts.
export function useCinematicParallax(strength = 0.12, maxOffset = 80) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) return;

    let raf = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      if (window.innerWidth < 900) {
        element.style.transform = '';
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewH = window.innerHeight;
      // Centre of element relative to centre of viewport
      const centreOffset = (rect.top + rect.height / 2) - viewH / 2;
      const raw = centreOffset * strength;
      const clamped = Math.max(-maxOffset, Math.min(maxOffset, raw));

      element.style.transform = `translateY(${clamped.toFixed(2)}px)`;
      element.style.willChange = 'transform';
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // initial position

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      if (element) element.style.transform = '';
    };
  }, [strength, maxOffset]);

  return ref;
}

// ─── useSectionReveal ─────────────────────────────────────────────────────────
// Cinematic reveal for full sections — slower, more intentional.
// Uses the CSS .reveal / .reveal.visible system (transition-based, not keyframe).
// Perfect for section wrappers that should ease in as a whole.
export function useSectionReveal(delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) return;

    element.classList.add('reveal');

    const observer = makeObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const run = () => entry.target.classList.add('visible');
          delay > 0 ? setTimeout(run, delay) : run();
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -20px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}
