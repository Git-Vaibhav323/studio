'use client';

import Image from 'next/image';
import { useRevealAnimation, useStaggerChildren } from '@/lib/useRevealAnimation';
import styles from './OurStory.module.css';

export default function OurStory() {
  const titleRef = useRevealAnimation(100);
  const founderParaRef = useRevealAnimation(200);
  const colsRef = useStaggerChildren(140, 'slideUp');
  const cardRef = useRevealAnimation(300);

  return (
    <section id="story" className={styles.section}>
      {/* Top bar and left sidebar removed per request */}

      {/* Main Content Grid */}
      <div className={styles.mainContent}>
        
        {/* LEFT COLUMN */}
        <div className={styles.leftCol}>
          <h2 className={`${styles.title} homeSectionTitle`} ref={titleRef}>Our <span className={styles.titleGold}>Story.</span></h2>
          {/* subtitle removed per request */}
          
          <div className={styles.separatorShort}>
            <div className={styles.sepLine} />
            <div className={styles.sepDia}>
              <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg>
            </div>
            <div className={styles.sepLine} />
          </div>

          <p className={styles.founderPara} ref={founderParaRef}>
            The Spatial Edit was founded by Preksha Bhargav and Krishna Bhargav — partners in life, who started this studio for a very personal reason.
          </p>

          <div className={styles.separatorLong}>
            <div className={styles.sepLine} />
            <div className={styles.sepDia}>
              <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg>
            </div>
            <div className={styles.sepLine} />
          </div>

          <div className={styles.threeCols} ref={colsRef}>
            {/* Col 1 */}
            <div className={styles.storyCol}>
              <div className={styles.iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1">
                  {/* Custom intricate house icon */}
                  <path d="M1.5 10.5L12 2.5L22.5 10.5" strokeWidth="1.2" />
                  <path d="M4 12V21H20V12" />
                  <path d="M10 21V14H14V21" />
                  <rect x="11.5" y="17" width="1" height="1" fill="var(--gold)" stroke="none" />
                  <path d="M17 6.5V3H19V8" />
                </svg>
              </div>
              <div className={styles.storyText}>
                It didn&apos;t begin in a design studio.<br/>It began in a home that wasn&apos;t working, a home that didn&apos;t feel like theirs.
              </div>
            </div>
            {/* Col 2 */}
            <div className={styles.storyCol}>
              <div className={styles.iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <div className={styles.storyText}>
                When they were expecting their first baby, in the third trimester, the couple moved into a new apartment. They had hired an interior designer.
              </div>
            </div>
            {/* Col 3 */}
            <div className={styles.storyCol}>
              <div className={styles.iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12c0-3 8-3 8 0s-8 3-8 0" />
                  <path d="M12 8c3 0 3 8 0 8s-3-8 0-8" />
                </svg>
              </div>
              <div className={styles.storyText}>
                Delays and poor decisions left them directing their own design and site visits. <span>Many homeowners face the same disorganised process.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightCol}>
          
          {/* Unified Founder Card */}
          <div className={styles.founderCard} ref={cardRef}>
            <div className={styles.imageBox}>
              <div className={styles.imageInner}>
                <Image
                  src="https://i0.wp.com/picjumbo.com/wp-content/uploads/luxury-womens-salon-gold-and-white-interior-design-free-image.jpeg?w=600&quality=80"
                  alt="Luxury gold and white interior design"
                  fill
                  sizes="(max-width: 900px) 100vw, 520px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>

          {/* Text and Quote Section with Vertical Line */}
          <div className={styles.rightContentWrap}>
            <div className={styles.rightVerticalLine}>
              <div className={styles.vdia1}>
                <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg>
              </div>
              <div className={styles.vdia2}>
                <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg>
              </div>
            </div>
            
            <div className={styles.rightContent}>
              <div className={styles.gapText}>
                That gap stayed with them.<br/>
                Two babies later and with lot of thinking, research, and groundwork behind them, they built The Spatial Edit.
              </div>


              <div className={styles.quoteBlock}>
                <div className={styles.quoteMarks}>&ldquo;</div>
                <div className={styles.quoteText}>
                  We don&apos;t just design your space.<br/>We ensure it is executed exactly as designed.&rdquo;
                </div>
                {/* quote author removed per request */}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* footer divider removed per request */}
    </section>
  );
}
