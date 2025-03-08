import { initializeStorageBuckets } from './supabaseStorage';
import { supabase } from './supabase';
import { verifyDatabaseSetup } from './dbVerify';

/**
 * Initialize all necessary application components during startup
 * - Create Supabase storage buckets if they don't exist
 * - Set up any necessary listeners or event handlers
 * - Verify database tables are correctly set up
 */
export const initializeApp = async () => {
  try {
    console.log('Initializing application...');
    
    // Initialize storage buckets for profile and item images
    const storageResult = await initializeStorageBuckets();
    if (!storageResult.success) {
      console.error('Failed to initialize storage buckets:', storageResult.error);
    } else {
      console.log('Storage buckets initialized successfully');
    }

    // Verify database setup
    const dbVerification = await verifyDatabaseSetup();
    if (!dbVerification.success) {
      console.warn('Database verification failed. Some tables may be missing.');
      console.info('Please run the SQL script in the Supabase dashboard to create the necessary tables.');
    } else {
      console.log('Database verification successful. All tables exist.');
    }

    console.log('Application initialization complete');
    return { 
      success: true, 
      storageInitialized: storageResult.success,
      databaseVerified: dbVerification.success
    };
  } catch (error) {
    console.error('Error initializing application:', error);
    return { success: false, error };
  }
};

/**
 * Test the database connection and table access
 * Useful for verifying that the database is properly set up
 */
export const testDatabaseConnection = async () => {
  try {
    // Try to access the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (error) throw error;
    
    // Try to access the items table
    const { error: itemsError } = await supabase
      .from('items')
      .select('id')
      .limit(1);
      
    if (itemsError) throw itemsError;
    
    // Try to access the reviews table
    const { error: reviewsError } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);
      
    if (reviewsError) throw reviewsError;
    
    console.log('Database connection test successful');
    return { success: true };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { 
      success: false, 
      error,
      message: `Connection failed: ${error.message}. Make sure you've created all necessary tables in your Supabase project using the supabase_setup.sql script.`
    };
  }
};