'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/imageUtils';
import { Save, ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './ServiceForm.module.css';

export default function ServiceForm({ initialData, isEditing = false }) {
  const router = useRouter();
  const supabase = createSupabaseClient();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    short_description: initialData?.short_description || '',
    detailed_description: initialData?.detailed_description || '',
    features: initialData?.features || [],
    process_steps: initialData?.process_steps || [],
    featured_image: initialData?.featured_image || '',
    gallery: initialData?.gallery || [],
    price_range: initialData?.price_range || '',
    duration: initialData?.duration || '',
    status: initialData?.status || 'active',
    featured: initialData?.featured || false,
    sort_order: initialData?.sort_order || 0,
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
    seo_keywords: initialData?.seo_keywords || []
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }));
    } else if (name === 'seo_keywords') {
      const keywords = value.split(',').map(k => k.trim()).filter(k => k);
      setFormData(prev => ({ ...prev, [name]: keywords }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Feature management
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { title: '', description: '' }]
    }));
  };

  const updateFeature = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Process steps management
  const addProcessStep = () => {
    setFormData(prev => ({
      ...prev,
      process_steps: [...prev.process_steps, { title: '', description: '', duration: '' }]
    }));
  };

  const updateProcessStep = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      process_steps: prev.process_steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeProcessStep = (index) => {
    setFormData(prev => ({
      ...prev,
      process_steps: prev.process_steps.filter((_, i) => i !== index)
    }));
  };

  // Featured image upload
  const onFeaturedImageDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const result = await uploadImage(supabase, file, 'services');
      
      if (formData.featured_image) {
        const oldPath = formData.featured_image.split('/').pop();
        await deleteImage(supabase, `services/${oldPath}`);
      }
      
      setFormData(prev => ({ ...prev, featured_image: result.url }));
      toast.success('Featured image uploaded successfully');
    } catch (error) {
      toast.error('Error uploading image');
      console.error('Upload error:', error);
    } finally {
      setImageUploading(false);
    }
  }, [formData.featured_image, supabase]);

  const removeFeaturedImage = async () => {
    try {
      if (formData.featured_image) {
        const path = formData.featured_image.split('/').pop();
        await deleteImage(supabase, `services/${path}`);
      }
      
      setFormData(prev => ({ ...prev, featured_image: '' }));
      toast.success('Featured image removed');
    } catch (error) {
      toast.error('Error removing image');
    }
  };

  const { getRootProps: getFeaturedRootProps, getInputProps: getFeaturedInputProps, isDragActive: isFeaturedDragActive } = useDropzone({
    onDrop: onFeaturedImageDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('services')
          .update(formData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Service updated successfully');
      } else {
        const { error } = await supabase
          .from('services')
          .insert([formData]);

        if (error) throw error;
        toast.success('Service created successfully');
      }

      router.push('/admin/services');
    } catch (error) {
      toast.error(isEditing ? 'Error updating service' : 'Error creating service');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => router.back()} 
          className={styles.backButton}
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h3>Basic Information</h3>
            
            <div className={styles.field}>
              <label htmlFor="title">Service Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Spatial Planning"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="slug">URL Slug</label>
              <input
                id="slug"
                name="slug"
                type="text"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="auto-generated-from-title"
              />
              <span className={styles.fieldHint}>
                URL: /services/{formData.slug}
              </span>
            </div>

            <div className={styles.field}>
              <label htmlFor="short_description">Short Description</label>
              <textarea
                id="short_description"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description for service cards"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="detailed_description">Detailed Description</label>
              <textarea
                id="detailed_description"
                name="detailed_description"
                value={formData.detailed_description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Detailed service description for the service page"
              />
            </div>
          </div>

          {/* Service Details */}
          <div className={styles.section}>
            <h3>Service Details</h3>
            
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="price_range">Price Range</label>
                <input
                  id="price_range"
                  name="price_range"
                  type="text"
                  value={formData.price_range}
                  onChange={handleInputChange}
                  placeholder="e.g., ₹5L - ₹15L"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="duration">Duration</label>
                <input
                  id="duration"
                  name="duration"
                  type="text"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 2-3 months"
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className={styles.checkboxField}>
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                <label htmlFor="featured">Featured Service</label>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className={styles.section}>
          <h3>Featured Image</h3>
          
          {formData.featured_image ? (
            <div className={styles.imagePreview}>
              <div className={styles.imageContainer}>
                <Image
                  src={formData.featured_image}
                  alt="Featured image"
                  width={300}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={removeFeaturedImage}
                  className={styles.removeImageButton}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div
              {...getFeaturedRootProps()}
              className={`${styles.dropzone} ${isFeaturedDragActive ? styles.dragActive : ''}`}
            >
              <input {...getFeaturedInputProps()} />
              <Upload size={24} />
              <p>
                {imageUploading ? 'Uploading...' : 'Drop featured image here or click to select'}
              </p>
              <span>Recommended: 1200x800px</span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Service Features</h3>
            <button type="button" onClick={addFeature} className={styles.addButton}>
              <Plus size={16} />
              Add Feature
            </button>
          </div>
          
          {formData.features.map((feature, index) => (
            <div key={index} className={styles.dynamicItem}>
              <div className={styles.dynamicFields}>
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  placeholder="Feature title"
                />
                <textarea
                  value={feature.description}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                  placeholder="Feature description"
                  rows={2}
                />
              </div>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className={styles.removeButton}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Process Steps */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Process Steps</h3>
            <button type="button" onClick={addProcessStep} className={styles.addButton}>
              <Plus size={16} />
              Add Step
            </button>
          </div>
          
          {formData.process_steps.map((step, index) => (
            <div key={index} className={styles.dynamicItem}>
              <div className={styles.dynamicFields}>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                  placeholder="Step title"
                />
                <textarea
                  value={step.description}
                  onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                  placeholder="Step description"
                  rows={2}
                />
                <input
                  type="text"
                  value={step.duration}
                  onChange={(e) => updateProcessStep(index, 'duration', e.target.value)}
                  placeholder="Duration (optional)"
                />
              </div>
              <button
                type="button"
                onClick={() => removeProcessStep(index)}
                className={styles.removeButton}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* SEO Settings */}
        <div className={styles.section}>
          <h3>SEO Settings</h3>
          
          <div className={styles.field}>
            <label htmlFor="seo_title">SEO Title</label>
            <input
              id="seo_title"
              name="seo_title"
              type="text"
              value={formData.seo_title}
              onChange={handleInputChange}
              placeholder="SEO optimized title"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="seo_description">SEO Description</label>
            <textarea
              id="seo_description"
              name="seo_description"
              value={formData.seo_description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Description for search engines"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="seo_keywords">SEO Keywords</label>
            <input
              id="seo_keywords"
              name="seo_keywords"
              type="text"
              value={formData.seo_keywords.join(', ')}
              onChange={handleInputChange}
              placeholder="keyword1, keyword2, keyword3"
            />
            <span className={styles.fieldHint}>
              Separate keywords with commas
            </span>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            <Save size={20} />
            {loading ? 'Saving...' : (isEditing ? 'Update Service' : 'Create Service')}
          </button>
        </div>
      </form>
    </div>
  );
}