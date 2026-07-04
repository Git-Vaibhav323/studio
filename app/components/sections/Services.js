'use client';
import { useState } from 'react';
import styles from './Services.module.css';

export const services = [
  {
    num: '01', title: 'Site Assessment',
    preview: '/images/blueprint_desk.png',
    shortTitle: 'Site\nAssess',
    desc: 'We visit and analyse your site — documenting dimensions, light conditions, structural elements, and spatial constraints before planning begins.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="12" y2="17"/>
        <circle cx="15.5" cy="17.5" r="3.5"/>
        <line x1="18" y1="20" x2="21" y2="23"/>
      </svg>
    ),
  },
  {
    num: '02', title: 'Spatial Planning',
    preview: '/images/floor_plan_rect.png',
    shortTitle: 'Spatial\nPlanning',
    desc: 'Every room is planned for circulation, proportion and light — creating a spatial blueprint that guides every design decision downstream.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18"/>
        <line x1="12" y1="3" x2="12" y2="10"/>
        <line x1="12" y1="14" x2="12" y2="21"/>
        <line x1="3" y1="12" x2="10" y2="12"/>
        <line x1="14" y1="12" x2="21" y2="12"/>
        <rect x="6" y="6" width="3" height="3"/>
        <rect x="15" y="6" width="3" height="3"/>
        <rect x="6" y="15" width="3" height="3"/>
        <rect x="15" y="15" width="3" height="3"/>
      </svg>
    ),
  },
  {
    num: '03', title: 'Design Concepts',
    preview: '/images/blueprint_sketch_v2.png',
    shortTitle: 'Design\nConcepts',
    desc: 'We develop two or three distinct aesthetic directions — mood boards, material palettes, and spatial renders — for you to choose from.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <path d="M16 11l4-4-2-2-4 4-2 6z"/>
      </svg>
    ),
  },
  {
    num: '04', title: 'Civil Work',
    preview: '/images/dining_space.png',
    shortTitle: 'Civil\nWork',
    desc: 'Structural changes, demolition, flooring, false ceilings, plumbing, electrical — all coordinated and executed with precision.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <rect x="2" y="6" width="20" height="14" rx="2"/>
        <path d="M2 10h20"/><path d="M6 14h4"/>
        <path d="M6 17h2"/>
      </svg>
    ),
  },
  {
    num: '05', title: 'Carpentry & Joinery',
    preview: '/images/kitchen_modern.png',
    shortTitle: 'Carpentry\n& Joinery',
    desc: 'Custom wardrobes, kitchen cabinetry, storage solutions, and bespoke joinery — crafted to exact specifications for each space.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M12 3L2 12h3v8h14v-8h3L12 3z"/>
        <rect x="9" y="14" width="6" height="6"/>
      </svg>
    ),
  },
  {
    num: '06', title: 'Furniture Selection',
    preview: '/images/bedroom_luxury.png',
    shortTitle: 'Furniture\nSelection',
    desc: 'We source and specify every furniture piece — ensuring each one is proportioned correctly and contributes to the spatial narrative.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M4 16s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="16"/>
      </svg>
    ),
  },
  {
    num: '07', title: 'Decor & Styling',
    preview: '/images/with_spatial_room.png',
    shortTitle: 'Decor\n& Styling',
    desc: 'Art, soft furnishings, lighting, accessories — the final layer that brings the aesthetic vision to life with careful curation.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M12 22c-4.97 0-9-2.24-9-5v-3"/>
        <path d="M21 14v3c0 2.76-4.03 5-9 5"/>
        <path d="M3 9v3"/><path d="M21 9v3"/>
        <ellipse cx="12" cy="9" rx="9" ry="5"/>
      </svg>
    ),
  },
  {
    num: '08', title: 'Installation & Execution',
    preview: '/images/floor_plan_rect.png',
    shortTitle: 'Installation\n& Execution',
    desc: 'We manage the full installation process — from coordinating contractors to quality-checking every detail before handover.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M12 2v6"/><path d="M6 8h12l-2 8H8l-2-8z"/>
        <path d="M10 16v4"/><path d="M14 16v4"/>
        <path d="M8 20h8"/>
      </svg>
    ),
  },
  {
    num: '09', title: 'Handover & Aftercare',
    preview: '/images/without_spatial_room.png',
    shortTitle: 'Handover\n& Aftercare',
    desc: 'A thorough walkthrough, documentation package, and ongoing aftercare support — because our relationship doesn\'t end at handover.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <circle cx="15" cy="9" r="4"/>
        <path d="M12.17 11.83L3 21v-4l4-4 2 2 3-3"/>
      </svg>
    ),
  },
];

export default function Services() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="services" className={styles.section}>
      <div className={styles.content}>
        <div className={styles.overline}>
          <div className={styles.overlineInner}>OUR ONLY SERVICE</div>
        </div>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>One Service. <span>Total Ownership.</span></h2>
        </div>
        <p className={styles.subtitle}>From site assessment to final handover.</p>

        <div className={styles.grid}>
          {services.map((s) => (
            <div
              key={s.num}
              className={`${styles.card} ${hovered === s.num ? styles.cardHovered : ''}`}
              onMouseEnter={() => setHovered(s.num)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Top-left corner: number + plus mark */}
              <div className={styles.cardMeta}>
                <span className={styles.cardNum}>{s.num}</span>
                <span className={styles.cardPlus}>+</span>
              </div>

              {/* Icon circle */}
              <div className={styles.cardIcon}>{s.icon}</div>

              {/* Divider with diamond */}
              <div className={styles.divider}>
                <div className={styles.divLine} />
                <div className={styles.divDiamond}>
                  <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg>
                </div>
                <div className={styles.divLine} />
              </div>

              {/* Title + description */}
              <div className={styles.cardTitle}>{s.title}</div>
              <p className={styles.cardDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
