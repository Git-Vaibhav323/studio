import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProcessTimeline from '../components/ProcessTimeline';
import { processSteps } from '../data/siteContent';
import styles from '../components/PageDetail.module.css';

export const metadata = {
  title: 'Interior Design Process in Hyderabad | The Spatial Edit',
  description: 'Explore The Spatial Edit process: discovery, spatial planning, design development, execution, handover, and aftercare for homes in Hyderabad.',
  keywords: ['interior design process Hyderabad', 'home renovation process', 'spatial planning process', 'turnkey interiors Hyderabad', 'luxury interior execution'],
  alternates: { canonical: '/process' },
};

export default function ProcessPage() {
  return (
    <div className={`${styles.page} ${styles.processPage}`}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.bgPattern1}></div>
        <div className={styles.bgPattern2}></div>
        <div className={styles.bgPattern3}></div>
        <div className={styles.floatingElements}>
          <div className={styles.floatingElement} style={{ '--delay': '0.5s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '2s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '3.5s' }}></div>
        </div>
      </div>

      <Navbar />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>Our Process</div>
            <h1 className={styles.title}>End to end. <span>Thoughtful at every step.</span></h1>
            <p className={styles.intro}>
              We move from questions to plans, from plans to design, and from design to a finished home with one clear point of ownership throughout.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <ProcessTimeline steps={processSteps} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
