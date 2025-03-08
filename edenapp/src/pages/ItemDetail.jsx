import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItemById } from '../lib/itemApi';
import { useAuth } from '../hooks/useAuth';
import { User, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchItemDetails() {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getItemById(id);
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to load item details');
        }
        setItem(result.data);
      } catch (err) {
        console.error('Error loading item details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleContactSeller = () => {
    // In a real app, this would open a messaging interface
    // For now, we'll just navigate to the seller's profile
    navigate(`/profile/${item.user.id}`);
  };

  if (loading) return <div className="loading">Loading item details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!item) return <div className="not-found">Item not found</div>;

  return (
    <div className="page item-detail-page">
      <div className="container">
        <div className="item-detail-wrapper">
          {/* Image Gallery */}
          <div className="item-gallery">
            {item.images && item.images.length > 0 ? (
              <>
                <div className="main-image-container">
                  <img 
                    src={item.images[currentImageIndex]?.image_url} 
                    alt={`${item.title} - Image ${currentImageIndex + 1}`} 
                    className="main-image"
                  />
                  
                  {item.images.length > 1 && (
                    <>
                      <button 
                        className="gallery-nav prev" 
                        onClick={handlePrevImage}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        className="gallery-nav next" 
                        onClick={handleNextImage}
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>
                
                {item.images.length > 1 && (
                  <div className="image-thumbnails">
                    {item.images.map((image, index) => (
                      <div 
                        key={image.id} 
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img src={image.image_url} alt={`${item.title} - Thumbnail ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="no-image">
                <div className="no-image-placeholder">No images available</div>
              </div>
            )}
          </div>
          
          {/* Item Details */}
          <div className="item-info-container">
            <h1 className="item-title">{item.title}</h1>
            <div className="item-price">${item.price}</div>
            
            {/* Seller Information */}
            <div className="seller-info">
              <Link to={`/profile/${item.user.id}`} className="seller-link">
                <div className="seller-avatar">
                  {item.user.profile_picture ? (
                    <img src={item.user.profile_picture} alt={item.user.name} />
                  ) : (
                    <div className="seller-avatar-placeholder">
                      <User size={18} />
                    </div>
                  )}
                </div>
                <div className="seller-details">
                  <div className="seller-name">{item.user.name}</div>
                  {item.user.rating_average > 0 && (
                    <div className="seller-rating">
                      <span className="stars">{'★'.repeat(Math.round(item.user.rating_average))}</span>
                      <span className="rating-value">({item.user.rating_average.toFixed(1)})</span>
                    </div>
                  )}
                  {item.user.city && <div className="seller-location">{item.user.city}</div>}
                </div>
              </Link>
              
              {user && user.id !== item.user.id && (
                <button 
                  className="btn btn-secondary contact-button"
                  onClick={handleContactSeller}
                >
                  <MessageSquare size={18} />
                  Contact Seller
                </button>
              )}
            </div>
            
            {/* Item Details */}
            <div className="item-details">
              <h2>Item Details</h2>
              
              <div className="details-grid">
                {item.category && (
                  <div className="detail-item">
                    <div className="detail-label">Category</div>
                    <div className="detail-value">{item.category}</div>
                  </div>
                )}
                
                {item.brand && (
                  <div className="detail-item">
                    <div className="detail-label">Brand</div>
                    <div className="detail-value">{item.brand}</div>
                  </div>
                )}
                
                {item.size && (
                  <div className="detail-item">
                    <div className="detail-label">Size</div>
                    <div className="detail-value">{item.size}</div>
                  </div>
                )}
                
                {item.condition && (
                  <div className="detail-item">
                    <div className="detail-label">Condition</div>
                    <div className="detail-value">{item.condition}</div>
                  </div>
                )}
                
                {item.color && (
                  <div className="detail-item">
                    <div className="detail-label">Color</div>
                    <div className="detail-value">{item.color}</div>
                  </div>
                )}
                
                {item.location && (
                  <div className="detail-item">
                    <div className="detail-label">Location</div>
                    <div className="detail-value">{item.location}</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            {item.description && (
              <div className="item-description">
                <h2>Description</h2>
                <p>{item.description}</p>
              </div>
            )}
            
            {/* Post Date */}
            <div className="item-posted">
              Posted on {new Date(item.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}