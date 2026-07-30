'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { 
  FolderOpen, 
  PenTool, 
  Users, 
  TrendingUp,
  Eye,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: { total: 0, published: 0 },
    blogs: { total: 0, published: 0 },
    leads: { total: 0, new: 0 },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Fetch projects stats
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('status');
      
      if (projectsError) {
        console.warn('Projects table not found:', projectsError);
      }
      
      // Fetch blogs stats
      const { data: blogs, error: blogsError } = await supabase
        .from('blogs')
        .select('status');
        
      if (blogsError) {
        console.warn('Blogs table not found:', blogsError);
      }

      // Fetch leads stats
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('status, created_at');
        
      if (leadsError) {
        console.warn('Leads table not found:', leadsError);
      }

      // Update stats with error handling
      setStats({
        projects: { 
          total: projects?.length || 0, 
          published: projects?.filter(p => p.status === 'published')?.length || 0 
        },
        blogs: { 
          total: blogs?.length || 0, 
          published: blogs?.filter(b => b.status === 'published')?.length || 0 
        },
        leads: { 
          total: leads?.length || 0, 
          new: leads?.filter(l => {
            const created = new Date(l.created_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return created > sevenDaysAgo;
          })?.length || 0
        },
        recentActivity: {
          projects: [],
          blogs: [],
          leads: []
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats in case of error
      setStats({
        projects: { total: 0, published: 0 },
        blogs: { total: 0, published: 0 },
        leads: { total: 0, new: 0 },
        recentActivity: {
          projects: [],
          blogs: [],
          leads: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your website.</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FolderOpen size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Projects</h3>
            <div className={styles.statNumbers}>
              <span className={styles.mainStat}>{stats.projects.total}</span>
              <span className={styles.subStat}>{stats.projects.published} published</span>
            </div>
          </div>
          <Link href="/admin/projects" className={styles.statLink}>
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <PenTool size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Blog Posts</h3>
            <div className={styles.statNumbers}>
              <span className={styles.mainStat}>{stats.blogs.total}</span>
              <span className={styles.subStat}>{stats.blogs.published} published</span>
            </div>
          </div>
          <Link href="/admin/blogs" className={styles.statLink}>
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Leads</h3>
            <div className={styles.statNumbers}>
              <span className={styles.mainStat}>{stats.leads.total}</span>
              <span className={styles.subStat}>{stats.leads.new} new</span>
            </div>
          </div>
          <Link href="/admin/leads" className={styles.statLink}>
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Growth</h3>
            <div className={styles.statNumbers}>
              <span className={styles.mainStat}>+12%</span>
              <span className={styles.subStat}>this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activityGrid}>
        <div className={styles.activityCard}>
          <h3>Recent Projects</h3>
          <div className={styles.activityList}>
            {stats.recentActivity.projects?.map((project) => (
              <div key={project.id} className={styles.activityItem}>
                <div className={styles.activityContent}>
                  <span className={styles.activityTitle}>{project.title}</span>
                  <span className={styles.activityTime}>
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`${styles.status} ${styles[project.status]}`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
          <Link href="/admin/projects" className={styles.viewAll}>
            View all projects →
          </Link>
        </div>

        <div className={styles.activityCard}>
          <h3>Recent Blog Posts</h3>
          <div className={styles.activityList}>
            {stats.recentActivity.blogs?.map((blog) => (
              <div key={blog.id} className={styles.activityItem}>
                <div className={styles.activityContent}>
                  <span className={styles.activityTitle}>{blog.title}</span>
                  <span className={styles.activityTime}>
                    {new Date(blog.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`${styles.status} ${styles[blog.status]}`}>
                  {blog.status}
                </span>
              </div>
            ))}
          </div>
          <Link href="/admin/blogs" className={styles.viewAll}>
            View all posts →
          </Link>
        </div>

        <div className={styles.activityCard}>
          <h3>Recent Leads</h3>
          <div className={styles.activityList}>
            {stats.recentActivity.leads?.map((lead) => (
              <div key={lead.id} className={styles.activityItem}>
                <div className={styles.activityContent}>
                  <span className={styles.activityTitle}>{lead.name}</span>
                  <span className={styles.activityTime}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`${styles.status} ${styles[lead.status]}`}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
          <Link href="/admin/leads" className={styles.viewAll}>
            View all leads →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionButtons}>
          <Link href="/admin/projects/new" className={styles.actionBtn}>
            <FolderOpen size={20} />
            New Project
          </Link>
          <Link href="/admin/blogs/new" className={styles.actionBtn}>
            <PenTool size={20} />
            New Blog Post
          </Link>
          <Link href="/admin/media" className={styles.actionBtn}>
            <Eye size={20} />
            Media Library
          </Link>
        </div>
      </div>
    </div>
  );
}