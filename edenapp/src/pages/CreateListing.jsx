import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { createItem, uploadItemImageWithDb } from '../lib/itemApi';
import browserImageCompression from 'browser-image-compression';
import { X, Upload, Plus } from 'lucide-react';

// Validation schema
const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  size: z.string().optional(),
  brand: z.string().optional(),
  condition: z.string().min(1, 'Condition is required'),
  color: z.string().optional(),
  location: z.string().optional(),
});

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Shoes', 'Other'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const conditions = ['New with tags', 'Like new', 'Good', 'Fair', 'Poor'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Grey', 'Brown', 'Multi'];
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      category: '',
      size: '',
      brand: '',
      condition: '',
      color: '',
      location: '',
    }
  });

  // Handle image selection
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > 0) {
      // Limit to 5 images
      const newImages = [...images, ...selectedFiles].slice(0, 5);
      setImages(newImages);
      
      // Generate previews
      const newPreviewImages = newImages.map(file => {
        return {
          file,
          preview: URL.createObjectURL(file)
        };
      });
      
      setPreviewImages(newPreviewImages);
    }
  };

  // Remove an image from the selection
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviewImages = [...previewImages];
    URL.revokeObjectURL(newPreviewImages[index].preview); // Clean up the URL
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
  };

  // Upload multiple images for an item
  const uploadImages = async (itemId) => {
    if (images.length === 0) return [];
    
    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true
    };
    
    try {
      const uploadPromises = images.map(async (file) => {
        const compressedFile = await browserImageCompression(file, compressionOptions);
        const result = await uploadItemImageWithDb(itemId, user.id, compressedFile);
        
        if (!result.success) {
          throw new Error(`Failed to upload image: ${result.error?.message}`);
        }
        
        return result.imageUrl;
      });
      
      return await Promise.all(uploadPromises);
    } catch (err) {
      console.error('Error uploading images:', err);
      throw err;
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    try {
      setError(null);
      setUploading(true);
      
      // Create the item first
      const createResult = await createItem(user.id, data);
      
      if (!createResult.success) {
        throw new Error(createResult.error?.message || 'Failed to create item');
      }
      
      const itemId = createResult.data.id;
      
      // Upload images if any
      if (images.length > 0) {
        await uploadImages(itemId);
      }
      
      // Navigate to the new item
      navigate(`/items/${itemId}`);
      
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page create-listing-page">
      <div className="container">
        <h1>Create New Listing</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="create-listing-form">
          <div className="form-section">
            <h2>Item Details</h2>
            
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                {...register('title')}
                placeholder="What are you selling?"
              />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder="Describe your item - include details about condition, features, etc."
              />
              {errors.description && <span className="form-error">{errors.description.message}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($) *</label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.price && <span className="form-error">{errors.price.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select id="category" {...register('category')}>
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <span className="form-error">{errors.category.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="size">Size</label>
                <select id="size" {...register('size')}>
                  <option value="">Select a size</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  {...register('brand')}
                  placeholder="Brand name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="condition">Condition *</label>
                <select id="condition" {...register('condition')}>
                  <option value="">Select condition</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
                {errors.condition && <span className="form-error">{errors.condition.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="color">Color</label>
                <select id="color" {...register('color')}>
                  <option value="">Select a color</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                {...register('location')}
                placeholder="City, Neighborhood, etc."
              />
            </div>
          </div>
          
          <div className="form-section">
            <h2>Item Images</h2>
            <p className="help-text">Upload up to 5 images of your item. First image will be the main one.</p>
            
            <div className="image-upload-area">
              {previewImages.length > 0 && (
                <div className="image-previews">
                  {previewImages.map((image, index) => (
                    <div className="image-preview-item" key={index}>
                      <img src={image.preview} alt={`Preview ${index + 1}`} />
                      <button 
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                      >
                        <X size={16} />
                      </button>
                      {index === 0 && <div className="main-image-badge">Main</div>}
                    </div>
                  ))}
                </div>
              )}
              
              {previewImages.length < 5 && (
                <div className="upload-button-container">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary upload-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Upload size={18} />
                    {previewImages.length === 0 ? 'Upload Images' : 'Add More Images'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/items')}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading}
            >
              {uploading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}