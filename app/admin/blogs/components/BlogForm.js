'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/imageUtils';
import { Save, ArrowLeft, Upload, X, Type, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './BlogForm.module.css';

// Simple rich text editor component
function RichTextEditor({ value, onChange, placeholder }) {
  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    onChange(document.getElementById('editor').innerHTML);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => handleFormat('bold')} className={styles.toolBtn}>
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => handleFormat('italic')} className={styles.toolBtn}>
          <em>I</em>
        </button>
        <button type="button" onClick={() => handleFormat('insertUnorderedList')} className={styles.toolBtn}>
          ≡
        </button>
        <button type="button" onClick={() => handleFormat('formatBlock', 'h3')} className={styles.toolBtn}>
          H3
        </button>
      </div>
      <div
        id="editor"
        className={styles.editorContent}
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.target.innerHTML)}
        data-placeholder={placeholder}
      />
    </div>
  );
}

export default function BlogForm({ initialData, isEditing = false }) {
  const router = useRouter();
  const supabase = createSupabaseClient();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featured_image: initialData?.featured_image || '',
    author: initialData?.author || 'The Spatial Edit',
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
    read_time: initialData?.read_time || 5,
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
    } else if (name === 'tags') {
      const tags = value.split(',').map(t => t.trim()).filter(t => t);
      setFormData(prev => ({ ...prev, [name]: tags }));
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

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
    
    // Calculate reading time (average 200 words per minute)
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0);
    const readTime = Math.max(1, Math.ceil(words.length / 200));
    setFormData(prev => ({ ...prev, read_time: readTime }));
  };

  // Featured image upload
  const onFeaturedImageDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const result = await uploadImage(supabase, file, 'blogs');
      
      // Delete old image if exists
      if (formData.featured_image) {
        const oldPath = formData.featured_image.split('/').pop();
        await deleteImage(supabase, `blogs/${oldPath}`);
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
        await deleteImage(supabase, `blogs/${path}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (isEditing) {
        const { error } = await supabase
          .from('blogs')
          .update(submitData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Blog post updated successfully');
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([submitData]);

        if (error) throw error;
        toast.success('Blog post created successfully');
      }

      router.push('/admin/blogs');
    } catch (error) {
      toast.error(isEditing ? 'Error updating blog post' : 'Error creating blog post');
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
              <label htmlFor="title">Blog Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., The Importance of Spatial Planning"
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
                URL: /blog/{formData.slug}
              </span>
            </div>

            <div className={styles.field}>
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief summary for blog previews and SEO"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                <option value="Design Tips">Design Tips</option>
                <option value="Spatial Planning">Spatial Planning</option>
                <option value="Materials">Materials</option>
                <option value="Process">Process</option>
                <option value="Insights">Insights</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="tags">Tags</label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags.join(', ')}
                onChange={handleInputChange}
                placeholder="tag1, tag2, tag3"
              />
              <span className={styles.fieldHint}>
                Separate tags with commas
              </span>
            </div>
          </div>

          {/* Settings */}
          <div className={styles.section}>
            <h3>Settings</h3>
            
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="author">Author</label>
                <input
                  id="author"
                  name="author"
                  type="text"
                  value={formData.author}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="read_time">Read Time (minutes)</label>
                <input
                  id="read_time"
                  name="read_time"
                  type="number"
                  value={formData.read_time}
                  onChange={handleInputChange}
                  min="1"
                  max="60"
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
                <label htmlFor="featured">Featured Post</label>
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
              <span>Recommended: 1200x630px, under 150KB after compression</span>
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div className={styles.section}>
          <h3>Content</h3>
          <RichTextEditor
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Write your blog post content here..."
          />
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
            {loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
          </button>
        </div>
      </form>
    </div>
  );
}