import Image from 'next/image';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Services from '../components/sections/Services';
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
        <Services />
      </main>
      <Footer />
    </div>
  );
}
