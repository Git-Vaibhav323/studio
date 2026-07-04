import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ContactForm from '../../components/sections/ContactForm';
import { createServerSupabaseClient } from '@/lib/supabase';
import styles from './ServiceDetail.module.css';

async function getService(slug) {
  const supabase = createServerSupabaseClient();
  
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !service) {
    return null;
  }

  return service;
}

export async function generateMetadata({ params }) {
  const service = await getService(params.slug);
  
  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: service.seo_title || `${service.title} | The Spatial Edit`,
    description: service.seo_description || service.short_description,
    keywords: service.seo_keywords || [],
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      title: service.seo_title || service.title,
      description: service.seo_description || service.short_description,
      images: service.featured_image ? [service.featured_image] : [],
      url: `/services/${service.slug}`,
      type: 'article',
    },
  };
}

export default async function ServiceDetailPage({ params }) {
  const service = await getService(params.slug);

  if (!service) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.breadcrumb}>
                <span>Services</span>
                <span>/</span>
                <span>{service.title}</span>
              </div>
              
              <h1 className={styles.heroTitle}>{service.title}</h1>
              
              {service.short_description && (
                <p className={styles.heroDescription}>
                  {service.short_description}
                </p>
              )}

              <div className={styles.serviceInfo}>
                {service.price_range && (
                  <div className={styles.infoItem}>
                    <strong>Investment:</strong> {service.price_range}
                  </div>
                )}
                {service.duration && (
                  <div className={styles.infoItem}>
                    <strong>Timeline:</strong> {service.duration}
                  </div>
                )}
              </div>
            </div>

            {service.featured_image && (
              <div className={styles.heroImage}>
                <Image
                  src={service.featured_image}
                  alt={service.title}
                  width={600}
                  height={400}
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            )}
          </div>
        </section>

        {/* Detailed Description */}
        {service.detailed_description && (
          <section className={styles.description}>
            <div className={styles.container}>
              <div className={styles.descriptionContent}>
                <h2>About This Service</h2>
                <div className={styles.descriptionText}>
                  {service.detailed_description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <section className={styles.features}>
            <div className={styles.container}>
              <h2>What's Included</h2>
              <div className={styles.featuresGrid}>
                {service.features.map((feature, index) => (
                  <div key={index} className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div className={styles.featureContent}>
                      <h3>{feature.title || feature}</h3>
                      {feature.description && <p>{feature.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Process Steps */}
        {service.process_steps && service.process_steps.length > 0 && (
          <section className={styles.process}>
            <div className={styles.container}>
              <h2>Our Process</h2>
              <div className={styles.processSteps}>
                {service.process_steps.map((step, index) => (
                  <div key={index} className={styles.processStep}>
                    <div className={styles.stepNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className={styles.stepContent}>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                      {step.duration && (
                        <span className={styles.stepDuration}>{step.duration}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {service.gallery && service.gallery.length > 0 && (
          <section className={styles.gallery}>
            <div className={styles.container}>
              <h2>Gallery</h2>
              <div className={styles.galleryGrid}>
                {service.gallery.map((image, index) => (
                  <div key={index} className={styles.galleryItem}>
                    <Image
                      src={image.url || image}
                      alt={`${service.title} gallery image ${index + 1}`}
                      width={400}
                      height={300}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <h2>Ready to Start Your Project?</h2>
              <p>Let's discuss how we can transform your space with our {service.title.toLowerCase()} expertise.</p>
              <a href="#contact" className={styles.ctaButton}>
                Get Started Today
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Form */}
      <ContactForm />
      
      <Footer />
    </div>
  );
}