import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROFILES: 'profiles',
  ITEMS: 'items',
};

// Initialize storage buckets - run this function once in your app initialization
export const initializeStorageBuckets = async () => {
  try {
    // Check if buckets exist, if not create them
    for (const bucket of Object.values(STORAGE_BUCKETS)) {
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets.some(b => b.name === bucket);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(bucket, {
          public: false,
          fileSizeLimit: 10485760, // 10MB file size limit
        });
        
        if (error) throw error;
        console.log(`Created storage bucket: ${bucket}`);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
    return { success: false, error };
  }
};

// Upload a profile image
export const uploadProfileImage = async (userId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.PROFILES)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.PROFILES)
      .getPublicUrl(filePath);

    return { 
      success: true, 
      filePath, 
      publicUrl: data.publicUrl 
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return { success: false, error };
  }
};

// Upload an item image
export const uploadItemImage = async (itemId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}/${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.ITEMS)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.ITEMS)
      .getPublicUrl(filePath);

    return { 
      success: true, 
      filePath, 
      publicUrl: data.publicUrl 
    };
  } catch (error) {
    console.error('Error uploading item image:', error);
    return { success: false, error };
  }
};

// Remove an image
export const removeImage = async (bucket, filePath) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error removing image from ${bucket}:`, error);
    return { success: false, error };
  }
};