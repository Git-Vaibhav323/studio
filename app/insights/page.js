'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import styles from '../components/PageDetail.module.css';

export default function InsightsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
        return;
      }

      setBlogs(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(blogs.map(blog => blog.category).filter(Boolean))];
  const filteredBlogs = selectedCategory === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.category === selectedCategory);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, limit = 120) => {
    if (!text) return '';
    const plainText = text.replace(/<[^>]*>/g, '');
    return plainText.length > limit ? plainText.substring(0, limit) + '...' : plainText;
  };

  return (
    <div className={`${styles.page} ${styles.insightsPage}`}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.bgPattern1}></div>
        <div className={styles.bgPattern2}></div>
        <div className={styles.bgPattern3}></div>
        <div className={styles.floatingElements}>
          <div className={styles.floatingElement} style={{ '--delay': '0s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '2s' }}></div>
          <div className={styles.floatingElement} style={{ '--delay': '4s' }}></div>
        </div>
      </div>

      <Navbar />
      
      <main className={styles.reuseWrap}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>Design Insights</div>
            <h1 className={styles.title}>
              Thoughts on <span>Spatial</span> Design
            </h1>
            <div className={styles.intro}>
              Explore our thoughts on spatial design, interior trends, and creating 
              spaces that truly work for how you live.
            </div>
          </div>
        </section>

        {/* Filters Section */}
        {categories.length > 1 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        padding: '0.8rem 1.8rem',
                        background: selectedCategory === category 
                          ? 'linear-gradient(135deg, var(--gold), rgba(180, 144, 79, 0.9))'
                          : 'rgba(248, 244, 237, 0.95)',
                        color: selectedCategory === category ? 'white' : 'var(--dark)',
                        border: selectedCategory === category 
                          ? '1px solid var(--gold)'
                          : '1px solid rgba(180, 144, 79, 0.25)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--sans)',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedCategory === category 
                          ? '0 4px 12px rgba(180, 144, 79, 0.3)'
                          : '0 2px 8px rgba(28, 23, 16, 0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCategory !== category) {
                          e.target.style.background = 'rgba(180, 144, 79, 0.1)';
                          e.target.style.borderColor = 'rgba(180, 144, 79, 0.5)';
                          e.target.style.boxShadow = '0 4px 12px rgba(28, 23, 16, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCategory !== category) {
                          e.target.style.background = 'rgba(248, 244, 237, 0.95)';
                          e.target.style.borderColor = 'rgba(180, 144, 79, 0.25)';
                          e.target.style.boxShadow = '0 2px 8px rgba(28, 23, 16, 0.05)';
                        }
                      }}
                    >
                      {category === 'all' ? 'All Insights' : category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Insights Grid */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            {loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '300px',
                color: 'var(--mid)'
              }}>
                Loading insights...
              </div>
            ) : blogs.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem',
                background: 'rgba(248, 244, 237, 0.86)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ 
                  fontFamily: 'var(--serif)', 
                  fontSize: '1.5rem', 
                  color: 'var(--dark)', 
                  marginBottom: '0.5rem' 
                }}>
                  No insights yet
                </h3>
                <p style={{ color: 'var(--mid)', maxWidth: '400px', margin: '0 auto' }}>
                  Check back soon for our latest thoughts on spatial design and interior planning.
                </p>
              </div>
            ) : (
              <div className={styles.serviceGrid}>
                {filteredBlogs.map((blog, index) => (
                  <Link key={blog.id} href={`/insights/${blog.slug}`} className={styles.serviceCard}>
                    <div className={styles.cardImage}>
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
                          No Image
                        </div>
                      )}
                      {blog.featured && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: 'var(--gold)',
                          color: 'white',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '10px',
                          fontWeight: '600',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase'
                        }}>
                          Featured
                        </div>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      {blog.category && (
                        <div style={{
                          display: 'inline-block',
                          background: 'var(--gold-faint)',
                          color: 'var(--gold)',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '15px',
                          fontSize: '10px',
                          fontWeight: '600',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          marginBottom: '1rem'
                        }}>
                          {blog.category}
                        </div>
                      )}
                      <h2>{blog.title}</h2>
                      {blog.excerpt && (
                        <p>{truncateText(blog.excerpt)}</p>
                      )}
                      <div style={{ 
                        marginTop: '1rem', 
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        fontSize: '11px',
                        color: 'var(--mid)',
                        letterSpacing: '0.05em'
                      }}>
                        {blog.author && <span>By {blog.author}</span>}
                        {blog.published_at && <span>{formatDate(blog.published_at)}</span>}
                        {blog.read_time && <span>{blog.read_time} min read</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}