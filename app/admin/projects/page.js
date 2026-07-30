'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Projects.module.css';

export default function ProjectsManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn('Projects table not found or accessible:', error);
        setProjects([]);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(projects.filter(p => p.id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Error deleting project');
      console.error('Error:', error);
    }
  };

  const toggleFeatured = async (id, featured) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ featured: !featured })
        .eq('id', id);

      if (error) throw error;
      
      setProjects(projects.map(p => 
        p.id === id ? { ...p, featured: !featured } : p
      ));
      
      toast.success(`Project ${!featured ? 'featured' : 'unfeatured'}`);
    } catch (error) {
      toast.error('Error updating project');
      console.error('Error:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Projects</h1>
          <p>Manage your interior design projects and showcase portfolio</p>
        </div>
        
        <Link href="/admin/projects/new" className={styles.addButton}>
          <Plus size={20} />
          New Project
        </Link>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
      </div>

      {filteredProjects.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyContent}>
            <h3>No projects found</h3>
            <p>Start by creating your first project to showcase your work.</p>
            <Link href="/admin/projects/new" className={styles.emptyButton}>
              <Plus size={20} />
              Create First Project
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {filteredProjects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectImage}>
                {project.featured_image ? (
                  <Image
                    src={project.featured_image}
                    alt={project.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className={styles.placeholderImage}>
                    <Eye size={24} />
                    <span>No Image</span>
                  </div>
                )}
                
                <div className={styles.projectOverlay}>
                  <div className={styles.projectBadges}>
                    <span className={`${styles.statusBadge} ${styles[project.status]}`}>
                      {project.status}
                    </span>
                    {project.featured && (
                      <span className={styles.featuredBadge}>Featured</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.projectContent}>
                <div className={styles.projectMeta}>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  {project.location && (
                    <p className={styles.projectLocation}>{project.location}</p>
                  )}
                  {project.short_description && (
                    <p className={styles.projectDescription}>
                      {project.short_description}
                    </p>
                  )}
                </div>

                <div className={styles.projectActions}>
                  <Link 
                    href={`/admin/projects/${project.id}`}
                    className={styles.actionButton}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Link>
                  
                  <button
                    onClick={() => toggleFeatured(project.id, project.featured)}
                    className={`${styles.actionButton} ${project.featured ? styles.featured : ''}`}
                    title={project.featured ? 'Unfeature' : 'Feature'}
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button
                    onClick={() => deleteProject(project.id)}
                    className={`${styles.actionButton} ${styles.delete}`}
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

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{projects.length}</span>
          <span className={styles.statLabel}>Total Projects</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {projects.filter(p => p.status === 'published').length}
          </span>
          <span className={styles.statLabel}>Published</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {projects.filter(p => p.featured).length}
          </span>
          <span className={styles.statLabel}>Featured</span>
        </div>
      </div>
    </div>
  );
}