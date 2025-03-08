import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getProfileById } from '../../lib/profileApi';
import { getUserItems } from '../../lib/itemApi';
import { getReviewsForUser } from '../../lib/reviewApi';
import ProfileEdit from './ProfileEdit';

export default function ProfileView({ userId, isOwnProfile = false }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // If no userId provided and it's the user's own profile, use the logged in user's ID
  const profileId = userId || (isOwnProfile ? user?.id : null);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      setError('No user ID provided');
      return;
    }

    async function loadProfileData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch profile data
        const profileResult = await getProfileById(profileId);
        if (!profileResult.success) {
          throw new Error(profileResult.error?.message || 'Failed to load profile');
        }
        setProfile(profileResult.data);
        
        // Fetch user's items
        const itemsResult = await getUserItems(profileId);
        if (!itemsResult.success) {
          throw new Error(itemsResult.error?.message || 'Failed to load items');
        }
        setUserItems(itemsResult.data || []);
        
        // Fetch user's reviews
        const reviewsResult = await getReviewsForUser(profileId);
        if (!reviewsResult.success) {
          throw new Error(reviewsResult.error?.message || 'Failed to load reviews');
        }
        setUserReviews(reviewsResult.data || []);
        
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfileData();
  }, [profileId]);
  
  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };
  
  if (loading) return <div className="loading">Loading profile data...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return <div className="not-found">Profile not found</div>;
  
  return (
    <div className="profile-view">
      {isEditing && isOwnProfile ? (
        <ProfileEdit 
          profile={profile} 
          onUpdate={handleProfileUpdate} 
          onCancel={() => setIsEditing(false)} 
        />
      ) : (
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-image">
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt={profile.name} />
              ) : (
                <div className="profile-image-placeholder">
                  {profile.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <h2>{profile.name}</h2>
              {profile.rating_average > 0 && (
                <div className="rating">
                  <span className="stars">{'★'.repeat(Math.round(profile.rating_average))}</span>
                  <span className="rating-value">({profile.rating_average.toFixed(1)})</span>
                </div>
              )}
              {profile.city && <p className="location">{profile.city}</p>}
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          
          {profile.bio && (
            <div className="profile-bio">
              <h3>About</h3>
              <p>{profile.bio}</p>
            </div>
          )}
          
          <div className="profile-details">
            {profile.height && (
              <div className="detail-item">
                <span className="detail-label">Height:</span>
                <span className="detail-value">{profile.height} cm</span>
              </div>
            )}
            
            {profile.size && (
              <div className="detail-item">
                <span className="detail-label">Size:</span>
                <span className="detail-value">{profile.size}</span>
              </div>
            )}
            
            {profile.contact_number && isOwnProfile && (
              <div className="detail-item">
                <span className="detail-label">Contact Number:</span>
                <span className="detail-value">{profile.contact_number}</span>
              </div>
            )}
          </div>
          
          {userItems.length > 0 && (
            <div className="profile-items">
              <h3>Items for Sale ({userItems.length})</h3>
              <div className="items-grid">
                {userItems.map(item => (
                  <div key={item.id} className="item-card-small">
                    <div className="item-image">
                      {item.images?.[0]?.image_url ? (
                        <img src={item.images[0].image_url} alt={item.title} />
                      ) : (
                        <div className="item-image-placeholder">No image</div>
                      )}
                    </div>
                    <div className="item-info">
                      <h4>{item.title}</h4>
                      <p className="item-price">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {userReviews.length > 0 && (
            <div className="profile-reviews">
              <h3>Reviews ({userReviews.length})</h3>
              <div className="reviews-list">
                {userReviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        {review.reviewer?.profile_picture ? (
                          <img src={review.reviewer.profile_picture} alt={review.reviewer.name} />
                        ) : (
                          <div className="reviewer-image-placeholder">
                            {review.reviewer?.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <span className="reviewer-name">{review.reviewer?.name}</span>
                      </div>
                      <div className="review-rating">
                        {'★'.repeat(review.rating)}
                      </div>
                    </div>
                    <div className="review-comment">
                      {review.comment}
                    </div>
                    <div className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}