import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ContactForm from '../components/sections/ContactForm';
import styles from '../components/PageDetail.module.css';

export const metadata = {
  title: 'Contact The Spatial Edit',
  description: 'Book a discovery call with The Spatial Edit for spatial design, turnkey interiors, home renovation, and interior execution in Hyderabad.',
  keywords: ['contact interior designer Hyderabad', 'book interior design consultation', 'The Spatial Edit contact', 'home interiors Hyderabad consultation'],
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.reuseWrap}>
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
