/**
 * Review Form Component
 * Form for submitting reviews with star rating and verification (Required Feature #2)
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createReview } from '../utils/api';
import StarRating from './StarRating';
import VerificationModal from './VerificationModal';

function ReviewForm({ businessId, onReviewSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to write a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.length > 500) {
      setError('Review must be 500 characters or less');
      return;
    }

    // Show verification modal
    setShowVerification(true);
  };

  const handleVerificationSuccess = async () => {
    setLoading(true);
    setError('');

    try {
      const reviewData = {
        businessId,
        userId: user.id,
        username: user.username,
        rating,
        comment,
        verificationToken: 'verified_' + Date.now(), // Simple token
      };

      await createReview(reviewData);

      // Reset form
      setRating(0);
      setComment('');
      setVerificationToken('');

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      alert('Review submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card p-3 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>
          Please log in to write a review
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card p-3">
        <h3 className="mb-3">Write a Review</h3>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error-red)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--error-red)',
              marginBottom: '1rem',
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-3">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Your Rating <span style={{ color: 'var(--error-red)' }}>*</span>
            </label>
            <StarRating rating={rating} onChange={setRating} size="large" />
            {rating > 0 && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                You selected {rating} star{rating !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-3">
            <label htmlFor="review-comment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Your Review <span style={{ color: 'var(--error-red)' }}>*</span>
            </label>
            <textarea
              id="review-comment"
              className="textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              required
              maxLength={500}
              style={{ minHeight: '120px' }}
            />
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)', textAlign: 'right' }}>
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>

          <p className="text-sm mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
            You'll need to complete a quick verification before posting
          </p>
        </form>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerificationSuccess}
      />
    </>
  );
}

export default ReviewForm;
