import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import SpatialIntelligence from './components/sections/SpatialIntelligence';
import AboutSpatial from './components/sections/AboutSpatial';
import Comparison from './components/sections/Comparison';
import AestheticDirection from './components/sections/AestheticDirection';
import Promises from './components/sections/Promises';
import Process from './components/sections/Process';
import OurStory from './components/sections/OurStory';
import FAQs from './components/sections/FAQs';
import ContactForm from './components/sections/ContactForm';
import styles from './home.module.css';

/** Eager homepage — no dynamic() delays after splash. */
export default function Home() {
  return (
    <div className={styles.homePage}>
      <video className={styles.homeBackground} autoPlay muted loop playsInline poster="/images/bg/bg-sec-2.webp" aria-hidden="true">
        <source src="/images/bg-sec2.mp4" type="video/mp4" />
      </video>
      <Navbar />
      <main className={styles.homeMain}>
        <HeroSection />
        <SpatialIntelligence />
        <AboutSpatial />
        <Comparison />
        <AestheticDirection />
        <Promises />
        <Process />
        <OurStory />
        <FAQs />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
