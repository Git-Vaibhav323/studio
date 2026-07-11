'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Process.module.css';

export const steps = [
  {
    num: '01',
    label: 'DISCOVERY',
    expandedTitle: 'DISCOVERY CALL',
    expandedText: 'We begin with a detailed conversation about your life — how you use your home, what frustrates you, your vision and budget. No assumptions.',
    expandedList: ['In-depth lifestyle interview', 'Site visit scheduling', 'Budget & timeline alignment'],
    expandedNote: 'Typically 60–90 minutes. In-person or video call.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  },
  {
    num: '02',
    label: 'SPATIAL PLAN',
    expandedTitle: 'SPATIAL PLAN',
    expandedText: 'We create the blueprint for how your space will work.',
    expandedList: ['Layout & circulation planning', 'Proportion & scale optimisation', 'Natural light mapping', 'Zone definition & adjacencies'],
    expandedNote: 'The spatial plan is the foundation of everything that follows.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  },
  {
    num: '03',
    label: 'DESIGN',
    expandedTitle: 'DESIGN DEVELOPMENT',
    expandedText: 'Two to three distinct design directions developed into full concept presentations.',
    expandedList: ['Mood boards & material palettes', 'Furniture plans & layouts', '3D visualisations', 'Design sign-off'],
    expandedNote: 'You choose the direction. We refine it to perfection.',
    image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&q=80',
  },
  {
    num: '04',
    label: 'EXECUTION',
    expandedTitle: 'EXECUTION & BUILD',
    expandedText: 'We manage every contractor and supplier — so you never have to coordinate across multiple vendors.',
    expandedList: ['Civil & structural work', 'Carpentry & custom joinery', 'FF&E procurement', 'Quality control at each stage'],
    expandedNote: 'Weekly update reports keep you fully informed.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  },
  {
    num: '05',
    label: 'HANDOVER',
    expandedTitle: 'HANDOVER & AFTERCARE',
    expandedText: 'We walk you through your completed home — explaining every system, surface, and specification.',
    expandedList: ['Complete documentation package', 'Maintenance & care guide', '30-day aftercare support', 'Site snagging & resolution'],
    expandedNote: 'Our relationship continues well beyond handover day.',
    image: 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?auto=format&fit=crop&w=800&q=80',
  },
];

const stageLabels = ['Discovery', 'Design', 'Documentation', 'Execution', 'Handover'];

export default function Process() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef(null);

  // Auto-advance active step on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionH = rect.height;
      const scrolled = -rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / (sectionH - window.innerHeight)));
      setActiveStep(Math.min(steps.length - 1, Math.floor(pct * steps.length)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const current = steps[activeStep];

  return (
    <section id="process" className={styles.section} ref={sectionRef}>
      <div className={styles.content}>

        {/* Header */}
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

        {/* Two-column body */}
        <div className={styles.body}>

          {/* LEFT — step selector + image */}
          <div className={styles.leftCol}>
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`${styles.stepRow} ${activeStep === i ? styles.stepRowActive : ''}`}
                onMouseEnter={() => setActiveStep(i)}
              >
                <div className={styles.stepNode}>
                  <span className={styles.stepNum}>{step.num}</span>
                  {i < steps.length - 1 && <div className={styles.stepConnector} />}
                </div>
                <div className={styles.stepMeta}>
                  <div className={styles.stepLabel}>{step.label}</div>
                </div>
              </div>
            ))}

            {/* Image card */}
            <div className={styles.imageCard}>
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`${styles.imageSlide} ${activeStep === i ? styles.imageSlideActive : ''}`}
                >
                  <Image
                    src={step.image}
                    alt={step.label}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 900px) 100vw, 480px"
                  />
                </div>
              ))}
              {/* Num badge */}
              <div className={styles.imageBadge}>{current.num}</div>
            </div>
          </div>

          {/* RIGHT — content + stage timeline */}
          <div className={styles.rightCol}>

            {/* Step content */}
            <div className={styles.stepContent}>
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`${styles.contentBlock} ${activeStep === i ? styles.contentBlockActive : ''}`}
                >
                  <div className={styles.contentNum}>{step.num}</div>
                  <h3 className={styles.contentTitle}>{step.expandedTitle}</h3>
                  <div className={styles.contentDivider}>
                    <div className={styles.cdLine} />
                    <svg viewBox="0 0 24 24" width="8" height="8"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg>
                    <div className={styles.cdLine} />
                  </div>
                  <p className={styles.contentText}>{step.expandedText}</p>
                  <ul className={styles.contentList}>
                    {step.expandedList.map((item) => (
                      <li key={item}>
                        <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.4" fill="none" strokeLinecap="round" width="14" height="14">
                          <path d="M5 12l4 4L19 7"/>
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className={styles.contentNote}>{step.expandedNote}</p>
                </div>
              ))}
            </div>

            {/* Stage timeline */}
            <div className={styles.stageTimeline}>
              <div className={styles.stageLabel}>PROJECT STAGES</div>
              <div className={styles.stageTrack}>
                {stageLabels.map((stage, i) => (
                  <div
                    key={stage}
                    className={`${styles.stageItem} ${activeStep === i ? styles.stageActive : ''} ${activeStep > i ? styles.stageDone : ''}`}
                    onMouseEnter={() => setActiveStep(i)}
                  >
                    <div className={styles.stageDot}>
                      {activeStep > i ? (
                        <svg viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" width="10" height="10">
                          <path d="M5 12l4 4L19 7"/>
                        </svg>
                      ) : null}
                    </div>
                    {i < stageLabels.length - 1 && (
                      <div className={`${styles.stageLine} ${activeStep > i ? styles.stageLineDone : ''}`} />
                    )}
                    <div className={styles.stageName}>{stage}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
