'use client';
import { useRef } from 'react';
import Image from 'next/image';
import styles from './AestheticDirection.module.css';

const cards = [
  { num: '01', title: 'Minimalism', img: '/images/card_light.png', desc: 'Less, but better. Clean lines, soft neutral tones, and nothing that doesn\'t need to be there. Every piece chosen with intention — so the space feels calm, spacious, and effortless.' },
  { num: '02', title: 'Contemporary Indian', img: '/images/card_proportion.png', desc: 'Modern living with Indian soul. Handcrafted textures, warm woods, and traditional motifs reimagined for how we live today — familiar, yet entirely current.' },
  { num: '03', title: 'Biophilic Living', img: '/images/card_circulation.png', desc: 'Designed to breathe. Natural light, greenery, and organic textures bring the calm of the outdoors in — spaces that feel alive, not just decorated.' },
  { num: '04', title: 'Eclectic Luxury', img: '/images/hero_living_room.png', desc: 'Bold, layered, and unmistakably yours. Rich textures and statement pieces come together with confidence — a home that feels curated, not matched.' },
  { num: '05', title: 'Eclectic Luxury', img: '/images/hero_living_room.png', desc: 'Bold, layered, and unmistakably yours. Rich textures and statement pieces come together with confidence — a home that feels curated, not matched.' },
  { num: '06', title: 'Eclectic Luxury', img: '/images/hero_living_room.png', desc: 'Bold, layered, and unmistakably yours. Rich textures and statement pieces come together with confidence — a home that feels curated, not matched.' },
];

export default function AestheticDirection() {
  const carouselRef = useRef(null);

  const scroll = (dir) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section id="aesthetics" className={styles.section}>
      {/* side visuals removed per request */}

      <div className={styles.content}>
        <div className={styles.header}>
          {/* header labels removed per request */}
        </div>

        <div className={styles.titleBlock}>
          <div className={styles.titleLeft}>
            <div className={styles.titleText}>
              <h2>Aesthetic <span>Direction</span></h2>
            </div>
          </div>
          <div className={styles.titleRight}>
            <div className={styles.titleStar}>
              <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg>
            </div>
            <div className={styles.trSubtitle}>THE AESTHETICS WE LOVE MOST.</div>
            <div className={styles.trDesc}>Every style begins with how the space works, and then we curate its soul.</div>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.carouselWrapper}>
          <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={() => scroll(-1)} aria-label="Previous">
            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div className={styles.carousel} ref={carouselRef}>
            {cards.map((card) => (
              <div className={styles.card} key={card.num}>
                <div className={styles.cardTop}>
                  <Image src={card.img} alt={card.title} fill style={{objectFit:'cover'}} />
                  <div className={styles.cardNumber}>{card.num}</div>
                </div>
                <div className={styles.cardBadge}>
                  <svg viewBox="0 0 24 24" stroke="var(--gold)" fill="none" strokeWidth="1.2" strokeLinecap="round">
                    <line x1="6" y1="12" x2="18" y2="12"/>
                  </svg>
                </div>
                <div className={styles.cardBottom}>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={() => scroll(1)} aria-label="Next">
            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div className={styles.footer}>
          <div className={`${styles.footerLine} ${styles.left}`} />
          <div className={styles.footerText}>SCROLL TO EXPLORE</div>
          <div className={`${styles.footerLine} ${styles.right}`} />
        </div>
      </div>

      {/* footer divider removed per request */}
    </section>
  );
}
