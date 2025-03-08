import { supabase } from './supabase';
import { uploadItemImage } from './supabaseStorage';

// Create a new item listing
export const createItem = async (userId, itemData) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .insert([{
        user_id: userId,
        ...itemData,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating item:', error);
    return { success: false, error };
  }
};

// Get all items with pagination
export const getItems = async (page = 1, limit = 10, filters = {}) => {
  try {
    let query = supabase
      .from('items')
      .select(`
        *,
        user:profiles(id, name, city, profile_picture, rating_average),
        images:item_images(id, image_url)
      `, { count: 'exact' });
    
    // Apply filters if any
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.size) {
      query = query.eq('size', filters.size);
    }
    
    if (filters.brand) {
      query = query.ilike('brand', `%${filters.brand}%`);
    }
    
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    
    // Search in title and description
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // Sort items
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder === 'asc' ? true : false;
      query = query.order(filters.sortBy, { ascending: sortOrder });
    } else {
      // Default sort by created_at in descending order
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    
    return {
      success: true,
      data,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  } catch (error) {
    console.error('Error getting items:', error);
    return { success: false, error };
  }
};

// Get items by user ID
export const getUserItems = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        images:item_images(id, image_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user items:', error);
    return { success: false, error };
  }
};

// Get a single item by ID
export const getItemById = async (itemId) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        user:profiles(id, name, city, profile_picture, rating_average),
        images:item_images(id, image_url)
      `)
      .eq('id', itemId)
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting item:', error);
    return { success: false, error };
  }
};

// Update an item
export const updateItem = async (itemId, userId, itemData) => {
  try {
    // First check if the user is the owner of the item
    const { data: item } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single();
      
    if (!item || item.user_id !== userId) {
      throw new Error('Not authorized to update this item');
    }
    
    // Update the item
    const { error } = await supabase
      .from('items')
      .update({
        ...itemData,
        updated_at: new Date()
      })
      .eq('id', itemId);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating item:', error);
    return { success: false, error };
  }
};

// Delete an item
export const deleteItem = async (itemId, userId) => {
  try {
    // First check if the user is the owner of the item
    const { data: item } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single();
      
    if (!item || item.user_id !== userId) {
      throw new Error('Not authorized to delete this item');
    }
    
    // Delete the item - this will cascade delete the images too
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error };
  }
};

// Upload an image for an item
export const uploadItemImageWithDb = async (itemId, userId, file) => {
  try {
    // First check if the user is the owner of the item
    const { data: item } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single();
      
    if (!item || item.user_id !== userId) {
      throw new Error('Not authorized to upload images for this item');
    }
    
    // Upload the image to storage
    const uploadResult = await uploadItemImage(itemId, file);
    if (!uploadResult.success) throw uploadResult.error;
    
    // Store the image reference in the database
    const { error } = await supabase
      .from('item_images')
      .insert([{
        item_id: itemId,
        image_url: uploadResult.publicUrl
      }]);

    if (error) throw error;
    
    return { success: true, imageUrl: uploadResult.publicUrl };
  } catch (error) {
    console.error('Error uploading item image:', error);
    return { success: false, error };
  }
};

// Delete an image
export const deleteItemImage = async (imageId, userId) => {
  try {
    // First get the image to get the item_id
    const { data: image } = await supabase
      .from('item_images')
      .select('item_id, image_url')
      .eq('id', imageId)
      .single();
      
    if (!image) {
      throw new Error('Image not found');
    }
    
    // Check if user owns the item
    const { data: item } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', image.item_id)
      .single();
      
    if (!item || item.user_id !== userId) {
      throw new Error('Not authorized to delete this image');
    }
    
    // Delete from database
    const { error } = await supabase
      .from('item_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
    
    // Parse the URL to get the file path
    const urlParts = image.image_url.split('/');
    const filePath = urlParts.slice(urlParts.indexOf('items') + 1).join('/');
    
    // Delete from storage - this is a best-effort operation
    await supabase.storage
      .from('items')
      .remove([filePath]);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting item image:', error);
    return { success: false, error };
  }
};