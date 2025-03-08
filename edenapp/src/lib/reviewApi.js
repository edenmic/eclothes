import { supabase } from './supabase';

// Create a new review
export const createReview = async (reviewerId, revieweeId, rating, comment) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .insert([{
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment,
        created_at: new Date()
      }]);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error creating review:', error);
    return { success: false, error };
  }
};

// Get reviews for a user
export const getReviewsForUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, name, profile_picture)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting reviews:', error);
    return { success: false, error };
  }
};

// Check if user has already reviewed another user
export const hasUserReviewed = async (reviewerId, revieweeId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', reviewerId)
      .eq('reviewee_id', revieweeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error code for "No rows returned by the query"
      throw error;
    }
    
    return { success: true, hasReviewed: !!data };
  } catch (error) {
    console.error('Error checking if user has reviewed:', error);
    return { success: false, error };
  }
};

// Update a review
export const updateReview = async (reviewId, reviewerId, rating, comment) => {
  try {
    // First check if the user is the reviewer
    const { data: review } = await supabase
      .from('reviews')
      .select('reviewer_id')
      .eq('id', reviewId)
      .single();
      
    if (!review || review.reviewer_id !== reviewerId) {
      throw new Error('Not authorized to update this review');
    }
    
    // Update the review
    const { error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment
      })
      .eq('id', reviewId);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating review:', error);
    return { success: false, error };
  }
};

// Delete a review
export const deleteReview = async (reviewId, reviewerId) => {
  try {
    // First check if the user is the reviewer
    const { data: review } = await supabase
      .from('reviews')
      .select('reviewer_id')
      .eq('id', reviewId)
      .single();
      
    if (!review || review.reviewer_id !== reviewerId) {
      throw new Error('Not authorized to delete this review');
    }
    
    // Delete the review
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error };
  }
};