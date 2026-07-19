'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';
import styles from './Insights.module.css';

export default function Insights() {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching featured blogs:', error);
        return;
      }

      setFeaturedBlogs(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text, limit = 100) => {
    if (!text) return '';
    const plainText = text.replace(/<[^>]*>/g, '');
    return plainText.length > limit ? plainText.substring(0, limit) + '...' : plainText;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section id="insights" className={styles.section}>
      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Ideas That <span>Shape Better Spaces.</span></h2>
        </div>
        <p className={styles.subtitle}>PERSPECTIVES ON DESIGN, PLANNING, AND SPACES THAT WORK.</p>
        
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px',
            color: 'var(--mid)'
          }}>
            Loading featured insights...
          </div>
        ) : featuredBlogs.length > 0 ? (
          <>
            <div className={styles.grid}>
              {featuredBlogs.map((blog, index) => (
                <Link href={`/insights/${blog.slug}`} key={blog.id} className={styles.card}>
                  <div className={styles.imgWrap}>
                    {blog.featured_image ? (
                      <Image 
                        src={blog.featured_image} 
                        alt={blog.title} 
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
                        {blog.title}
                      </div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.label}>
                      {blog.category ? blog.category.toUpperCase() : `INSIGHT ${index + 1}`}
                    </div>
                    <h3 className={styles.cardTitle}>{blog.title}</h3>
                    <p className={styles.cardDesc}>
                      {blog.excerpt ? truncateText(blog.excerpt) : truncateText(blog.content)}
                    </p>
                    <div className={styles.readMore}>READ MORE &rarr;</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Insights Link */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '1.5rem' 
            }}>
              <Link href="/insights" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(180, 144, 79, 0.15)',
                color: 'var(--gold)',
                textDecoration: 'none',
                border: '1px solid rgba(180, 144, 79, 0.3)',
                fontWeight: '500',
                fontSize: '13px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}>
                View All Insights
              </Link>
            </div>
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: 'var(--mid)'
          }}>
            <p>No featured insights available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
