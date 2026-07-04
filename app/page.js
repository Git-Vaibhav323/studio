import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import SpatialIntelligence from './components/sections/SpatialIntelligence';
import AboutSpatial from './components/sections/AboutSpatial';
import Comparison from './components/sections/Comparison';
import AestheticDirection from './components/sections/AestheticDirection';
import Services from './components/sections/Services';
import Promises from './components/sections/Promises';
import OurWork from './components/sections/OurWork';
import Process from './components/sections/Process';
import Insights from './components/sections/Insights';
import OurStory from './components/sections/OurStory';
import FAQs from './components/sections/FAQs';
import ContactForm from './components/sections/ContactForm';

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
        <Services />
        <Promises />
        {/* <OurWork />  */}
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
