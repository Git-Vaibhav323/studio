import Image from 'next/image';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { serviceItems } from '../data/siteContent';
import styles from '../components/PageDetail.module.css';

export const metadata = {
  title: 'Interior Design Services in Hyderabad',
  description: 'Explore The Spatial Edit services: site assessment, spatial planning, design concepts, civil work, carpentry, furniture, styling, installation, and aftercare.',
  keywords: ['interior design services Hyderabad', 'turnkey interiors Hyderabad', 'spatial planning services', 'civil work interiors', 'custom carpentry Hyderabad', 'home styling Hyderabad'],
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>Services</div>
            <h1 className={styles.title}>One service. <span>Total ownership.</span></h1>
            <p className={styles.intro}>
              From site assessment to final handover, each service layer is connected by the same spatial logic: circulation, proportion, light, function, and finish.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.serviceGrid}>
              {serviceItems.map((service) => (
                <article className={styles.serviceCard} key={service.num}>
                  <div className={styles.cardImage}>
                    <Image src={service.preview} alt={service.title} fill sizes="(max-width: 900px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.number}>{service.num}</span>
                    <h2>{service.title}</h2>
                    <p>{service.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
