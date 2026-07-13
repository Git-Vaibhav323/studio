'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import styles from '../components/PageDetail.module.css';
import aboutStyles from './About.module.css';

const trust = [
  ['01', 'Studio point of contact'],
  ['09', 'Execution layers managed'],
  ['30', 'Day aftercare support'],
  ['100%', 'Space-first thinking'],
];

const team = [
  { name: 'Preksha Bhargav', role: 'Co-founder', image: '/images/founders_photo.png' },
  { name: 'Krishna Bhargav', role: 'Co-founder', image: '/images/founders_photo.png' },
];

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add(aboutStyles.visible); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`${aboutStyles.reveal} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>About The Spatial Edit</div>
            <h1 className={styles.title}>It began in a home that <span>was not working.</span></h1>
            <p className={styles.intro}>
              The Spatial Edit was founded by Preksha Bhargav and Krishna Bhargav, partners in life and now in business, who started this studio for a very personal reason.
            </p>
            <div className={styles.trustBar}>
              {trust.map(([number, label]) => (
                <div className={styles.trustItem} key={label}>
                  <span className={styles.trustNumber}>{number}</span>
                  <span className={styles.trustLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story section */}
        <section className={`${styles.section} ${aboutStyles.sectionGlow}`}>
          <div className={styles.sectionInner}>
            <div className={styles.storyFeature}>
              <Reveal className={styles.storyTextPanel}>
                <div className={styles.eyebrow}>Our Story</div>
                <h2 className={styles.sectionTitle}>A studio built from a lived experience.</h2>
                <p className={styles.bodyText}>
                  It did not begin in a design studio. It began in a home that was not working, a home that did not feel like theirs.
                </p>
                <p className={styles.bodyText}>
                  When they were expecting their first baby, in the third trimester, the couple moved into a new apartment. They had hired an interior designer.
                </p>
                <p className={styles.bodyText}>
                  What followed was one of the most chaotic experiences of their lives: delays, decisions that made no sense, and a process so disorganised they ended up directing it themselves, from designing their own house to doing site visits.
                </p>
                <p className={styles.bodyText}>
                  They were not unlucky. They were experiencing what almost every homeowner in India experiences.
                </p>
              </Reveal>

              <Reveal delay={150} className={aboutStyles.founderCardWrap}>
                <div className={`${styles.founderStoryCard} ${aboutStyles.founderCard}`}>
                  <div className={`${styles.founderImage} ${aboutStyles.founderImg}`}>
                    <Image
                      src="/images/founders_photo.png"
                      alt="Preksha Bhargav and Krishna Bhargav, founders of The Spatial Edit"
                      fill
                      sizes="(max-width: 900px) 100vw, 520px"
                      style={{ objectFit: 'cover' }}
                    />
                    {/* Glassmorphism name overlay — sits on bottom of image */}
                    <div className={aboutStyles.founderGlassBar}>
                      {team.map((member) => (
                        <div className={aboutStyles.founderGlassName} key={member.name}>
                          <h3 className={aboutStyles.founderName}>{member.name}</h3>
                          <p className={aboutStyles.founderRole}>{member.role}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Gap section */}
        <section className={styles.sectionAlt}>
          <div className={styles.sectionInner}>
            <div className={styles.storyResolve}>
              <Reveal>
                <div className={styles.eyebrow}>The Gap</div>
                <h2 className={styles.sectionTitle}>That gap stayed with them.</h2>
              </Reveal>
              <Reveal delay={150}>
                <p className={styles.bodyText}>
                  Two babies later and with lot of thinking, research, and groundwork behind them, they built The Spatial Edit.
                </p>
                <blockquote className={`${styles.quotePanel} ${aboutStyles.quoteHover}`}>
                  <span>&ldquo;</span>
                  We do not just design your space. We ensure it is executed exactly as designed.
                </blockquote>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className={`${styles.section} ${aboutStyles.sectionGlow}`}>
          <div className={styles.sectionInner}>
            <div className={styles.storyPillars}>
              {[
                { num: '01', title: 'Personal understanding', body: 'We know how stressful an unorganised home project can feel because the studio was born from that exact experience.' },
                { num: '02', title: 'Spatial intelligence', body: 'Before finishes, we study circulation, proportion, light, storage, and the way daily life actually moves through the home.' },
                { num: '03', title: 'Execution ownership', body: 'Design and execution stay connected, so the space is not only imagined well, but delivered with clarity and control.' },
              ].map((p, i) => (
                <Reveal key={p.num} delay={i * 120}>
                  <article className={aboutStyles.pillarCard}>
                    <span>{p.num}</span>
                    <h2>{p.title}</h2>
                    <p>{p.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
