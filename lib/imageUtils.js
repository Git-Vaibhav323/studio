import imageCompression from 'browser-image-compression';

/**
 * Compress image to under 150KB while maintaining quality
 */
export async function compressImage(file, maxSizeKB = 150) {
  const options = {
    maxSizeMB: maxSizeKB / 1024, // Convert KB to MB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type,
    initialQuality: 0.8
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // If still too large, compress more aggressively
    if (compressedFile.size > maxSizeKB * 1024) {
      const aggressiveOptions = {
        ...options,
        maxSizeMB: (maxSizeKB * 0.8) / 1024,
        maxWidthOrHeight: 1200,
        initialQuality: 0.6
      };
      return await imageCompression(file, aggressiveOptions);
    }
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Upload image to Supabase storage
 */
export async function uploadImage(supabase, file, folder = 'general') {
  try {
    const compressedFile = await compressImage(file);
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return {
      path: data.path,
      url: publicUrl,
      size: compressedFile.size
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete image from Supabase storage
 */
export async function deleteImage(supabase, imagePath) {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([imagePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Generate optimized image variants
 */
export function getImageVariants(baseUrl) {
  if (!baseUrl) return {};
  
  return {
    original: baseUrl,
    thumbnail: `${baseUrl}?width=300&height=300&resize=cover`,
    medium: `${baseUrl}?width=600&height=400&resize=cover`,
    large: `${baseUrl}?width=1200&height=800&resize=cover`
  };
}