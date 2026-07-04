'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import styles from './Blogs.module.css';

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      toast.error('Error fetching blog posts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBlogs(blogs.filter(b => b.id !== id));
      toast.success('Blog post deleted successfully');
    } catch (error) {
      toast.error('Error deleting blog post');
      console.error('Error:', error);
    }
  };

  const toggleFeatured = async (id, featured) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ featured: !featured })
        .eq('id', id);

      if (error) throw error;
      
      setBlogs(blogs.map(b => 
        b.id === id ? { ...b, featured: !featured } : b
      ));
      
      toast.success(`Blog post ${!featured ? 'featured' : 'unfeatured'}`);
    } catch (error) {
      toast.error('Error updating blog post');
      console.error('Error:', error);
    }
  };

  const publishBlog = async (id, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const publishedAt = newStatus === 'published' ? new Date().toISOString() : null;
    
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ 
          status: newStatus,
          published_at: publishedAt
        })
        .eq('id', id);

      if (error) throw error;
      
      setBlogs(blogs.map(b => 
        b.id === id ? { ...b, status: newStatus, published_at: publishedAt } : b
      ));
      
      toast.success(`Blog post ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    } catch (error) {
      toast.error('Error updating blog status');
      console.error('Error:', error);
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(blogs.map(blog => blog.category).filter(Boolean))];

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Blog Posts</h1>
          <p>Manage your blog content and insights articles</p>
        </div>
        
        <Link href="/admin/blogs/new" className={styles.addButton}>
          <Plus size={20} />
          New Post
        </Link>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterBox}>
            <Filter size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {categories.length > 0 && (
            <div className={styles.filterBox}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyContent}>
            <h3>No blog posts found</h3>
            <p>Start sharing your insights by creating your first blog post.</p>
            <Link href="/admin/blogs/new" className={styles.emptyButton}>
              <Plus size={20} />
              Create First Post
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.blogsList}>
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
              </div>

              <div className={styles.blogContent}>
                <div className={styles.blogHeader}>
                  <div className={styles.blogMeta}>
                    <span className={`${styles.statusBadge} ${styles[blog.status]}`}>
                      {blog.status}
                    </span>
                    {blog.featured && (
                      <span className={styles.featuredBadge}>Featured</span>
                    )}
                    {blog.category && (
                      <span className={styles.categoryBadge}>{blog.category}</span>
                    )}
                  </div>
                  
                  <div className={styles.blogDate}>
                    <Calendar size={14} />
                    {blog.published_at 
                      ? format(new Date(blog.published_at), 'MMM dd, yyyy')
                      : format(new Date(blog.created_at), 'MMM dd, yyyy')
                    }
                  </div>
                </div>

                <h3 className={styles.blogTitle}>{blog.title}</h3>
                
                {blog.excerpt && (
                  <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                )}

                <div className={styles.blogFooter}>
                  <div className={styles.blogStats}>
                    {blog.read_time && (
                      <span className={styles.readTime}>{blog.read_time} min read</span>
                    )}
                  </div>

                  <div className={styles.blogActions}>
                    <Link 
                      href={`/admin/blogs/${blog.id}`}
                      className={styles.actionButton}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    
                    <button
                      onClick={() => toggleFeatured(blog.id, blog.featured)}
                      className={`${styles.actionButton} ${blog.featured ? styles.featured : ''}`}
                      title={blog.featured ? 'Unfeature' : 'Feature'}
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => publishBlog(blog.id, blog.status)}
                      className={`${styles.actionButton} ${blog.status === 'published' ? styles.published : ''}`}
                      title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {blog.status === 'published' ? '📤' : '📝'}
                    </button>
                    
                    <button
                      onClick={() => deleteBlog(blog.id)}
                      className={`${styles.actionButton} ${styles.delete}`}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{blogs.length}</span>
          <span className={styles.statLabel}>Total Posts</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {blogs.filter(b => b.status === 'published').length}
          </span>
          <span className={styles.statLabel}>Published</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {blogs.filter(b => b.featured).length}
          </span>
          <span className={styles.statLabel}>Featured</span>
        </div>
      </div>
    </div>
  );
}