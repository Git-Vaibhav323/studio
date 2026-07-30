'use client';

import { useRevealAnimation, useCardAnimation } from '@/lib/useRevealAnimation';
import styles from './Promises.module.css';

const promises = [
  {
    title: 'Regular Site Update',
    desc: 'You receive weekly progress updates with site photographs, what\'s planned for the following week, and any decisions that need your input — so you\'re never left wondering what\'s happening.',
    icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
  },
  {
    title: 'Execution That Stays True to the Design',
    desc: 'We supervise every stage of execution to keep it as close to the approved design as possible. Where site conditions require a practical adjustment, we flag it and discuss it with you before proceeding — never after.',
    icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    title: 'One Point of Contact',
    desc: "You won't need to coordinate with multiple vendors or contractors yourself. We manage that coordination on your behalf, so you have one relationship to rely on for updates and decisions.",
    icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    title: 'Designed Around How You Live',
    desc: 'We design for your daily routines and real needs — not just for how a space photographs. The goal is a home that works for your life, not just one that looks good on day one.',
    icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  },
];

export default function Promises() {
  const titleRef = useRevealAnimation(100);
  const cardsRef = useCardAnimation('slideUp', 300);
  
  return (
    <section id="promises" className={styles.section}>
      {/* Header label */}
      <div className={styles.headerRight}>
        <div className={styles.hrTop}>
          <div className={styles.hrLabel}>OUR PROMISE</div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        
        {/* Title section */}
        <div className={styles.titleBlock}>
          <h2 className={styles.title} ref={titleRef}>
            Our <span>Promise.</span>
            <br />
            Your Peace of Mind.
          </h2>
        </div>

        {/* Divider */}
        <div className={styles.titleDivider}>
          <div className={styles.divLine} />
          <div className={styles.divDia}>
            <svg viewBox="0 0 24 24">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)" />
            </svg>
          </div>
          <div className={styles.divLine} />
        </div>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          CLEAR PROCESS. CONSTANT COMMUNICATION. COMPLETE OWNERSHIP.
        </p>

        {/* Cards Grid */}
        <div className={styles.cards} ref={cardsRef}>
          {promises.map((p) => (
            <div className={styles.card} key={p.title}>
              
              {/* Icon */}
              <div className={styles.cardIcon}>
                {p.icon}
              </div>

              {/* Title */}
              <div className={styles.cardTitle}>
                {p.title}
              </div>

              {/* Card Divider */}
              <div className={styles.cardDivider}>
                <div className={styles.cdLine} />
                <div className={styles.cdDia}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)" />
                  </svg>
                </div>
                <div className={styles.cdLine} />
              </div>

              {/* Description */}
              <div className={styles.cardDesc}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}