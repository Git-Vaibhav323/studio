'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Process.module.css';

export const steps = [
  {
    num: '01',
    label: 'DISCOVERY',
    desc: 'We understand your life, needs, and vision. Every great space begins with the right questions.',
    expandedTitle: 'DISCOVERY CALL',
    expandedText: 'We begin with a detailed conversation about your life — how you use your home, what frustrates you, your vision and budget. No assumptions.',
    expandedList: ['In-depth lifestyle interview', 'Site visit scheduling', 'Budget & timeline alignment'],
    expandedNote: 'Typically 60–90 minutes. In-person or video call.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <circle cx="10" cy="10" r="6"/>
        <path d="M14.5 14.5L19 19" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    num: '02',
    label: 'SPATIAL PLAN',
    desc: 'We create the blueprint for how your space will work — layout, circulation, light and proportion.',
    expandedTitle: 'SPATIAL PLAN',
    expandedText: 'We create the blueprint for how your space will work.',
    expandedList: ['Layout & circulation planning', 'Proportion & scale optimisation', 'Natural light mapping', 'Zone definition & adjacencies'],
    expandedNote: 'The spatial plan is the foundation of everything that follows.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18"/>
        <line x1="12" y1="3" x2="12" y2="21"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
      </svg>
    ),
  },
  {
    num: '03',
    label: 'DESIGN',
    desc: 'Aesthetic direction, material selections, furniture planning — all aligned with how the space functions.',
    expandedTitle: 'DESIGN DEVELOPMENT',
    expandedText: 'Two to three distinct design directions developed into full concept presentations.',
    expandedList: ['Mood boards & material palettes', 'Furniture plans & layouts', '3D visualisations', 'Design sign-off'],
    expandedNote: 'You choose the direction. We refine it to perfection.',
    image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=400&q=80',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    num: '04',
    label: 'EXECUTION',
    desc: 'Civil work, carpentry, installations — managed end-to-end with one point of contact throughout.',
    expandedTitle: 'EXECUTION & BUILD',
    expandedText: 'We manage every contractor and supplier — so you never have to coordinate across multiple vendors.',
    expandedList: ['Civil & structural work', 'Carpentry & custom joinery', 'FF&E procurement', 'Quality control at each stage'],
    expandedNote: 'Weekly update reports keep you fully informed.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    num: '05',
    label: 'HANDOVER',
    desc: 'Your home, delivered. Complete documentation, walkthrough, and ongoing aftercare from our studio.',
    expandedTitle: 'HANDOVER & AFTERCARE',
    expandedText: 'We walk you through your completed home — explaining every system, surface, and specification.',
    expandedList: ['Complete documentation package', 'Maintenance & care guide', '30-day aftercare support', 'Site snagging & resolution'],
    expandedNote: 'Our relationship continues well beyond handover day.',
    image: 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?auto=format&fit=crop&w=400&q=80',
    icon: (
      <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
];

export default function Process() {
  const [hovered, setHovered] = useState(null);
  const [tapped, setTapped] = useState(null); // mobile tap state
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    let scrollListenerActive = true;

    const handleScroll = () => {
      if (!scrollListenerActive || !sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;
      
      // Calculate progress based on section visibility
      const scrollProgress = Math.max(0, Math.min(1, 
        (windowHeight - rect.top) / (windowHeight + sectionHeight)
      ));
      
      setProgress(scrollProgress * 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      scrollListenerActive = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section id="process" className={styles.section} ref={sectionRef}>
      {/* Side visuals and number removed per request */}

      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          {/* header label removed per request */}
        </div>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>Our <span>Process.</span></h2>
        </div>
        <div className={styles.titleDivider}>
          <div className={styles.divLine} />
          <div className={styles.divDiamond}>
            <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg>
          </div>
          <div className={styles.divLine} />
        </div>
        <p className={styles.subtitle}>END TO END. THOUGHTFUL AT EVERY STEP.</p>

        {/* Timeline */}
        <div className={styles.timeline}>
          <div className={styles.timelineLine} />
          {steps.map((step) => {
          const isOpen = isMobile ? tapped === step.num : hovered === step.num;
            return (
              <div
                key={step.num}
                className={`${styles.step} ${isOpen ? styles.stepOpen : ''}`}
                onMouseEnter={() => !isMobile && setHovered(step.num)}
                onMouseLeave={() => !isMobile && setHovered(null)}
                onClick={() => isMobile && setTapped(tapped === step.num ? null : step.num)}
              >
                <div className={styles.stepCircle}>{step.num}</div>
                <div className={styles.stepLabel}>{step.label}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <p className={styles.stepDesc}>{step.desc}</p>
                <div className={styles.stepDivider} />

                {/* Expanded card — slides in on hover, matching step 2 reference */}
                <div className={`${styles.expandedCard} ${isOpen ? styles.expandedVisible : ''}`}>
                  <div className={styles.expTopDiamond}>
                    <svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg>
                  </div>
                  <div className={styles.expLeft}>
                    {step.image && (
                      <Image src={step.image} alt={step.label} fill style={{objectFit:'cover'}} />
                    )}
                  </div>
                  <div className={styles.expRight}>
                    <div className={styles.expTitle}>{step.expandedTitle}</div>
                    <div className={styles.expDivider}>
                      <div className={styles.expLine} />
                      <div className={styles.expDia}><svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg></div>
                      <div className={styles.expLine} />
                    </div>
                    <div className={styles.expText}>{step.expandedText}</div>
                    <ul className={styles.expList}>
                      {step.expandedList.map((item) => (
                        <li key={item}>
                          <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 12l3 3 5-6"/>
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className={styles.expNote}>{step.expandedNote}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* footer divider removed per request */}
    </section>
  );
}
