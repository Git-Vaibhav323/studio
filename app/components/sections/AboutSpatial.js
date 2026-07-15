'use client';

import Image from 'next/image';
import styles from './AboutSpatial.module.css';

export default function AboutSpatial() {
  return (
    <section id="about" className={styles.section}>

      {/* Directional warm light overlay */}
      <div className={styles.lightOverlay} aria-hidden="true" />

      {/* Left edge rule + rotated label */}
      <div className={styles.vline} />
      <div className={styles.sideLabel}>THE THINKING BEFORE THE DESIGN</div>

      {/*
        Top-right kicker label ("THE SPATIAL EDIT · 03") is baked into
        rightfinal.png — the live JSX version is removed to avoid duplication.
      */}

      <div className={styles.inner}>

        {/* ── TWO-COLUMN ROW: left text | right flat image ── */}
        <div className={styles.mainRow}>

          {/* ── LEFT COL — untouched ───────────────────────── */}
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
              <span className={styles.gold}>Always</span><span className={styles.goldDot} aria-hidden="true" />
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
              <div className={styles.statementRow}>
                <p>A HOME THAT WORKS BEAUTIFULLY IS NEVER BY CHANCE.<br />IT IS DESIGNED WITH INTELLIGENCE.</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COL — single flattened image ─────────── */}
          <div className={styles.rightImage}>
            {/*
              rightfinal.png (696×772px, AR 0.9016) contains:
              — Floor plan with dashed circulation paths
              — Connector lines + numbered annotation cards (01 Circulation,
                02 Proportion, 03 Light)
              — "AT ITS CORE, SPATIAL DESIGN ASKS" card with compass rose
              — "THE SPATIAL EDIT · 03" kicker label (top-right corner)
              All baked into one image; the live JSX equivalents are removed.

              ⚠ Legibility note: at 375px viewport this image renders at ~335px wide.
              The card text (title ~9px, body ~8px equivalent) becomes very small.
              If readability matters at mobile, consider a separate mobile crop or
              reverting to live cards at that breakpoint.
            */}
            <Image
              src="/images/rightfinal.png"
              alt="Spatial design annotation system: a floor plan with connector lines leading to three cards — 01 Circulation (how you move through every room), 02 Proportion (how scale determines how a space feels), 03 Light (how natural light moves through your home). Below the floor plan: 'Does this room work for the life being lived inside it?' — an analysis of layout, circulation, proportion, natural light, acoustics, and the relationship between rooms, all before a single finish or furniture piece is chosen."
              width={696}
              height={772}
              priority
              className={styles.rightFlatImage}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 696px"
            />
          </div>

        </div>{/* end mainRow */}

      </div>{/* end inner */}
    </section>
  );
}
