import dynamic from 'next/dynamic';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';

const SpatialIntelligence = dynamic(() => import('./components/sections/SpatialIntelligence'), {
  loading: () => null,
});
const AboutSpatial = dynamic(() => import('./components/sections/AboutSpatial'), {
  loading: () => null,
});
const Comparison = dynamic(() => import('./components/sections/Comparison'), {
  loading: () => null,
});
const AestheticDirection = dynamic(() => import('./components/sections/AestheticDirection'), {
  loading: () => null,
});
const Promises = dynamic(() => import('./components/sections/Promises'), {
  loading: () => null,
});
const Process = dynamic(() => import('./components/sections/Process'), {
  loading: () => null,
});
const Insights = dynamic(() => import('./components/sections/Insights'), {
  loading: () => null,
});
const OurStory = dynamic(() => import('./components/sections/OurStory'), {
  loading: () => null,
});
const FAQs = dynamic(() => import('./components/sections/FAQs'), {
  loading: () => null,
});
const ContactForm = dynamic(() => import('./components/sections/ContactForm'), {
  loading: () => null,
});

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
