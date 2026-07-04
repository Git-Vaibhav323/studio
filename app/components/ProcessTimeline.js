'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './PageDetail.module.css';

export default function ProcessTimeline({ steps }) {
  const wrapRef = useRef(null);
  const ribbonRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const ribbon = ribbonRef.current;
    if (!wrap || !ribbon) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = wrap.getBoundingClientRect();
      const available = Math.max(1, rect.height - window.innerHeight * 0.42);
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.42 - rect.top) / available));
      ribbon.style.transform = `scaleY(${progress})`;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.ribbonTimeline} ref={wrapRef}>
      <div className={styles.ribbonTrack} aria-hidden="true">
        <div className={styles.ribbonFill} ref={ribbonRef} />
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
      </div>

      {steps.map((step, index) => (
        <article
          className={`${styles.ribbonStep} ${index % 2 === 0 ? styles.ribbonLeft : styles.ribbonRight}`}
          key={step.num}
        >
          <div className={styles.ribbonNode}>{step.num}</div>
          <div className={styles.ribbonCard}>
            <div className={styles.ribbonImage}>
              <Image src={step.image} alt={step.label} fill sizes="(max-width: 900px) 100vw, 360px" style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.ribbonBody}>
              <span className={styles.number}>{step.num}</span>
              <h2>{step.expandedTitle}</h2>
              <p>{step.expandedText || step.desc}</p>
              <ul className={styles.list}>
                {step.expandedList.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p><strong>{step.expandedNote}</strong></p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
