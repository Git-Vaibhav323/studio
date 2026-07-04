import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Insights from '../components/sections/Insights';
import styles from '../components/PageDetail.module.css';

export const metadata = {
  title: 'Interior Design Insights and Spatial Planning Ideas',
  description: 'Read The Spatial Edit insights on spatial design, home planning, interior design decisions, and spaces that work beautifully.',
  keywords: ['spatial design insights', 'interior design blog Hyderabad', 'home planning tips', 'spatial vs interior design', 'home design mistakes'],
  alternates: { canonical: '/insights' },
};

export default function InsightsPage() {
  return (
    <div className={`${styles.page} ${styles.insightsPage}`}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.bgPattern1}></div>
        <div className={styles.bgPattern2}></div>
        <div className={styles.bgPattern3}></div>
        <div className={styles.floatingElements}>
          <div className={styles.floatingElement} style={{ '--delay': '0s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '2s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '4s' }}></div>
        </div>
      </div>

      <Navbar />
      <main className={styles.reuseWrap}>
        <Insights />
      </main>
      <Footer />
    </div>
  );
}