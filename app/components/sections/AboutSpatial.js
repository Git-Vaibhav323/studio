'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './AboutSpatial.module.css';

// Cards with longer, reference-matching descriptions
const bpCards = [
  {
    num: '01',
    title: 'Circulation',
    text: 'We map how you move through every room — every door, corridor, and daily routine.',
    img: '/images/card_circulation.png',
  },
  {
    num: '02',
    title: 'Proportion',
    text: 'Scale determines how a space feels.',
    img: '/images/card_proportion.png',
  },
  {
    num: '03',
    title: 'Light',
    text: 'We study how natural light moves through your home at different times of day.',
    img: '/images/card_light.png',
  },
];

export default function AboutSpatial() {
  const blueprintWrapRef = useRef(null);
  const cardsRef = useRef([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ── Media-query watchers ─────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQ = window.matchMedia('(max-width: 1023px)');
    setReducedMotion(mq.matches);
    setIsMobile(mobileQ.matches);

    const onMq = (e) => setReducedMotion(e.matches);
    const onMob = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onMq);
    mobileQ.addEventListener('change', onMob);
    return () => {
      mq.removeEventListener('change', onMq);
      mobileQ.removeEventListener('change', onMob);
    };
  }, []);

  /* ── 3-D tilt + card entrance ─────────────────────────── */
  useEffect(() => {
    const wrap = blueprintWrapRef.current;
    if (!wrap || reducedMotion || isMobile) return;

    let rafId = null;
    let curX = 0, curY = 0, tgtX = 0, tgtY = 0;
    let cardsAnimated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          // Animate cards in once
          if (!cardsAnimated && entry.intersectionRatio > 0.25) {
            cardsAnimated = true;
            cardsRef.current.forEach((card, i) => {
              if (!card) return;
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
              }, 120 * i);
            });
          }

          // Drive tilt from scroll progress
          const { top, height } = entry.boundingClientRect;
          const vh = window.innerHeight;
          const p = Math.max(0, Math.min(1, 1 - top / (vh - height * 0.5)));
          const angle = Math.sin(p * Math.PI * 1.5) * 5; // ±5 deg
          tgtX = angle * 0.5;
          tgtY = angle * -0.7;
        });
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-8% 0px' }
    );

    observer.observe(wrap);

    const tick = () => {
      curX += (tgtX - curX) * 0.08;
      curY += (tgtY - curY) * 0.08;
      wrap.style.transform = `perspective(1100px) rotateX(${curX}deg) rotateY(${curY}deg)`;
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, isMobile]);

  return (
    <section id="about" className={styles.section}>

      {/* Left edge rule + rotated label */}
      <div className={styles.vline} />
      <div className={styles.sideLabel}>THE THINKING BEFORE THE DESIGN</div>

      {/* Top-right micro label */}
      <div className={styles.topRight}>
        <span>THE SPATIAL EDIT</span>
        <span className={styles.topRightNum}>03</span>
      </div>

      <div className={styles.inner}>

        {/* ── MAIN ROW: left | center | right ─────────────── */}
        <div className={styles.mainRow}>

          {/* ── LEFT COL ─────────────────────────────────────── */}
          <div className={styles.left}>

          {/* Faint concentric-arc decoration */}
          <svg className={styles.decorArcs} viewBox="0 0 300 300" aria-hidden="true">
            {[140, 118, 96, 74, 52].map((r, i) => (
              <circle
                key={r}
                cx="150" cy="150" r={r}
                fill="none"
                stroke={`rgba(180,144,79,${0.12 + i * 0.02})`}
                strokeWidth="0.6"
              />
            ))}
            {/* Intersection dots */}
            {[
              [150, 10], [290, 150], [150, 290], [10, 150],
              [257, 43], [257, 257], [43, 257], [43, 43],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.8" fill="rgba(180,144,79,0.22)" />
            ))}
          </svg>

          <div className={styles.overline}>ABOUT SPATIAL DESIGN</div>

          <h2 className={styles.headline}>
            Space First.<br />Style Second.<br />
            <span className={styles.gold}>Always.</span>
          </h2>

          <p className={styles.descLarge}>
            Spatial design is the discipline of understanding how a space functions.
          </p>
          <p className={styles.desc}>
            It considers the physical and psychological experience of being inside a room — how you enter it, how you move through it, where your eye travels, and how the space makes you feel over time.
          </p>

          <div className={styles.featuresBox}>
            {[
              {
                icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" fill="none" strokeWidth="1.4"><rect x="5" y="5" width="14" height="14" rx="2" strokeDasharray="3 3"/><circle cx="12" cy="12" r="1" fill="var(--gold)"/></svg>,
                title: 'Circulation', sub: 'How you move\nthrough the space.',
              },
              {
                icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" fill="none" strokeWidth="1.4"><rect x="4" y="4" width="16" height="16" rx="1"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/></svg>,
                title: 'Proportion', sub: 'How the space is\nscaled and balanced.',
              },
              {
                icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" fill="none" strokeWidth="1.4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>,
                title: 'Light', sub: 'How natural light\nshapes the space.',
              },
              {
                icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" fill="none" strokeWidth="1.4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>,
                title: 'Psychology', sub: 'How the space\nmakes you feel.',
              },
            ].map((f) => (
              <div className={styles.feature} key={f.title}>
                <div className={styles.fIcon}>{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.sub}</p>
              </div>
            ))}
          </div>

          <div className={styles.statement}>
            <p>A HOME THAT WORKS BEAUTIFULLY IS NEVER BY CHANCE.<br />IT IS DESIGNED WITH INTELLIGENCE.</p>
          </div>
        </div>

        {/* ── CENTER COL — blueprint only ──────────────────── */}
        <div className={styles.center}>
          <div className={styles.blueprintWrap} ref={blueprintWrapRef}>
            <Image
              src="/images/map.png"
              alt="Spatial blueprint floor plan"
              fill
              priority
              className={styles.blueprintImg}
              sizes="(max-width:768px) 100vw, (max-width:1100px) 50vw, 35vw"
            />

            {/* SVG diagonal connector lines from blueprint to cards */}
            <svg
              className={styles.connectorLines}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* To card 01 Circulation — upper room */}
              <line x1="72" y1="22" x2="100" y2="18"
                stroke="rgba(180,144,79,0.55)" strokeWidth="0.35" strokeDasharray="1.5 1.5"/>
              {/* To card 02 Proportion — central room */}
              <line x1="75" y1="50" x2="100" y2="50"
                stroke="rgba(180,144,79,0.55)" strokeWidth="0.35"/>
              {/* To card 03 Light — lower room */}
              <line x1="70" y1="78" x2="100" y2="82"
                stroke="rgba(180,144,79,0.55)" strokeWidth="0.35" strokeDasharray="1.5 1.5"/>
            </svg>

            {/* Blueprint origin dots */}
            <div className={styles.blueprintDot} style={{ top: '22%', left: '72%' }} />
            <div className={styles.blueprintDot} style={{ top: '50%', left: '75%' }} />
            <div className={styles.blueprintDot} style={{ top: '78%', left: '70%' }} />
          </div>

          {/* Asks card removed from here — moved to bottomRow below */}
        </div>

        {/* ── RIGHT COL — three annotation cards ───────────── */}
        <div className={styles.right}>
          {bpCards.map((c, i) => (
            <div
              key={c.num}
              className={styles.bpCard}
              ref={(el) => { cardsRef.current[i] = el; }}
              style={{
                opacity: 0,
                transform: 'translateX(24px)',
                transition: `opacity 0.6s var(--ease-smooth) ${i * 0.12}s, transform 0.6s var(--ease-smooth) ${i * 0.12}s`,
              }}
            >
              <div className={styles.bpCardDot} />
              <div className={styles.cLeft}>
                <div className={styles.cTop}>
                  <span className={styles.cNum}>{c.num}</span>
                  <div className={styles.cLine} />
                </div>
                <h4>{c.title}</h4>
                <p>{c.text}</p>
              </div>
              <div className={styles.cRight}>
                <Image
                  src={c.img}
                  alt={c.title}
                  fill
                  sizes="72px"
                  style={{
                    objectFit: 'contain',
                    filter: 'sepia(100%) saturate(350%) hue-rotate(-10deg) brightness(0.82)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        </div>{/* end mainRow */}

        {/* ── BOTTOM ROW — asksCard aligned under center+right ── */}
        <div className={styles.bottomRow}>
          <div className={styles.asksCardWrap}>
            <div className={styles.asksCard}>
              <div className={styles.asksLeft}>
                <div className={styles.asksKicker}>AT ITS CORE, SPATIAL DESIGN ASKS:</div>
                <h3 className={styles.asksHeadline}>
                  Does this room work for the life being lived inside it?
                </h3>
              </div>
              <div className={styles.asksRight}>
                <p className={styles.asksText}>
                  It analyses layout, circulation, proportion, natural light, acoustics, and the
                  relationship between rooms — all before a single finish or furniture piece is chosen.
                </p>
              </div>
              <div className={styles.asksIcon} aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--gold)" strokeWidth="1">
                  <circle cx="24" cy="24" r="22" strokeOpacity="0.4"/>
                  <circle cx="24" cy="24" r="16" strokeOpacity="0.3"/>
                  <circle cx="24" cy="24" r="8" strokeOpacity="0.25"/>
                  <line x1="24" y1="2" x2="24" y2="9" strokeOpacity="0.7"/>
                  <line x1="24" y1="39" x2="24" y2="46" strokeOpacity="0.7"/>
                  <line x1="2" y1="24" x2="9" y2="24" strokeOpacity="0.7"/>
                  <line x1="39" y1="24" x2="46" y2="24" strokeOpacity="0.7"/>
                  <line x1="8.7" y1="8.7" x2="13.4" y2="13.4" strokeOpacity="0.4"/>
                  <line x1="34.6" y1="34.6" x2="39.3" y2="39.3" strokeOpacity="0.4"/>
                  <line x1="8.7" y1="39.3" x2="13.4" y2="34.6" strokeOpacity="0.4"/>
                  <line x1="34.6" y1="13.4" x2="39.3" y2="8.7" strokeOpacity="0.4"/>
                  <polygon points="24,19 27,24 24,29 21,24"
                    fill="var(--gold)" fillOpacity="0.7" stroke="none"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>{/* end inner */}
    </section>
  );
}
