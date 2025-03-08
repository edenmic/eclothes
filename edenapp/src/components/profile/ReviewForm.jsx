import { useState, useEffect } from 'react';
import { createReview, hasUserReviewed } from '../../lib/reviewApi';
import { Star } from 'lucide-react';

export default function ReviewForm({ revieweeId, reviewerId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if user has already reviewed this seller
  useEffect(() => {
    async function checkIfReviewed() {
      if (!reviewerId || !revieweeId) return;
      
      const response = await hasUserReviewed(reviewerId, revieweeId);
      if (response.success && response.hasReviewed) {
        setAlreadyReviewed(true);
      }
    }
    
    checkIfReviewed();
  }, [reviewerId, revieweeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please provide a comment');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const result = await createReview(reviewerId, revieweeId, rating, comment);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to submit review');
      }
      
      setSuccess(true);
      setComment('');
      setRating(0);
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyReviewed) {
    return (
      <div className="review-form">
        <p className="text-info">You've already reviewed this user.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="review-form">
        <p className="text-success">Your review has been submitted successfully!</p>
      </div>
    );
  }

  return (
    <div className="review-form">
      <h4>Leave a Review</h4>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="rating-input">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                fill={(hoverRating || rating) >= star ? '#FFD700' : 'transparent'}
                stroke={(hoverRating || rating) >= star ? '#FFD700' : '#666'}
                className="star-icon"
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
          <span className="rating-text">
            {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
          </span>
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience with this seller"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}