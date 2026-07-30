'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/imageUtils';
import { Save, ArrowLeft, Upload, X, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './ProjectForm.module.css';

export default function ProjectForm({ initialData, isEditing = false }) {
  const router = useRouter();
  const supabase = createSupabaseClient();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    short_description: initialData?.short_description || '',
    featured_image: initialData?.featured_image || '',
    gallery: initialData?.gallery || [],
    project_type: initialData?.project_type || '',
    location: initialData?.location || '',
    area: initialData?.area || '',
    year: initialData?.year || new Date().getFullYear(),
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
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

  // Featured image upload
  const onFeaturedImageDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const result = await uploadImage(supabase, file, 'projects');
      
      // Delete old image if exists
      if (formData.featured_image) {
        const oldPath = formData.featured_image.split('/').pop();
        await deleteImage(supabase, `projects/${oldPath}`);
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

  // Gallery images upload
  const onGalleryDrop = useCallback(async (acceptedFiles) => {
    setImageUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(file => uploadImage(supabase, file, 'projects/gallery'));
      const results = await Promise.all(uploadPromises);
      
      const newImages = results.map(result => ({
        url: result.url,
        path: result.path,
        size: result.size
      }));
      
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newImages]
      }));
      
      toast.success(`${results.length} images uploaded successfully`);
    } catch (error) {
      toast.error('Error uploading gallery images');
      console.error('Upload error:', error);
    } finally {
      setImageUploading(false);
    }
  }, [supabase]);

  const removeGalleryImage = async (index) => {
    const image = formData.gallery[index];
    try {
      if (image.path) {
        await deleteImage(supabase, image.path);
      }
      
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index)
      }));
      
      toast.success('Image removed successfully');
    } catch (error) {
      toast.error('Error removing image');
      console.error('Delete error:', error);
    }
  };

  const removeFeaturedImage = async () => {
    try {
      if (formData.featured_image) {
        const path = formData.featured_image.split('/').pop();
        await deleteImage(supabase, `projects/${path}`);
      }
      
      setFormData(prev => ({ ...prev, featured_image: '' }));
      toast.success('Featured image removed');
    } catch (error) {
      toast.error('Error removing image');
      console.error('Delete error:', error);
    }
  };

  const { getRootProps: getFeaturedRootProps, getInputProps: getFeaturedInputProps, isDragActive: isFeaturedDragActive } = useDropzone({
    onDrop: onFeaturedImageDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  const { getRootProps: getGalleryRootProps, getInputProps: getGalleryInputProps, isDragActive: isGalleryDragActive } = useDropzone({
    onDrop: onGalleryDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Project updated successfully');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([formData]);

        if (error) throw error;
        toast.success('Project created successfully');
      }

      router.push('/admin/projects');
    } catch (error) {
      toast.error(isEditing ? 'Error updating project' : 'Error creating project');
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
              <label htmlFor="title">Project Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Modern Villa Interior"
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
                URL: /projects/{formData.slug}
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
                placeholder="Brief description for project cards and previews"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="description">Full Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Detailed project description, design process, challenges, and outcomes"
              />
            </div>
          </div>

          {/* Project Details */}
          <div className={styles.section}>
            <h3>Project Details</h3>
            
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="project_type">Project Type</label>
                <select
                  id="project_type"
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleInputChange}
                >
                  <option value="">Select Type</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Office">Office</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Renovation">Renovation</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Jubilee Hills, Hyderabad"
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="area">Area</label>
                <input
                  id="area"
                  name="area"
                  type="text"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="e.g., 2500 sq ft"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="year">Year</label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="2020"
                  max="2030"
                />
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
              <span>Recommended: 1200x800px, under 150KB after compression</span>
            </div>
          )}
        </div>

        {/* Gallery */}
        <div className={styles.section}>
          <h3>Project Gallery</h3>
          
          {formData.gallery.length > 0 && (
            <div className={styles.galleryGrid}>
              {formData.gallery.map((image, index) => (
                <div key={index} className={styles.galleryItem}>
                  <Image
                    src={image.url}
                    alt={`Gallery image ${index + 1}`}
                    width={150}
                    height={100}
                    style={{ objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className={styles.removeGalleryButton}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div
            {...getGalleryRootProps()}
            className={`${styles.dropzone} ${isGalleryDragActive ? styles.dragActive : ''}`}
          >
            <input {...getGalleryInputProps()} />
            <Upload size={24} />
            <p>
              {imageUploading ? 'Uploading...' : 'Drop gallery images here or click to select'}
            </p>
            <span>Multiple images allowed. Each will be compressed under 150KB</span>
          </div>
        </div>

        {/* Settings */}
        <div className={styles.section}>
          <h3>Settings & SEO</h3>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
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
              <label htmlFor="featured">Featured Project</label>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="seo_title">SEO Title</label>
            <input
              id="seo_title"
              name="seo_title"
              type="text"
              value={formData.seo_title}
              onChange={handleInputChange}
              placeholder="SEO optimized title for search engines"
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
              placeholder="Description for search engine results"
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
            {loading ? 'Saving...' : (isEditing ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>
    </div>
  );
}