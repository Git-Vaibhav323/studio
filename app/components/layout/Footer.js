'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import styles from './Footer.module.css';

export default function Footer() {
  const [hasProjects, setHasProjects] = useState(true);

  useEffect(() => {
    const checkProjects = async () => {
      const supabase = createSupabaseClient();
      if (!supabase) return;
      try {
        const { count } = await supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published');
        setHasProjects((count ?? 0) > 0);
      } catch {
        // keep optimistic default
      }
    };
    checkProjects();
  }, []);

  const studioLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Process', href: '/process' },
    { label: 'Services', href: '/services' },
    ...(hasProjects ? [{ label: 'Projects', href: '/projects' }] : []),
    { label: 'Insights', href: '/insights' },
    { label: 'Contact', href: '/contact' },
  ];

  const spacesLinks = hasProjects ? [
    { label: 'Villas & Bungalows', href: '/projects' },
    { label: 'Apartments', href: '/projects' },
    { label: 'Penthouses', href: '/projects' },
    { label: 'Commercial', href: '/projects' },
    { label: 'Renovations', href: '/projects' },
  ] : [];

  const linkColumns = [
    { heading: 'STUDIO', links: studioLinks },
    {
      heading: 'SERVICES',
      links: [
        { label: 'Spatial Planning', href: '/services' },
        { label: 'Space Optimization', href: '/services' },
        { label: 'Concept Design', href: '/services' },
        { label: 'Design Development', href: '/services' },
        { label: 'Project Coordination', href: '/services' },
        { label: 'FF&E & Styling', href: '/services' },
      ],
    },
    ...(spacesLinks.length > 0 ? [{ heading: 'SPACES', links: spacesLinks }] : []),
    {
      heading: 'RESOURCES',
      links: [
        { label: 'Blog', href: '/insights' },
        { label: 'FAQs', href: '/#faqs' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms' },
      ],
    },
  ];

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
          <p className={styles.brandDesc}>
            We design thoughtful, timeless spaces that are as functional as they are beautiful. From concept to completion, we shape environments that elevate everyday living.
          </p>
          <Link href="/contact" className={styles.ctaBtn}>
            BOOK DISCOVERY CALL
            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
          <div className={styles.social}>
            <div className={styles.socialLabel}>FOLLOW US</div>
            <div className={styles.socialIcons}>
              {[
                { label:'Instagram', href:'https://www.instagram.com/thespatialedits/', svg:<svg viewBox="0 0 24 24" fill="var(--cream)" strokeWidth="1.5" stroke="var(--cream)"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="none"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="#111"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#111" strokeWidth="2"/></svg> },
                { label:'WhatsApp', href:'https://wa.me/919100094547', svg:<svg viewBox="0 0 24 24" fill="var(--cream)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.122 1.526 5.853L.047 23.8a.5.5 0 0 0 .628.628l5.946-1.479A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.022-1.381l-.36-.214-3.732.928.944-3.641-.235-.374A9.808 9.808 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg> },
              ].map((s) => (
                <a href={s.href} key={s.label} className={styles.socialIcon} aria-label={s.label} target="_blank" rel="noopener noreferrer">{s.svg}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Links columns */}
        <div className={styles.linksWrap}>
          {linkColumns.map((col) => (
            <div className={styles.linkCol} key={col.heading}>
              <div className={styles.linkHeading}>{col.heading}</div>
              {col.links.map((l) => (
                <Link href={l.href} className={styles.link} key={l.label}>
                  {l.label}
                </Link>
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
            <input suppressHydrationWarning type="email" className={styles.subInput} placeholder="Your email address" />
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
        <div className={styles.copy}>&copy; 2026 The Spatial Edit. All rights reserved.</div>
        <div className={styles.legal}>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms">Terms &amp; Conditions</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}
