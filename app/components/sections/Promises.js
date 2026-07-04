import styles from './Promises.module.css';

const promises = [
  {
    title: 'Documented Process',
    desc: 'Every step is planned, documented, and agreed before execution begins. No assumptions. No ambiguity. Just clarity at every stage.',
    icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
  },
  {
    title: 'Weekly Updates',
    desc: 'You stay informed, every week, without having to chase. Transparent updates. Consistent progress. Complete visibility.',
    icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    title: 'One Point of Contact',
    desc: 'One dedicated studio lead throughout your project. One person who knows your space, your vision, and your priorities.',
    icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    title: 'Design Fidelity',
    desc: 'What is designed is what gets delivered. We don\'t compromise on design intent. Ever.',
    icon: <svg viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  },
];

export default function Promises() {
  return (
    <section id="promises" className={styles.section}>
      {/* Header label */}
      <div className={styles.headerRight}>
        <div className={styles.hrTop}>
          <div className={styles.hrLabel}>OUR PROMISES</div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        
        {/* Title section */}
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>
            Our <span>Promises.</span>
            <br />
            Your Peace of Mind.
          </h2>
        </div>

        {/* Divider */}
        <div className={styles.titleDivider}>
          <div className={styles.divLine} />
          <div className={styles.divDia}>
            <svg viewBox="0 0 24 24">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)" />
            </svg>
          </div>
          <div className={styles.divLine} />
        </div>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          CLEAR PROCESS. CONSTANT COMMUNICATION. COMPLETE OWNERSHIP.
        </p>

        {/* Cards Grid */}
        <div className={styles.cards}>
          {promises.map((p) => (
            <div className={styles.card} key={p.title}>
              
              {/* Icon */}
              <div className={styles.cardIcon}>
                {p.icon}
              </div>

              {/* Title */}
              <div className={styles.cardTitle}>
                {p.title}
              </div>

              {/* Card Divider */}
              <div className={styles.cardDivider}>
                <div className={styles.cdLine} />
                <div className={styles.cdDia}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)" />
                  </svg>
                </div>
                <div className={styles.cdLine} />
              </div>

              {/* Description */}
              <div className={styles.cardDesc}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}