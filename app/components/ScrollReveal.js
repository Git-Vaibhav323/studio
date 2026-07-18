'use client';
import { useEffect } from 'react';

// Single global IntersectionObserver that watches all .reveal* elements.
// Adds .visible when they enter the viewport. Runs once per page load.
export default function ScrollReveal() {
  useEffect(() => {
    const selectors = '.reveal, .reveal-right, .reveal-scale';

    const observe = (observer) => {
      document.querySelectorAll(selectors).forEach((el) => {
        if (!el.dataset.revealObserved) {
          el.dataset.revealObserved = '1';
          observer.observe(el);
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // stagger siblings — delay by position among same-parent reveal siblings
            const siblings = Array.from(
              entry.target.parentElement?.querySelectorAll(selectors) ?? []
            );
            const idx = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = idx > 0 ? `${idx * 80}ms` : '0ms';
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    // Initial scan
    observe(observer);

    // Re-scan after a tick to catch hydrated client components
    const t = setTimeout(() => observe(observer), 300);

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return null;
}
