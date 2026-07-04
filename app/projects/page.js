import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import OurWork from '../components/sections/OurWork';
import styles from '../components/PageDetail.module.css';

export const metadata = {
  title: 'Interior Design Projects in Hyderabad',
  description: 'Selected living room, dining, kitchen, and bedroom spaces by The Spatial Edit, a spatial design studio in Hyderabad.',
  keywords: ['interior design projects Hyderabad', 'home interior portfolio', 'luxury home interiors Hyderabad', 'living room design Hyderabad', 'kitchen interiors Hyderabad'],
  alternates: { canonical: '/projects' },
};

export default function ProjectsPage() {
  return (
    <div className={`${styles.page} ${styles.projectsPage}`}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.bgPattern1}></div>
        <div className={styles.bgPattern2}></div>
        <div className={styles.bgPattern3}></div>
        <div className={styles.floatingElements}>
          <div className={styles.floatingElement} style={{ '--delay': '0s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '1.5s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '3s' }}></div>
        </div>
      </div>

      <Navbar />
      <main className={styles.reuseWrap}>
        <OurWork />
      </main>
      <Footer />
    </div>
  );
}
