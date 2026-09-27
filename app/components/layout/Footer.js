import Image from 'next/image';
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
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            <Image
              src="/logo.png"
              alt="The Spatial Edit"
              width={64}
              height={64}
              style={{ objectFit: 'contain' }}
            />
            <div className={styles.logoText}>
              <div className={styles.logoName}>The Spatial Edit</div>
              <div className={styles.logoSub}>Interior Design Studio</div>
            </div>
          </div>
        </div>

        <div className={styles.infoCol}>
          <p className={styles.brandDesc}>
            We design thoughtful, timeless spaces that are as functional as they are beautiful. From concept to completion, we shape environments that elevate everyday living.
          </p>
        </div>

        <div className={styles.social}>
            <div className={styles.socialIcons}>
              {[
                { label:'Instagram', href:'https://www.instagram.com/thespatialedit.in/', icon:'/instagram.svg' },
                { label:'LinkedIn', href:'https://www.linkedin.com/in/preksha12/', icon:'/linkedin.svg' },
                { label:'WhatsApp', href:'https://wa.me/919100094547', icon:'/whatsapp.svg' },
              ].map((s) => (
                <a href={s.href} key={s.label} className={styles.socialIcon} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                  <Image src={s.icon} alt="" width={20} height={20} unoptimized />
                </a>
              ))}
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
        <div className={styles.credit}>
          <span>MADE BY</span>
          <Image src="/assanj-logo.png" alt="Assanj" width={112} height={92} />
        </div>
        <div className={styles.copy}>&copy; 2026 The Spatial Edit. All rights reserved.</div>
      </div>
    </footer>
  );
}
