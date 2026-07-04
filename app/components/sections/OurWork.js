import Image from 'next/image';
import styles from './OurWork.module.css';

const works = [
  {
    image: '/images/hero_living_room.png',
    title: 'LIVING ROOM',
  },
  {
    image: '/images/dining_space.png',
    title: 'DINING SPACE',
  },
  {
    image: '/images/kitchen_modern.png',
    title: 'KITCHEN',
  },
  {
    image: '/images/bedroom_luxury.png',
    title: 'BEDROOM',
  },
];

export default function OurWork() {
  return (
    <section id="work" className={styles.section}>
      {/* Top bar and left sidebar removed per request */}

      {/* Main Content */}
      <div className={styles.mainContent}>

        {/* Center Header */}
        <div className={styles.centerHeader}>
          <h2 className={styles.title}>
            Our <span>Work.</span>
          </h2>
          <div className={styles.separator}>
            <div className={styles.sepLine} />
            <div className={styles.sepDia}>
              <svg viewBox="0 0 24 24">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/>
              </svg>
            </div>
            <div className={styles.sepLine} />
          </div>
          <div className={styles.subtitle}>
            SPACES DESIGNED TO WORK. FINISHED TO LAST.
          </div>
        </div>

        {/* Cards Grid */}
        <div className={styles.grid}>
          {works.map((work) => (
            <div className={styles.card} key={work.title}>
              <div className={styles.imageBox}>
                <Image src={work.image} alt={work.title} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className={styles.cardFooter}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/>
                </svg>
                <div className={styles.cardFooterText}>{work.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* footer divider removed per request */}
    </section>
  );
}
