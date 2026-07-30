'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import { Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Blogs.module.css';

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
        toast.error('Failed to fetch blogs');
        return;
      }

      setBlogs(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlogs(blogs.filter(blog => blog.id !== id));
      toast.success('Blog deleted successfully');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Error deleting blog');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const { error } = await supabase
        .from('blogs')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      setBlogs(blogs.map(blog => 
        blog.id === id 
          ? { ...blog, status: newStatus }
          : blog
      ));
      
      toast.success(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating blog status');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    if (filter === 'all') return true;
    if (filter === 'published') return blog.status === 'published';
    if (filter === 'draft') return blog.status === 'draft';
    if (filter === 'featured') return blog.featured;
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Blog Management</h1>
          <p>Manage your blog posts and content</p>
        </div>
        
        <Link href="/admin/blogs/new" className={styles.createButton}>
          <Plus size={20} />
          New Blog Post
        </Link>
      </div>

      <div className={styles.filters}>
        <button 
          onClick={() => setFilter('all')}
          className={filter === 'all' ? styles.activeFilter : styles.filterButton}
        >
          All ({blogs.length})
        </button>
        <button 
          onClick={() => setFilter('published')}
          className={filter === 'published' ? styles.activeFilter : styles.filterButton}
        >
          Published ({blogs.filter(b => b.status === 'published').length})
        </button>
        <button 
          onClick={() => setFilter('draft')}
          className={filter === 'draft' ? styles.activeFilter : styles.filterButton}
        >
          Drafts ({blogs.filter(b => b.status === 'draft').length})
        </button>
        <button 
          onClick={() => setFilter('featured')}
          className={filter === 'featured' ? styles.activeFilter : styles.filterButton}
        >
          Featured ({blogs.filter(b => b.featured).length})
        </button>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>No blog posts found</h3>
          <p>
            {filter === 'all' 
              ? "You haven't created any blog posts yet."
              : `No ${filter} blog posts found.`
            }
          </p>
          <Link href="/admin/blogs/new" className={styles.createButton}>
            <Plus size={20} />
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className={styles.blogGrid}>
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className={styles.blogCard}>
              <div className={styles.blogImage}>
                {blog.featured_image ? (
                  <Image
                    src={blog.featured_image}
                    alt={blog.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className={styles.placeholderImage}>
                    <Eye size={24} />
                  </div>
                )}
                
                <div className={styles.blogStatus}>
                  <span className={`${styles.statusBadge} ${styles[blog.status]}`}>
                    {blog.status}
                  </span>
                  {blog.featured && (
                    <span className={styles.featuredBadge}>
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.blogContent}>
                <h3 className={styles.blogTitle}>{blog.title}</h3>
                {blog.excerpt && (
                  <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                )}
                
                <div className={styles.blogMeta}>
                  <div className={styles.metaItem}>
                    <User size={14} />
                    {blog.author}
                  </div>
                  <div className={styles.metaItem}>
                    <Calendar size={14} />
                    {formatDate(blog.created_at)}
                  </div>
                </div>

                {blog.category && (
                  <div className={styles.category}>{blog.category}</div>
                )}

                <div className={styles.blogActions}>
                  <Link 
                    href={`/admin/blogs/${blog.id}`}
                    className={styles.actionButton}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Link>
                  
                  <button
                    onClick={() => toggleStatus(blog.id, blog.status)}
                    className={`${styles.actionButton} ${styles.statusToggle}`}
                    title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button
                    onClick={() => deleteBlog(blog.id, blog.title)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}