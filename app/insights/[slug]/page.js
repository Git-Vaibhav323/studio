'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import styles from '../../components/PageDetail.module.css';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (params.slug) {
      fetchBlog(params.slug);
    }
  }, [params.slug]);

  const fetchBlog = async (slug) => {
    try {
      setLoading(true);
      
      // Fetch the main blog
      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (blogError || !blogData) {
        setNotFound(true);
        return;
      }

      setBlog(blogData);

      // Fetch related blogs (same category or recent)
      const { data: relatedData } = await supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published')
        .neq('id', blogData.id)
        .or(blogData.category ? `category.eq.${blogData.category}` : '')
        .order('published_at', { ascending: false })
        .limit(3);

      setRelatedBlogs(relatedData || []);

    } catch (error) {
      console.error('Error fetching blog:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          Loading article...
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !blog) {
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
            Article Not Found
          </h1>
          <p style={{ color: 'var(--mid)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/insights" style={{
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
            ← Back to Insights
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
        {/* Back Link */}
        <section style={{ padding: '2rem 5vw 0' }}>
          <div className={styles.sectionInner}>
            <Link href="/insights" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--mid)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease'
            }}>
              ← Back to Insights
            </Link>
          </div>
        </section>

        {/* Featured Image */}
        {blog.featured_image && (
          <section style={{ padding: '2rem 5vw' }}>
            <div className={styles.sectionInner}>
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '400px', 
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <Image
                  src={blog.featured_image}
                  alt={blog.title}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
                
                {blog.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'var(--gold)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    Featured Article
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Article Content */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {/* Article Header */}
              <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                {blog.category && (
                  <div style={{
                    display: 'inline-block',
                    background: 'var(--gold-faint)',
                    color: 'var(--gold)',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '2rem'
                  }}>
                    {blog.category}
                  </div>
                )}
                
                <h1 style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                  fontWeight: '400',
                  lineHeight: '1.3',
                  color: 'var(--dark)',
                  marginBottom: '1.5rem'
                }}>
                  {blog.title}
                </h1>
                
                {blog.excerpt && (
                  <p style={{
                    fontSize: '1.2rem',
                    color: 'var(--mid)',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    marginBottom: '2rem'
                  }}>
                    {blog.excerpt}
                  </p>
                )}

                {/* Meta Information */}
                <div style={{ 
                  display: 'flex', 
                  gap: '2rem', 
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  paddingTop: '2rem',
                  borderTop: '1px solid var(--border)'
                }}>
                  {blog.author && (
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: 'var(--mid)',
                      fontSize: '14px'
                    }}>
                      <strong>By</strong> {blog.author}
                    </span>
                  )}
                  {blog.published_at && (
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: 'var(--mid)',
                      fontSize: '14px'
                    }}>
                      {formatDate(blog.published_at)}
                    </span>
                  )}
                  {blog.read_time && (
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: 'var(--mid)',
                      fontSize: '14px'
                    }}>
                      {blog.read_time} min read
                    </span>
                  )}
                </div>
              </div>

              {/* Article Body */}
              <div 
                style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: 'var(--dark)',
                  marginBottom: '3rem'
                }}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <section className={styles.sectionAlt}>
            <div className={styles.sectionInner}>
              <h3 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Related Insights
              </h3>
              <div className={styles.serviceGrid}>
                {relatedBlogs.map((relatedBlog) => (
                  <Link key={relatedBlog.id} href={`/insights/${relatedBlog.slug}`} className={styles.serviceCard}>
                    <div className={styles.cardImage}>
                      {relatedBlog.featured_image ? (
                        <Image
                          src={relatedBlog.featured_image}
                          alt={relatedBlog.title}
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
                        {relatedBlog.title}
                      </h2>
                      {relatedBlog.excerpt && (
                        <p>{relatedBlog.excerpt.substring(0, 100)}...</p>
                      )}
                      <div style={{ 
                        marginTop: '1rem', 
                        fontSize: '11px',
                        color: 'var(--mid)'
                      }}>
                        {formatDate(relatedBlog.published_at)}
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