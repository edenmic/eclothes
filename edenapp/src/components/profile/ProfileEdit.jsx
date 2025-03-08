import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfileWithImage } from '../../lib/profileApi';
import compressImage from 'browser-image-compression';

export default function ProfileEdit({ profile, onUpdate, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    city: profile?.city || '',
    bio: profile?.bio || '',
    contact_number: profile?.contact_number || '',
    height: profile?.height || '',
    size: profile?.size || '',
    profile_picture: profile?.profile_picture || ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(profile?.profile_picture || null);
  const fileInputRef = useRef(null);
  
  // Size options for the dropdown
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Show preview of selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Store the file for later upload
      // The actual upload will happen when the form is submitted
      setFormData(prev => ({ ...prev, imageFile: file }));
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process the image. Please try another one.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Make sure user is logged in and it's their own profile
      if (!user || user.id !== profile.id) {
        throw new Error('You are not authorized to update this profile');
      }
      
      let imageToUpload = null;
      
      // If we have a new image, compress it before upload
      if (formData.imageFile) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true
        };
        
        imageToUpload = await compressImage(formData.imageFile, options);
      }
      
      // Prepare profile data for update
      const profileData = {
        name: formData.name,
        city: formData.city,
        bio: formData.bio,
        contact_number: formData.contact_number,
        height: formData.height ? parseFloat(formData.height) : null,
        size: formData.size,
        // Only include profile_picture if we're not uploading a new image
        // (otherwise updateProfileWithImage will handle it)
        profile_picture: !imageToUpload ? formData.profile_picture : undefined
      };
      
      // Update the profile
      const result = await updateProfileWithImage(user.id, profileData, imageToUpload);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update profile');
      }
      
      // Call onUpdate with updated profile data
      onUpdate({ ...profile, ...profileData, profile_picture: previewImage });
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit">
      <h2>Edit Profile</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="profile-image-edit">
          <div className="profile-image-preview">
            {previewImage ? (
              <img src={previewImage} alt="Profile preview" />
            ) : (
              <div className="profile-image-placeholder">
                {formData.name.charAt(0) || "U"}
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current.click()}
            className="btn btn-secondary"
          >
            Choose Image
          </button>
        </div>
        
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="bio">About Me</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contact_number">Contact Number</label>
          <input
            type="tel"
            id="contact_number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="height">Height (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleChange}
            min="100"
            max="250"
            step="0.5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="size">Size</label>
          <select
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
          >
            <option value="">Select a size</option>
            {sizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}