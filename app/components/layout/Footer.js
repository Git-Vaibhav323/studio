'use client';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer id="footer" className={styles.footer}>
      {/* Top star divider */}
      <div className={styles.topLine}>
        <div className={styles.topStar}>
          <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="#b4904f"/></svg>
        </div>
      </div>

      <div className={styles.inner}>
        {/* Brand column */}
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            <svg viewBox="0 0 40 40" width="44" height="44">
              <path d="M20 2v36M12 10h16M14 20h12M12 30h16" stroke="#b4904f" strokeWidth="2" fill="none"/>
            </svg>
            <div>
              <div className={styles.logoName}>The Spatial Edit</div>
              <div className={styles.logoSub}>Spatial Design Studio</div>
            </div>
          </div>
          <p className={styles.brandDesc}>
            We design thoughtful, timeless spaces that are as functional as they are beautiful. From concept to completion, we shape environments that elevate everyday living.
          </p>
          <a href="#contact" className={styles.ctaBtn}>
            BOOK DISCOVERY CALL
            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <div className={styles.social}>
            <div className={styles.socialLabel}>FOLLOW US</div>
            <div className={styles.socialIcons}>
              {[
                { label:'Instagram', svg:<svg viewBox="0 0 24 24" fill="var(--cream)" strokeWidth="1.5" stroke="var(--cream)"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="none"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="#111"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#111" strokeWidth="2"/></svg> },
                { label:'LinkedIn', svg:<svg viewBox="0 0 24 24" fill="var(--cream)" strokeWidth="0"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="var(--cream)"/><rect x="2" y="9" width="4" height="12" fill="var(--cream)"/><circle cx="4" cy="4" r="2" fill="var(--cream)"/></svg> },
                { label:'YouTube', svg:<svg viewBox="0 0 24 24" fill="var(--cream)"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#111"/></svg> },
              ].map((s) => (
                <a href="#" key={s.label} className={styles.socialIcon} aria-label={s.label}>{s.svg}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Links columns */}
        <div className={styles.linksWrap}>
          {[
            { heading: 'STUDIO', links: ['About Us','Our Approach','Process','Projects','Journal','Careers','Contact'] },
            { heading: 'SERVICES', links: ['Spatial Planning','Space Optimization','Concept Design','Design Development','Project Coordination','FF&E & Styling'] },
            { heading: 'SPACES', links: ['Villas & Bungalows','Apartments','Penthouses','Commercial','Renovations'] },
            { heading: 'RESOURCES', links: ['Blog','Guides','FAQs','Materials','Downloads'] },
          ].map((col) => (
            <div className={styles.linkCol} key={col.heading}>
              <div className={styles.linkHeading}>{col.heading}</div>
              {col.links.map((l) => (
                <a href="#" className={styles.link} key={l}>{l}</a>
              ))}
            </div>
          ))}
        </div>

        {/* Newsletter column */}
        <div className={styles.subCol}>
          <div className={styles.subIcon}>
            <svg viewBox="0 0 24 24" stroke="var(--gold)" fill="none" strokeWidth="1.2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div className={styles.subTitle}>STAY INSPIRED</div>
          <p className={styles.subDesc}>Design ideas, project insights, and curated inspiration — straight to your inbox.</p>
          <form className={styles.subForm} onSubmit={(e) => e.preventDefault()}>
            <input type="email" className={styles.subInput} placeholder="Your email address" />
            <button type="submit" className={styles.subBtn}>
              SUBSCRIBE
              <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>
          <div className={styles.privacy}>
            <svg viewBox="0 0 24 24" stroke="rgba(246,240,230,0.4)" fill="none" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            We respect your privacy.
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.bottomStar}>
          <svg viewBox="0 0 24 24" stroke="var(--gold)" fill="none" strokeWidth="1" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            <line x1="4.93" y1="19.07" x2="19.07" y2="4.93"/>
          </svg>
        </div>
        <div className={styles.copy}>&copy; 2024 The Spatial Edit. All rights reserved.</div>
        <div className={styles.legal}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
