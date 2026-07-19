'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import styles from '../../components/PageDetail.module.css';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (params.slug) {
      fetchProject(params.slug);
    }
  }, [params.slug]);

  const fetchProject = async (slug) => {
    try {
      setLoading(true);
      
      // Fetch the main project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (projectError || !projectData) {
        setNotFound(true);
        return;
      }

      setProject(projectData);

      // Fetch related projects (same category or recent)
      const { data: relatedData } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .neq('id', projectData.id)
        .or(projectData.category ? `category.eq.${projectData.category}` : '')
        .order('created_at', { ascending: false })
        .limit(3);

      setRelatedProjects(relatedData || []);

    } catch (error) {
      console.error('Error fetching project:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Parse gallery images
  const galleryImages = project?.gallery_images ? 
    (Array.isArray(project.gallery_images) ? project.gallery_images : []) 
    : [];

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          color: 'var(--mid)'
        }}>
          Loading project...
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--dark)', marginBottom: '1rem' }}>
            Project Not Found
          </h1>
          <p style={{ color: 'var(--mid)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            The project you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/projects" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--gold)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}>
            ← Back to Projects
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      
      <main className={styles.reuseWrap}>
        {/* Featured Image with Title Overlay */}
        {project.featured_image && (
          <section style={{ position: 'relative', height: '70vh', minHeight: '500px' }}>
            <Image
              src={project.featured_image}
              alt={project.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            
            {/* Dark overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%)',
              zIndex: 1
            }} />
            
            {/* Back link */}
            <div style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem',
              zIndex: 2
            }}>
              <Link href="/projects" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'rgba(0,0,0,0.5)',
                padding: '0.75rem 1rem',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}>
                ← Back to Projects
              </Link>
            </div>

            {/* Title overlay */}
            <div style={{
              position: 'absolute',
              bottom: '3rem',
              left: '3rem',
              right: '3rem',
              zIndex: 2,
              color: 'white'
            }}>
              {project.category && (
                <div style={{
                  display: 'inline-block',
                  background: 'var(--gold)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem'
                }}>
                  {project.category}
                </div>
              )}
              
              <h1 style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: '400',
                lineHeight: '1.1',
                margin: 0,
                textShadow: '0 2px 20px rgba(0,0,0,0.5)'
              }}>
                {project.title}
              </h1>
              
              {project.featured && (
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '15px',
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginTop: '1rem',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  Featured Project
                </div>
              )}
            </div>
          </section>
        )}

        {/* Content Section */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.split}>
              {/* Description */}
              <div>
                {project.description && (
                  <div style={{
                    background: 'rgba(248, 244, 237, 0.86)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    marginBottom: '2rem'
                  }}>
                    <h3 className={styles.sectionTitle} style={{ 
                      fontSize: 'clamp(20px, 2.5vw, 28px)', 
                      marginBottom: '1rem',
                      borderBottom: '2px solid var(--gold)',
                      paddingBottom: '0.5rem'
                    }}>
                      Project Overview
                    </h3>
                    <div className={styles.bodyText} style={{ fontSize: '15px', lineHeight: '1.7' }}>
                      {project.content ? (
                        <div dangerouslySetInnerHTML={{ __html: project.content }} />
                      ) : (
                        project.description
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div style={{
                background: 'rgba(248, 244, 237, 0.76)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                height: 'fit-content'
              }}>
                <h3 className={styles.sectionTitle} style={{ 
                  fontSize: 'clamp(20px, 2.5vw, 28px)', 
                  marginBottom: '1.5rem',
                  borderBottom: '2px solid var(--gold)',
                  paddingBottom: '0.5rem'
                }}>
                  Project Details
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {project.client && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <span style={{ fontWeight: '500', color: 'var(--mid)', fontSize: '13px', minWidth: '80px' }}>
                        Client
                      </span>
                      <span style={{ fontWeight: '500', color: 'var(--dark)', textAlign: 'right', flex: 1 }}>
                        {project.client}
                      </span>
                    </div>
                  )}
                  {project.location && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <span style={{ fontWeight: '500', color: 'var(--mid)', fontSize: '13px', minWidth: '80px' }}>
                        Location
                      </span>
                      <span style={{ fontWeight: '500', color: 'var(--dark)', textAlign: 'right', flex: 1 }}>
                        {project.location}
                      </span>
                    </div>
                  )}
                  {project.area && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <span style={{ fontWeight: '500', color: 'var(--mid)', fontSize: '13px', minWidth: '80px' }}>
                        Area
                      </span>
                      <span style={{ fontWeight: '500', color: 'var(--dark)', textAlign: 'right', flex: 1 }}>
                        {project.area}
                      </span>
                    </div>
                  )}
                  {project.year && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <span style={{ fontWeight: '500', color: 'var(--mid)', fontSize: '13px', minWidth: '80px' }}>
                        Year
                      </span>
                      <span style={{ fontWeight: '500', color: 'var(--dark)', textAlign: 'right', flex: 1 }}>
                        {project.year}
                      </span>
                    </div>
                  )}
                  {project.duration && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <span style={{ fontWeight: '500', color: 'var(--mid)', fontSize: '13px', minWidth: '80px' }}>
                        Duration
                      </span>
                      <span style={{ fontWeight: '500', color: 'var(--dark)', textAlign: 'right', flex: 1 }}>
                        {project.duration}
                      </span>
                    </div>
                  )}
                  {project.budget && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start'
                    }}>
                      <span style={{ fontWeight: '500', color: 'var(--mid)', fontSize: '13px', minWidth: '80px' }}>
                        Budget
                      </span>
                      <span style={{ fontWeight: '500', color: 'var(--dark)', textAlign: 'right', flex: 1 }}>
                        {project.budget}
                      </span>
                    </div>
                  )}
                </div>

                {project.services && project.services.length > 0 && (
                  <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{
                      fontFamily: 'var(--serif)',
                      fontSize: '18px',
                      color: 'var(--dark)',
                      marginBottom: '1rem',
                      borderBottom: '2px solid var(--gold)',
                      paddingBottom: '0.5rem'
                    }}>
                      Services Provided
                    </h4>
                    <ul className={styles.list}>
                      {project.services.map((service, index) => (
                        <li key={index}>{service}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Gallery Images */}
        {galleryImages.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <h3 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Project Gallery
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '2rem' 
              }}>
                {galleryImages.map((image, index) => (
                  <div key={index} style={{
                    position: 'relative',
                    aspectRatio: '4/3',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--cream-light)',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <Image
                      src={image}
                      alt={`${project.title} - Gallery Image ${index + 1}`}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className={styles.sectionAlt}>
            <div className={styles.sectionInner}>
              <h3 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Related Projects
              </h3>
              <div className={styles.serviceGrid}>
                {relatedProjects.map((relatedProject) => (
                  <Link key={relatedProject.id} href={`/projects/${relatedProject.slug}`} className={styles.serviceCard}>
                    <div className={styles.cardImage}>
                      {relatedProject.featured_image ? (
                        <Image
                          src={relatedProject.featured_image}
                          alt={relatedProject.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: 'var(--cream-light)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--mid)'
                        }}>
                          No Image
                        </div>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <h2 style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
                        {relatedProject.title}
                      </h2>
                      {relatedProject.description && (
                        <p>{relatedProject.description.substring(0, 100)}...</p>
                      )}
                      <div style={{ 
                        marginTop: '1rem', 
                        fontSize: '11px',
                        color: 'var(--mid)',
                        display: 'flex',
                        gap: '1rem'
                      }}>
                        {relatedProject.location && <span>Location: {relatedProject.location}</span>}
                        {relatedProject.year && <span>Year: {relatedProject.year}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}