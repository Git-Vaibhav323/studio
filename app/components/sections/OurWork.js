'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import styles from './OurWork.module.css';

export default function OurWork() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="work" className={styles.section}>
      {/* Main Content */}
      <div className={styles.mainContent}>

        {/* Center Header */}
        <div className={styles.centerHeader}>
          <h2 className={styles.title}>
            Our <span>Work.</span>
          </h2>
          <div className={styles.separator}>
            <div className={styles.sepLine} />
            <div className={styles.sepDia}>
              <svg viewBox="0 0 24 24">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="var(--gold)"/>
              </svg>
            </div>
            <div className={styles.sepLine} />
          </div>
          <div className={styles.subtitle}>
            SPACES DESIGNED TO WORK. FINISHED TO LAST.
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px',
            color: 'var(--mid)',
            fontFamily: 'var(--sans)',
            fontSize: '14px'
          }}>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: 'var(--mid)',
            fontFamily: 'var(--sans)',
            fontSize: '14px'
          }}>
            <p>No projects available at the moment.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {projects.slice(0, 8).map((project) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.slug}`} 
                className={styles.card}
                style={{ textDecoration: 'none' }}
              >
                <div className={styles.imageBox}>
                  {project.featured_image ? (
                    <Image
                      src={project.featured_image}
                      alt={project.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      No Image
                    </div>
                  )}
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.cardFooterText} style={{ 
                    fontFamily: 'var(--serif)', 
                    fontSize: '14px',
                    fontWeight: '400',
                    color: 'var(--dark)',
                    marginBottom: '4px'
                  }}>
                    {project.title}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'var(--gold)', 
                    fontWeight: '500',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--sans)'
                  }}>
                    View Details
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}