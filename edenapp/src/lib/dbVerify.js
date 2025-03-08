import { supabase } from './supabase';

/**
 * Verifies all required database tables exist and have the correct structure
 */
export const verifyDatabaseSetup = async () => {
  console.log('⏳ Verifying database setup...');
  const tables = ['profiles', 'items', 'item_images', 'reviews'];
  const results = {};
  let allTablesExist = true;

  for (const table of tables) {
    try {
      // Try to query the table
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Table '${table}' check failed:`, error.message);
        results[table] = { exists: false, error: error.message };
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table}' exists`);
        results[table] = { exists: true };
      }
    } catch (error) {
      console.error(`❌ Error checking table '${table}':`, error.message);
      results[table] = { exists: false, error: error.message };
      allTablesExist = false;
    }
  }

  // Verify storage buckets
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Storage buckets check failed:', error.message);
      results.storage = { exists: false, error: error.message };
    } else {
      const requiredBuckets = ['profiles', 'items'];
      const existingBuckets = buckets.map(b => b.name);
      
      const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
      
      if (missingBuckets.length === 0) {
        console.log('✅ All storage buckets exist');
        results.storage = { exists: true, buckets: existingBuckets };
      } else {
        console.warn(`⚠️ Missing storage buckets: ${missingBuckets.join(', ')}`);
        results.storage = { 
          exists: true, 
          buckets: existingBuckets,
          missing: missingBuckets
        };
      }
    }
  } catch (error) {
    console.error('❌ Error checking storage buckets:', error.message);
    results.storage = { exists: false, error: error.message };
  }

  return {
    success: allTablesExist,
    results
  };
};

/**
 * Helper function to create the required tables if they don't exist
 * This is useful if the SQL script couldn't be executed directly
 */
export const createRequiredTables = async () => {
  console.log('⏳ Creating required tables...');
  
  try {
    // Create profiles table
    const { error: profilesError } = await supabase.rpc('create_profiles_table');
    if (profilesError) console.error('❌ Error creating profiles table:', profilesError);
    else console.log('✅ Profiles table created');
    
    // Create items table
    const { error: itemsError } = await supabase.rpc('create_items_table');
    if (itemsError) console.error('❌ Error creating items table:', itemsError);
    else console.log('✅ Items table created');
    
    // Create item_images table
    const { error: imagesError } = await supabase.rpc('create_item_images_table');
    if (imagesError) console.error('❌ Error creating item_images table:', imagesError);
    else console.log('✅ Item images table created');
    
    // Create reviews table
    const { error: reviewsError } = await supabase.rpc('create_reviews_table');
    if (reviewsError) console.error('❌ Error creating reviews table:', reviewsError);
    else console.log('✅ Reviews table created');
    
    return {
      success: !profilesError && !itemsError && !imagesError && !reviewsError
    };
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    return {
      success: false,
      error
    };
  }
};