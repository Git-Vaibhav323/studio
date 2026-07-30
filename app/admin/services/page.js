'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import { Plus, Search, Edit, Trash2, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Services.module.css';

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn('Services table not found or accessible:', error);
        setServices([]);
      } else {
        setServices(data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setServices(services.filter(s => s.id !== id));
      toast.success('Service deleted successfully');
    } catch (error) {
      toast.error('Error deleting service');
      console.error('Error:', error);
    }
  };

  const toggleFeatured = async (id, featured) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ featured: !featured })
        .eq('id', id);

      if (error) throw error;
      
      setServices(services.map(s => 
        s.id === id ? { ...s, featured: !featured } : s
      ));
      
      toast.success(`Service ${!featured ? 'featured' : 'unfeatured'}`);
    } catch (error) {
      toast.error('Error updating service');
      console.error('Error:', error);
    }
  };

  const updateSortOrder = async (id, direction) => {
    const serviceIndex = services.findIndex(s => s.id === id);
    if (serviceIndex === -1) return;

    const newIndex = direction === 'up' ? serviceIndex - 1 : serviceIndex + 1;
    if (newIndex < 0 || newIndex >= services.length) return;

    const updatedServices = [...services];
    [updatedServices[serviceIndex], updatedServices[newIndex]] = [updatedServices[newIndex], updatedServices[serviceIndex]];
    
    // Update sort_order values
    updatedServices[serviceIndex].sort_order = serviceIndex;
    updatedServices[newIndex].sort_order = newIndex;

    try {
      const { error: error1 } = await supabase
        .from('services')
        .update({ sort_order: serviceIndex })
        .eq('id', updatedServices[serviceIndex].id);

      const { error: error2 } = await supabase
        .from('services')
        .update({ sort_order: newIndex })
        .eq('id', updatedServices[newIndex].id);

      if (error1 || error2) throw error1 || error2;
      
      setServices(updatedServices);
      toast.success('Service order updated');
    } catch (error) {
      toast.error('Error updating service order');
      console.error('Error:', error);
    }
  };

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Services</h1>
          <p>Manage your service offerings and detailed pages</p>
        </div>
        
        <Link href="/admin/services/new" className={styles.addButton}>
          <Plus size={20} />
          New Service
        </Link>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyContent}>
            <h3>No services found</h3>
            <p>Start by creating your first service to showcase your offerings.</p>
            <Link href="/admin/services/new" className={styles.emptyButton}>
              <Plus size={20} />
              Create First Service
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.servicesList}>
          {filteredServices.map((service, index) => (
            <div key={service.id} className={styles.serviceCard}>
              <div className={styles.serviceImage}>
                {service.featured_image ? (
                  <Image
                    src={service.featured_image}
                    alt={service.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className={styles.placeholderImage}>
                    <Eye size={24} />
                    <span>No Image</span>
                  </div>
                )}
              </div>

              <div className={styles.serviceContent}>
                <div className={styles.serviceHeader}>
                  <div className={styles.serviceMeta}>
                    <span className={`${styles.statusBadge} ${styles[service.status]}`}>
                      {service.status}
                    </span>
                    {service.featured && (
                      <span className={styles.featuredBadge}>Featured</span>
                    )}
                  </div>
                  
                  <div className={styles.sortControls}>
                    <button
                      onClick={() => updateSortOrder(service.id, 'up')}
                      disabled={index === 0}
                      className={styles.sortButton}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => updateSortOrder(service.id, 'down')}
                      disabled={index === filteredServices.length - 1}
                      className={styles.sortButton}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                <h3 className={styles.serviceTitle}>{service.title}</h3>
                
                {service.short_description && (
                  <p className={styles.serviceDescription}>
                    {service.short_description}
                  </p>
                )}

                <div className={styles.serviceDetails}>
                  {service.price_range && (
                    <div className={styles.detailItem}>
                      <strong>Price:</strong> {service.price_range}
                    </div>
                  )}
                  {service.duration && (
                    <div className={styles.detailItem}>
                      <strong>Duration:</strong> {service.duration}
                    </div>
                  )}
                </div>

                <div className={styles.serviceActions}>
                  <Link 
                    href={`/admin/services/${service.id}`}
                    className={styles.actionButton}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Link>
                  
                  <button
                    onClick={() => toggleFeatured(service.id, service.featured)}
                    className={`${styles.actionButton} ${service.featured ? styles.featured : ''}`}
                    title={service.featured ? 'Unfeature' : 'Feature'}
                  >
                    <Eye size={16} />
                  </button>

                  <Link
                    href={`/services/${service.slug}`}
                    target="_blank"
                    className={styles.actionButton}
                    title="View Service Page"
                  >
                    <Eye size={16} />
                  </Link>
                  
                  <button
                    onClick={() => deleteService(service.id)}
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
          <span className={styles.statNumber}>{services.length}</span>
          <span className={styles.statLabel}>Total Services</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {services.filter(s => s.status === 'active').length}
          </span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {services.filter(s => s.featured).length}
          </span>
          <span className={styles.statLabel}>Featured</span>
        </div>
      </div>
    </div>
  );
}