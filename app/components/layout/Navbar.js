'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const DIAMOND = (
  <svg viewBox="0 0 24 24">
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="currentColor" />
  </svg>
);

const navLinks = [
  { label: 'Process', href: '/process' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <Link href="/" className={styles.logo}>
        <div className={styles.logoMark}>
          <div className={styles.logoMarkInner}>
            <span className={styles.lmT}>T</span>
            <span className={styles.lmS}>S</span>
          </div>
        </div>
        <div className={styles.logoText}>
          <span className={styles.ltMain}>The Spatial Edit</span>
          <span className={styles.ltSub}>Spatial Design Studio</span>
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