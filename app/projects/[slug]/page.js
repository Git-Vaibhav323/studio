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

  // Parse gallery images - handle both array and string formats
  const galleryImages = project?.gallery_images ? 
    (Array.isArray(project.gallery_images) 
      ? project.gallery_images 
      : typeof project.gallery_images === 'string'
        ? JSON.parse(project.gallery_images).filter(img => img && img.trim())
        : []
    ) : [];

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
                    background: 'rgba(248, 244, 237, 0.95)',
                    padding: '2.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(180, 144, 79, 0.2)',
                    marginBottom: '2rem',
                    boxShadow: '0 8px 32px rgba(28, 23, 16, 0.08)'
                  }}>
                    <h3 style={{ 
                      fontFamily: 'var(--serif)',
                      fontSize: 'clamp(22px, 3vw, 32px)', 
                      fontWeight: '400',
                      color: 'var(--dark)',
                      marginBottom: '1.5rem',
                      borderBottom: '3px solid var(--gold)',
                      paddingBottom: '0.75rem',
                      letterSpacing: '-0.02em'
                    }}>
                      Project Overview
                    </h3>
                    <div style={{ 
                      fontSize: '16px', 
                      lineHeight: '1.8',
                      color: 'var(--dark)',
                      fontFamily: 'var(--sans)'
                    }}>
                      {project.content ? (
                        <div dangerouslySetInnerHTML={{ __html: project.content }} />
                      ) : (
                        <p style={{ margin: 0 }}>{project.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div style={{
                background: 'rgba(248, 244, 237, 0.95)',
                padding: '2.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(180, 144, 79, 0.2)',
                height: 'fit-content',
                boxShadow: '0 8px 32px rgba(28, 23, 16, 0.08)'
              }}>
                <h3 style={{ 
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(22px, 3vw, 32px)', 
                  fontWeight: '400',
                  color: 'var(--dark)',
                  marginBottom: '2rem',
                  borderBottom: '3px solid var(--gold)',
                  paddingBottom: '0.75rem',
                  letterSpacing: '-0.02em'
                }}>
                  Project Details
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {project.client && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1.2rem',
                      borderBottom: '1px solid rgba(180, 144, 79, 0.15)'
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: 'var(--gold)', 
                        fontSize: '13px', 
                        minWidth: '90px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--sans)'
                      }}>
                        Client
                      </span>
                      <span style={{ 
                        fontWeight: '500', 
                        color: 'var(--dark)', 
                        textAlign: 'right', 
                        flex: 1,
                        fontSize: '15px',
                        fontFamily: 'var(--serif)'
                      }}>
                        {project.client}
                      </span>
                    </div>
                  )}
                  {project.location && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1.2rem',
                      borderBottom: '1px solid rgba(180, 144, 79, 0.15)'
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: 'var(--gold)', 
                        fontSize: '13px', 
                        minWidth: '90px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--sans)'
                      }}>
                        Location
                      </span>
                      <span style={{ 
                        fontWeight: '500', 
                        color: 'var(--dark)', 
                        textAlign: 'right', 
                        flex: 1,
                        fontSize: '15px',
                        fontFamily: 'var(--serif)'
                      }}>
                        {project.location}
                      </span>
                    </div>
                  )}
                  {project.area && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1.2rem',
                      borderBottom: '1px solid rgba(180, 144, 79, 0.15)'
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: 'var(--gold)', 
                        fontSize: '13px', 
                        minWidth: '90px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--sans)'
                      }}>
                        Area
                      </span>
                      <span style={{ 
                        fontWeight: '500', 
                        color: 'var(--dark)', 
                        textAlign: 'right', 
                        flex: 1,
                        fontSize: '15px',
                        fontFamily: 'var(--serif)'
                      }}>
                        {project.area}
                      </span>
                    </div>
                  )}
                  {project.year && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1.2rem',
                      borderBottom: '1px solid rgba(180, 144, 79, 0.15)'
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: 'var(--gold)', 
                        fontSize: '13px', 
                        minWidth: '90px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--sans)'
                      }}>
                        Year
                      </span>
                      <span style={{ 
                        fontWeight: '500', 
                        color: 'var(--dark)', 
                        textAlign: 'right', 
                        flex: 1,
                        fontSize: '15px',
                        fontFamily: 'var(--serif)'
                      }}>
                        {project.year}
                      </span>
                    </div>
                  )}
                  {project.duration && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      paddingBottom: '1.2rem',
                      borderBottom: '1px solid rgba(180, 144, 79, 0.15)'
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: 'var(--gold)', 
                        fontSize: '13px', 
                        minWidth: '90px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--sans)'
                      }}>
                        Duration
                      </span>
                      <span style={{ 
                        fontWeight: '500', 
                        color: 'var(--dark)', 
                        textAlign: 'right', 
                        flex: 1,
                        fontSize: '15px',
                        fontFamily: 'var(--serif)'
                      }}>
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
                      <span style={{ 
                        fontWeight: '600', 
                        color: 'var(--gold)', 
                        fontSize: '13px', 
                        minWidth: '90px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--sans)'
                      }}>
                        Budget
                      </span>
                      <span style={{ 
                        fontWeight: '500', 
                        color: 'var(--dark)', 
                        textAlign: 'right', 
                        flex: 1,
                        fontSize: '15px',
                        fontFamily: 'var(--serif)'
                      }}>
                        {project.budget}
                      </span>
                    </div>
                  )}
                </div>

                {project.services && project.services.length > 0 && (
                  <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(180, 144, 79, 0.2)' }}>
                    <h4 style={{
                      fontFamily: 'var(--serif)',
                      fontSize: '20px',
                      fontWeight: '400',
                      color: 'var(--dark)',
                      marginBottom: '1.5rem',
                      borderBottom: '2px solid var(--gold)',
                      paddingBottom: '0.5rem',
                      letterSpacing: '-0.01em'
                    }}>
                      Services Provided
                    </h4>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      {project.services.map((service, index) => (
                        <li key={index} style={{
                          fontSize: '14px',
                          color: 'var(--dark)',
                          fontFamily: 'var(--sans)',
                          padding: '0.5rem 0',
                          borderLeft: '3px solid var(--gold)',
                          paddingLeft: '1rem',
                          background: 'rgba(180, 144, 79, 0.05)'
                        }}>
                          {service}
                        </li>
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
              <h3 style={{ 
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: '400',
                color: 'var(--dark)',
                textAlign: 'center', 
                marginBottom: '3rem',
                letterSpacing: '-0.02em'
              }}>
                Project Gallery
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '2.5rem' 
              }}>
                {galleryImages.map((image, index) => (
                  <div key={index} style={{
                    position: 'relative',
                    aspectRatio: '4/3',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'var(--cream-light)',
                    cursor: 'pointer',
                    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                    boxShadow: '0 8px 32px rgba(28, 23, 16, 0.08)',
                    border: '1px solid rgba(180, 144, 79, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(28, 23, 16, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(28, 23, 16, 0.08)';
                  }}
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