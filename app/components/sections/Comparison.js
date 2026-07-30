import Image from 'next/image';
import styles from './Comparison.module.css';

const withoutItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
        <path d="M20 9v11H4V9m16 0c0-1.66-1.34-3-3-3H7C5.34 6 4 7.34 4 9m16 0H4"/>
      </svg>
    ),
    title: 'Beautiful but awkward',
    desc: 'The layout looks fine, but living in it feels off.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8 8l8 8M16 8l-8 8"/><circle cx="12" cy="12" r="10"/>
      </svg>
    ),
    title: 'Poor furniture flow',
    desc: 'Hard to move around. Spaces feel blocked.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 3h12M6 8h12M9 3l6 18"/><line x1="7" y1="13" x2="16" y2="13"/>
      </svg>
    ),
    title: 'Expensive mistakes',
    desc: 'Changes later mean extra cost, time and stress.',
  },
];

const withItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
        <path d="M20 9v11H4V9m16 0c0-1.66-1.34-3-3-3H7C5.34 6 4 7.34 4 9m16 0H4"/>
        <path d="M12 11c-1.1-1-2.5-1-3.5 0-1 1-1 2.5 0 3.5l3.5 3.5 3.5-3.5c1-1 1-2.5 0-3.5-1-1-2.4-1-3.5 0z"/>
      </svg>
    ),
    title: 'Beautiful and effortless',
    desc: 'Thoughtful planning creates spaces that feel just right.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2v20M8 6h8M8 18h8"/>
      </svg>
    ),
    title: 'Smooth circulation',
    desc: 'Easy movement, logical flow, and connected spaces.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1"/>
        <line x1="9" y1="10" x2="15" y2="10"/>
        <line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
    ),
    title: 'Smart planning',
    desc: 'Right decisions upfront save cost, time and stress.',
  },
];

export default function Comparison() {
  return (
    <section id="comparison" className={styles.section}>
      {/* Vertical decoration removed per request */}

      {/* Blueprint bg */}
      <div className={styles.blueprintBg} />
      <div className={styles.compassBg} />

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          {/* header label/number removed per request */}
          <h2 className={styles.title}>
            Why It Comes<br />
            <span>Before Aesthetics.</span>
          </h2>
        </div>

        {/* Cards — symmetrical, pushed lower */}
        <div className={styles.cardsWrap}>
          {/* Card 1 — Without */}
          <div className={styles.card}>                 
                <div className={styles.cardHeader}>
              <div className={styles.badgeIcon}>
                 <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
              </div>
              <div className={styles.badgeText}>
                <h4>Without Spatial Design</h4>
                <p>Looks good. Doesn&apos;t Work.</p>
              </div>
            </div>
            <div className={styles.imageBox}>
              <Image src="/images/without_spatial_room.png" alt="Awkward room flow" fill style={{objectFit:'cover'}} />
            </div>
            <div className={styles.list}>
              {withoutItems.map((item) => (
                <div className={styles.row} key={item.title}>
                  <div className={styles.rowIcon}>{item.icon}</div>
                  <div className={styles.rowTextWrap}>
                    <div className={styles.rowTitle}>{item.title}</div>
                    <div className={styles.rowDesc}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 — With */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.badgeIcon}>
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className={styles.badgeText}>
                <h4>With Spatial Design</h4>
                <p>Looks good. Works beautifully.</p>
              </div>
            </div>
            <div className={styles.imageBox}>
              <Image src="/images/with_spatial_room.png" alt="Smooth room flow" fill style={{objectFit:'cover'}} />
            </div>
            <div className={styles.list}>
              {withItems.map((item) => (
                <div className={styles.row} key={item.title}>
                  <div className={styles.rowIcon}>{item.icon}</div>
                  <div className={styles.rowTextWrap}>
                    <div className={styles.rowTitle}>{item.title}</div>
                    <div className={styles.rowDesc}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
