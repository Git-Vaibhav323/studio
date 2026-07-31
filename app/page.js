import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import SpatialIntelligence from './components/sections/SpatialIntelligence';
import AboutSpatial from './components/sections/AboutSpatial';
import dynamic from 'next/dynamic';

// Below-fold only — keep first viewport sections eager so deploy boot isn't empty/slow
const Comparison = dynamic(() => import('./components/sections/Comparison'));
const AestheticDirection = dynamic(() => import('./components/sections/AestheticDirection'));
const Promises = dynamic(() => import('./components/sections/Promises'));
const Process = dynamic(() => import('./components/sections/Process'));
const Insights = dynamic(() => import('./components/sections/Insights'));
const OurStory = dynamic(() => import('./components/sections/OurStory'));
const FAQs = dynamic(() => import('./components/sections/FAQs'));
const ContactForm = dynamic(() => import('./components/sections/ContactForm'));

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SpatialIntelligence />
        <AboutSpatial />
        <Comparison />
        <AestheticDirection />
        <Promises />
        <Process />
        <Insights />
        <OurStory />
        <FAQs />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
