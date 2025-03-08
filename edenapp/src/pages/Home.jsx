import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, PlusCircle, Truck, Award, Heart, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getItems } from '../lib/itemApi';

export default function Home() {
  const { user } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch featured items on component mount
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        // Get the most recent items
        const result = await getItems(1, 6);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to load items');
        }
        
        setFeaturedItems(result.data || []);
      } catch (err) {
        console.error('Error loading featured items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedItems();
  }, []);
  
  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1>Find Stylish Second-Hand Clothing</h1>
            <p className="hero-tagline">
              Shop sustainably, save money, and express your unique style with pre-loved clothing from our community.
            </p>
            <div className="cta-buttons">
              <Link to="/items" className="btn btn-primary">
                <ShoppingBag /> Browse Items
              </Link>
              {user && (
                <Link to="/create-listing" className="btn btn-secondary">
                  <PlusCircle /> List an Item
                </Link>
              )}
            </div>
          </div>
          <div className="hero-image">
            {/* This would be replaced with an actual image in a real app */}
            <div className="placeholder-image">
              <img src="/hero-image.jpg" alt="Sustainable fashion" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Shop Second-Hand?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <Heart />
              </div>
              <h3>Eco-Friendly</h3>
              <p>Reduce waste and your carbon footprint by giving clothes a second life.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <Award />
              </div>
              <h3>Unique Style</h3>
              <p>Find one-of-a-kind pieces that help you stand out from the crowd.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <RefreshCw />
              </div>
              <h3>Circular Fashion</h3>
              <p>Be part of the solution by participating in the circular economy.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <Truck />
              </div>
              <h3>Local Community</h3>
              <p>Connect with sellers in your area and build a sustainable community.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Items Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recently Added</h2>
            <Link to="/items" className="view-all-link">View All</Link>
          </div>
          
          {loading ? (
            <div className="loading">Loading featured items...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : featuredItems.length > 0 ? (
            <div className="featured-items-grid">
              {featuredItems.map(item => (
                <Link to={`/items/${item.id}`} key={item.id} className="item-card">
                  <div className="item-image">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0].image_url} alt={item.title} />
                    ) : (
                      <div className="item-image-placeholder">No image</div>
                    )}
                  </div>
                  <div className="item-info">
                    <h3 className="item-title">{item.title}</h3>
                    <p className="item-price">${item.price}</p>
                    {item.size && <span className="item-size">{item.size}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-items">
              <p>No items found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Declutter Your Closet?</h2>
            <p>Give your clothes a second life and make some extra money by selling items you no longer wear.</p>
            {user ? (
              <Link to="/create-listing" className="btn btn-primary">
                <PlusCircle /> Create a Listing
              </Link>
            ) : (
              <Link to="/auth" className="btn btn-primary">
                Sign In to Get Started
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}