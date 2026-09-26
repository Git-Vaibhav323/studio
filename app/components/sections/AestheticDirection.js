'use client';
'use client';
import Image from 'next/image';
import { useRevealAnimation, useStaggerChildren } from '@/lib/useRevealAnimation';
import styles from './AestheticDirection.module.css';

const cards = [
  { num: '01', title: 'Minimalism', img: '/minimlisim.jpg', desc: 'Less, but better. Clean lines, soft neutral tones, and nothing that doesn\'t need to be there. Every piece chosen with intention — so the space feels calm, spacious, and effortless.' },
  { num: '02', title: 'Contemporary Indian', img: '/contemporyindia.jpg', desc: 'Modern living with Indian soul. Handcrafted textures, warm woods, and traditional motifs reimagined for how we live today — familiar, yet entirely current.' },
  { num: '03', title: 'Biophilic Living', img: '/biophilic.jpg', desc: 'Designed to breathe. Natural light, greenery, and organic textures bring the calm of the outdoors in — spaces that feel alive, not just decorated.' },
  { num: '04', title: 'Eclectic Luxury', img: '/images/hero_living_room.png', desc: 'Bold, layered, and unmistakably yours. Rich textures and statement pieces come together with confidence — a home that feels curated, not matched.' },
];

export default function AestheticDirection() {
  const titleRef = useRevealAnimation(0);
  const subtitleRef = useRevealAnimation(150);
  const descRef = useRevealAnimation(250);
  const carouselWrapperRef = useStaggerChildren(140, 'slideUp');

  return (
    <section id="aesthetics" className={styles.section}>
      {/* side visuals removed per request */}

      <div className={styles.content}>
        <div className={styles.header}>
          {/* header labels removed per request */}
        </div>

        <div className={styles.titleBlock}>
          <h2 className="homeSectionTitle" ref={titleRef}>Our Aesthetic <span>Direction</span></h2>
          <div className={styles.titleDivider}>
            <div className={styles.divLine} />
            <div className={styles.divDiamond}>
              <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)" /></svg>
            </div>
            <div className={styles.divLine} />
          </div>
          <div className={styles.trSubtitle} ref={subtitleRef}>THE AESTHETICS WE LOVE MOST.</div>
          <div className={styles.trDesc} ref={descRef}>Every style begins with how the space works, and then we curate its soul.</div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.carouselWrapper}>
          <div className={styles.carousel} ref={carouselWrapperRef}>
            {cards.map((card) => (
              <div className={styles.card} key={card.num}>
                <div className={styles.cardTop}>
                  <Image src={card.img} alt={card.title} fill sizes="(max-width: 768px) 50vw, 25vw" style={{objectFit:'cover'}} />
                  <div className={styles.cardNumber}>{card.num}</div>
                </div>
                <div className={styles.cardBottom}>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* footer divider removed per request */}
    </section>
  );
}
