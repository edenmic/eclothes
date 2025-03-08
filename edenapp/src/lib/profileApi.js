import { supabase } from './supabase';
import { uploadProfileImage } from './supabaseStorage';

// Create a new profile after signup
export const createProfile = async (userId, profileData = {}) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert([{ 
        id: userId,
        ...profileData,
        created_at: new Date(),
        updated_at: new Date()
      }]);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { success: false, error };
  }
};

// Get a profile by ID
export const getProfileById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, error };
  }
};

// Update a profile
export const updateProfile = async (userId, profileData) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date()
      })
      .eq('id', userId);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
};

// Update profile with image upload
export const updateProfileWithImage = async (userId, profileData, imageFile) => {
  try {
    // First upload the image if provided
    let imageUrl = profileData.profile_picture;
    
    if (imageFile) {
      const uploadResult = await uploadProfileImage(userId, imageFile);
      if (!uploadResult.success) throw uploadResult.error;
      imageUrl = uploadResult.publicUrl;
    }
    
    // Then update the profile with the new image URL
    const { error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        profile_picture: imageUrl,
        updated_at: new Date()
      })
      .eq('id', userId);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile with image:', error);
    return { success: false, error };
  }
};

// Get user reviews
export const getUserReviews = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, name, profile_picture)
      `)
      .eq('reviewee_id', userId);

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return { success: false, error };
  }
};