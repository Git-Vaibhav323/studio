'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import styles from './Navbar.module.css';

const DIAMOND = (
  <svg viewBox="0 0 24 24">
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="currentColor" />
  </svg>
);

const baseNavLinks = [
  { label: 'Process', href: '/process' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects', requiresProjects: true },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasProjects, setHasProjects] = useState(true); // optimistic — hide only if confirmed 0
  const pathname = usePathname();

  useEffect(() => {
    let scrolledNow = window.scrollY > 50;
    setScrolled(scrolledNow);
    let raf = 0;

    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const next = window.scrollY > 50;
        if (next !== scrolledNow) {
          scrolledNow = next;
          setScrolled(next);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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

  const navLinks = baseNavLinks.filter(
    (l) => !l.requiresProjects || hasProjects
  );

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <Link href="/" className={styles.logo}>
        <Image
          src="/logo.png"
          alt="The Spatial Edit"
          width={68}
          height={68}
          style={{ objectFit: 'contain' }}
          priority
        />
        <div className={styles.logoText}>
          <span className={styles.ltMain}>The Spatial Edit</span>
          <span className={styles.ltSub}>Interior Design Studio</span>
        </div>
      </Link>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
        {navLinks.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={pathname === l.href ? styles.navLinkActive : ''}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.navRight}>
        <Link href="/contact" className={styles.navCta}>
          {DIAMOND}
          <span>Book a Consultation</span>
        </Link>
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
