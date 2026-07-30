'use client';

import { useEffect, useRef } from 'react';

export function useRevealAnimation(delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Immediately apply invisible state
    element.classList.add('animate-title');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add the animation class without delay for smoother appearance
            entry.target.classList.remove('animate-title');
            entry.target.classList.add('title-appear');
            
            // Stop observing once animated
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px' // Reduced margin for earlier trigger
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [delay]);

  return ref;
}

export function useCardAnimation(animationType = 'slideUp', delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Immediately apply invisible state based on animation type
    const initialClass = animationType === 'slideLeft' ? 'animate-card-left' :
                        animationType === 'slideRight' ? 'animate-card-right' :
                        'animate-card';
    element.classList.add(initialClass);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Remove initial state and add animation without delay
            entry.target.classList.remove(initialClass);
            const animationClass = animationType === 'slideLeft' ? 'card-slide-in' :
                                 animationType === 'slideRight' ? 'card-slide-in-right' :
                                 'card-slide-up';
            entry.target.classList.add(animationClass);
            
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Reduced threshold for earlier trigger
        rootMargin: '0px 0px -10px 0px' // Reduced margin for smoother trigger
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [animationType, delay]);

  return ref;
}

export function useRevealAnimationBatch(elements = []) {
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.animationIndex, 10) || 0;
            const delay = index * 50; // Reduced staggered delay for smoother appearance
            
            // Apply initial invisible state first
            entry.target.classList.add('animate-title');
            
            setTimeout(() => {
              entry.target.classList.remove('animate-title');
              entry.target.classList.add('title-appear');
            }, delay);
            
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px' // Reduced margin for earlier trigger
      }
    );

    refs.current.forEach((ref, index) => {
      if (ref) {
        // Apply initial invisible state immediately
        ref.classList.add('animate-title');
        ref.dataset.animationIndex = index;
        observer.observe(ref);
      }
    });

    return () => {
      refs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, []);

  const setRef = (index) => (element) => {
    refs.current[index] = element;
  };

  return { setRef, refs };
}