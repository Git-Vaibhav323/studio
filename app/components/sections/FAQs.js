'use client';
import { useState } from 'react';
import styles from './FAQs.module.css';

const faqs = [
  { q: 'What exactly is spatial design?', a: 'Spatial design is the discipline of planning how a space functions — how you move through it, how it\'s proportioned, and how natural light behaves within it. It comes before any aesthetic decision. Good spatial design makes a home feel effortless to live in, even when you can\'t quite explain why.' },
  { q: 'My villa is already built. Why spatial planning?', a: 'Even in a completed structure, spatial planning determines the optimal layout for your furniture, how to zone your spaces for different activities, and how to maximise both functionality and light. It prevents expensive mistakes before execution begins.' },
  { q: 'How is this different from interior decorators?', a: 'Interior decorators focus on the aesthetics — colours, furniture, accessories. We begin with the spatial plan: circulation, proportion, and light. The design follows the function. This is why our spaces feel as good as they look.' },
  { q: 'How long does planning take?', a: 'The spatial plan typically takes 2–3 weeks, depending on the scale of your project. Full project timelines from planning to handover typically run 4–8 months for a complete home.' },
  { q: 'Do you work across all of Hyderabad?', a: 'Yes, we work across Hyderabad — including Jubilee Hills, Banjara Hills, Gachibowli, Hitec City, and surrounding areas. For the right project, we are open to other cities as well.' },
];

export default function FAQs() {
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faqs" className={styles.section}>
      {/* Top Bar and sidebar removed per design request */}

      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>FAQ<span style={{ fontFamily: 'var(--serif-italic)', fontWeight: '400', color: 'var(--gold)', marginLeft: '2px' }}>s</span></h2>
        </div>
        
        <div className={styles.separatorShort}>
          <div className={styles.sepLine} />
          <div className={styles.sepDia}>
            <svg viewBox="0 0 24 24"><path d="M12 0 C 12 10, 14 12, 24 12 C 14 12, 12 14, 12 24 C 12 14, 10 12, 0 12 C 10 12, 12 10, 12 0 Z" fill="var(--gold)"/></svg>
          </div>
          <div className={styles.sepLine} />
        </div>

        <p className={styles.subtitle}>CLEAR ANSWERS. COMPLETE CLARITY.</p>
        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <div className={`${styles.faqItem} ${openIdx === i ? styles.faqOpen : ''}`} key={i} onClick={() => toggle(i)}>
              <div className={styles.faqTop}>
                <div className={styles.faqLeft}>
                  <div className={styles.faqStar}><svg viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/></svg></div>
                  <div className={styles.faqQ}>{faq.q}</div>
                </div>
                <div className={`${styles.faqToggle} ${openIdx === i ? styles.isOpen : ''}`}>
                  <span /><span />
                </div>
              </div>
              <div className={`${styles.faqAnswer} ${openIdx === i ? styles.answerVisible : ''}`}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
     
    </section>
  );
}
