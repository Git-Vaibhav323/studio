'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/imageUtils';
import { Upload, Search, Filter, Trash2, Download, Copy, Grid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Media.module.css';

export default function MediaLibrary() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedImages, setSelectedImages] = useState([]);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      // Get public URLs for all images
      const imagesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(file.name);

          return {
            ...file,
            publicUrl,
            folder: file.name.split('/')[0] || 'general'
          };
        })
      );

      setImages(imagesWithUrls);
    } catch (error) {
      toast.error('Error fetching images');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(file => 
        uploadImage(supabase, file, 'media')
      );
      
      const results = await Promise.all(uploadPromises);
      
      toast.success(`${results.length} images uploaded successfully`);
      fetchImages(); // Refresh the list
    } catch (error) {
      toast.error('Error uploading images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [supabase]);

  const deleteSelectedImages = async () => {
    if (selectedImages.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) return;

    try {
      const deletePromises = selectedImages.map(imagePath => 
        deleteImage(supabase, imagePath)
      );
      
      await Promise.all(deletePromises);
      
      toast.success(`${selectedImages.length} images deleted successfully`);
      setSelectedImages([]);
      fetchImages();
    } catch (error) {
      toast.error('Error deleting images');
      console.error('Delete error:', error);
    }
  };

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard');
  };

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Image downloaded');
    } catch (error) {
      toast.error('Error downloading image');
    }
  };

  const toggleImageSelection = (imagePath) => {
    setSelectedImages(prev => 
      prev.includes(imagePath)
        ? prev.filter(path => path !== imagePath)
        : [...prev, imagePath]
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true
  });

  const folders = [...new Set(images.map(img => img.folder))];
  
  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = folderFilter === 'all' || image.folder === folderFilter;
    return matchesSearch && matchesFolder;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading media library...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Media Library</h1>
          <p>Manage images and media files for your website</p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={styles.viewToggle}
          >
            {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
          </button>
          
          {selectedImages.length > 0 && (
            <button
              onClick={deleteSelectedImages}
              className={styles.deleteButton}
            >
              <Trash2 size={20} />
              Delete ({selectedImages.length})
            </button>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterBox}>
          <Filter size={20} />
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
          >
            <option value="all">All Folders</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={32} />
        <h3>{uploading ? 'Uploading...' : 'Drop images here or click to upload'}</h3>
        <p>Support for JPEG, PNG, WebP, and GIF files. Each image will be compressed under 150KB.</p>
      </div>

      {/* Images Grid/List */}
      {filteredImages.length === 0 ? (
        <div className={styles.empty}>
          <h3>No images found</h3>
          <p>Upload your first image to get started.</p>
        </div>
      ) : (
        <div className={`${styles.imageGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
          {filteredImages.map((image) => (
            <div key={image.name} className={styles.imageCard}>
              <div className={styles.imageContainer}>
                <Image
                  src={image.publicUrl}
                  alt={image.name}
                  width={viewMode === 'grid' ? 200 : 80}
                  height={viewMode === 'grid' ? 150 : 60}
                  style={{ objectFit: 'cover' }}
                />
                
                <div className={styles.imageOverlay}>
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.name)}
                    onChange={() => toggleImageSelection(image.name)}
                    className={styles.imageCheckbox}
                  />
                  
                  <div className={styles.imageActions}>
                    <button
                      onClick={() => copyImageUrl(image.publicUrl)}
                      className={styles.actionButton}
                      title="Copy URL"
                    >
                      <Copy size={16} />
                    </button>
                    
                    <button
                      onClick={() => downloadImage(image.publicUrl, image.name)}
                      className={styles.actionButton}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedImages([image.name]);
                        deleteSelectedImages();
                      }}
                      className={`${styles.actionButton} ${styles.delete}`}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.imageInfo}>
                <h4 className={styles.imageName}>{image.name.split('/').pop()}</h4>
                <div className={styles.imageMeta}>
                  <span className={styles.imageSize}>
                    {(image.metadata?.size / 1024).toFixed(1)} KB
                  </span>
                  <span className={styles.imageFolder}>{image.folder}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{images.length}</span>
          <span className={styles.statLabel}>Total Images</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {Math.round(images.reduce((sum, img) => sum + (img.metadata?.size || 0), 0) / 1024 / 1024)} MB
          </span>
          <span className={styles.statLabel}>Storage Used</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{folders.length}</span>
          <span className={styles.statLabel}>Folders</span>
        </div>
      </div>
    </div>
  );
}