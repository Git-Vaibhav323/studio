import Image from 'next/image';
import styles from './SpatialIntelligence.module.css';

const cards = [
  {
    id: 'card-flow',
    num: '01',
    title: 'Flow Mapping',
    desc: 'We map how you move through every room — every door, corridor, and daily routine — before a single piece of furniture is placed or a wall is touched.',
    img: '/images/floor_plan_rect.png',
    imgAlt: 'Architectural floor plan with flow mapping paths',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="1"/>
        <line x1="3"  y1="10" x2="12" y2="10"/>
        <line x1="12" y1="3"  x2="12" y2="10"/>
        <line x1="8"  y1="10" x2="8"  y2="21"/>
        <line x1="8"  y1="16" x2="12" y2="16"/>
        <line x1="12" y1="16" x2="12" y2="21"/>
      </svg>
    ),
    featured: false,
  },
  {
    id: 'card-proportion',
    num: '02',
    title: 'Proportion Planning',
    desc: 'Scale determines how a space feels. We ensure every element — from ceiling height to furniture depth — is proportioned precisely for your specific space.',
    img: '/images/proportion_room.png',
    imgAlt: 'Living room with proportion measurement overlays',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="13" rx="1"/>
        <line x1="12" y1="7"    x2="12" y2="20"/>
        <line x1="2"  y1="13.5" x2="22" y2="13.5"/>
        <polyline points="7,4 12,7 17,4"/>
      </svg>
    ),
    featured: true,
  },
  {
    id: 'card-light',
    num: '03',
    title: 'Light Intelligence',
    desc: 'We study how natural light moves through your home at different times of day before deciding where to place workspaces, rest zones, and feature walls.',
    img: '/images/light_room.png',
    imgAlt: 'Bright room with natural light streaming through curtains',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2"  x2="12" y2="5"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="2"  y1="12" x2="5"  y2="12"/>
        <line x1="19" y1="12" x2="22" y2="12"/>
        <line x1="5.64"  y1="5.64"  x2="7.76"  y2="7.76"/>
        <line x1="16.24" y1="16.24" x2="18.36" y2="18.36"/>
        <line x1="5.64"  y1="18.36" x2="7.76"  y2="16.24"/>
        <line x1="16.24" y1="7.76"  x2="18.36" y2="5.64"/>
      </svg>
    ),
    featured: false,
  },
];

export default function SpatialIntelligence() {
  return (
    <section id="spatial" className={styles.section}>
      <div className={styles.vline} />
      
      <div className={styles.diamond + ' ' + styles.diaTop} />
      <div className={styles.diamond + ' ' + styles.diaMid} />
      <div className={styles.diamond + ' ' + styles.diaBot} />
      
      <div className={styles.sideLabel}>THE SPATIAL EDIT</div>

      <div className={styles.inner}>
        <div className={styles.grid}>

          <div className={styles.left}>
            <div className={styles.overline}>
              <span className={styles.overlineBar} />
              Our Difference
            </div>
            <div className={styles.overrule}>
              <div className={styles.overruleLine} />
              <div className={styles.overruleDot} />
              <div className={styles.overruleLine} />
            </div>

            <h2 className={styles.headline}>
              Built On<br />
              <span className={styles.gold}>Spatial<br />Intelligence.</span>
            </h2>

            <p className={styles.desc}>
              Three things we solve before design begins.
              Because the way a space works is what
              makes it beautiful, functional and effortless
              to live in.
            </p>

          </div>

          <div className={styles.cardsRow}>
            {cards.map((card) => (
              <div
                key={card.id}
                id={card.id}
                className={`${styles.archCard} ${card.featured ? styles.featured : ''}`}
              >
                <div className={styles.iconWrap}>
                  <div className={styles.iconInner}>
                    {card.icon}
                  </div>
                </div>

                <p className={styles.cardNum}>{card.num}</p>
                <div className={styles.cardRule} />
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDesc}>{card.desc}</p>

                <div className={styles.cardImg}>
                  <div className={styles.cardImgFade} />
                  <Image
                    src={card.img}
                    alt={card.imgAlt}
                    fill
                    style={{objectFit:'cover', objectPosition:'center top'}}
                  />
                </div>

                {(card.featured || true) && <div className={styles.featDiamond} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}