import Image from 'next/image';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import styles from '../components/PageDetail.module.css';

export const metadata = {
  title: 'About The Spatial Edit | Spatial Design Studio Hyderabad',
  description: 'The story of The Spatial Edit, founded by Preksha Bhargav and Krishna Bhargav to make home design more organised, functional, and beautifully executed.',
  keywords: ['The Spatial Edit founders', 'Preksha Bhargav', 'Krishna Bhargav', 'spatial design studio Hyderabad', 'interior design studio Hyderabad', 'turnkey home interiors Hyderabad'],
  alternates: { canonical: '/about' },
};

const trust = [
  ['01', 'Studio point of contact'],
  ['09', 'Execution layers managed'],
  ['30', 'Day aftercare support'],
  ['100%', 'Space-first thinking'],
];

const team = [
  {
    name: 'Preksha Bhargav',
    role: 'Co-founder',
    image: '/images/founders_photo.png',
  },
  {
    name: 'Krishna Bhargav',
    role: 'Co-founder',
    image: '/images/founders_photo.png',
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>About The Spatial Edit</div>
            <h1 className={styles.title}>It began in a home that <span>was not working.</span></h1>
            <p className={styles.intro}>
              The Spatial Edit was founded by Preksha Bhargav and Krishna Bhargav, partners in life and now in business, who started this studio for a very personal reason.
            </p>
            <div className={styles.trustBar}>
              {trust.map(([number, label]) => (
                <div className={styles.trustItem} key={label}>
                  <span className={styles.trustNumber}>{number}</span>
                  <span className={styles.trustLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.storyFeature}>
              <div className={styles.storyTextPanel}>
                <div className={styles.eyebrow}>Our Story</div>
                <h2 className={styles.sectionTitle}>A studio built from a lived experience.</h2>
                <p className={styles.bodyText}>
                  It did not begin in a design studio. It began in a home that was not working, a home that did not feel like theirs.
                </p>
                <p className={styles.bodyText}>
                  When they were expecting their first baby, in the third trimester, the couple moved into a new apartment. They had hired an interior designer.
                </p>
                <p className={styles.bodyText}>
                  What followed was one of the most chaotic experiences of their lives: delays, decisions that made no sense, and a process so disorganised they ended up directing it themselves, from designing their own house to doing site visits.
                </p>
                <p className={styles.bodyText}>
                  They were not unlucky.They were experiencing what almost every homeowner in India experiences.
                </p>
              </div>

              <div className={styles.founderStoryCard}>
                <div className={styles.founderImage}>
                  <Image src="/images/founders_photo.png" alt="Preksha Bhargav and Krishna Bhargav, founders of The Spatial Edit" fill sizes="(max-width: 900px) 100vw, 520px" style={{ objectFit: 'cover' }} />
                </div>
                <div className={styles.founderNames}>
                  {team.map((member) => (
                    <div className={styles.nameBlock} key={member.name}>
                      <h3>{member.name}</h3>
                      <p>{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.sectionInner}>
            <div className={styles.storyResolve}>
              <div>
                <div className={styles.eyebrow}>The Gap</div>
                <h2 className={styles.sectionTitle}>That gap stayed with them.</h2>
              </div>
              <div>
                <p className={styles.bodyText}>
                  Two babies later and with lot of thinking, research, and groundwork behind them, they built The Spatial Edit.
                </p>
                <blockquote className={styles.quotePanel}>
                  <span>&ldquo;</span>
                  We do not just design your space. We ensure it is executed exactly as designed.
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.storyPillars}>
              <article>
                <span>01</span>
                <h2>Personal understanding</h2>
                <p>We know how stressful an unorganised home project can feel because the studio was born from that exact experience.</p>
              </article>
              <article>
                <span>02</span>
                <h2>Spatial intelligence</h2>
                <p>Before finishes, we study circulation, proportion, light, storage, and the way daily life actually moves through the home.</p>
              </article>
              <article>
                <span>03</span>
                <h2>Execution ownership</h2>
                <p>Design and execution stay connected, so the space is not only imagined well, but delivered with clarity and control.</p>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
