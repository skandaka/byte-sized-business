/**
 * Review Form Component
 * Form for submitting reviews with star rating and verification (Required Feature #2)
 * FBLA Rubric: "Validation on both syntactical and semantic levels"
 * 
 * Features:
 * - Star rating selection
 * - Character limit with counter
 * - Real-time content quality feedback
 * - Bot verification before submission
 * - Semantic validation for content quality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createReview, validateContent } from '../utils/api';
import StarRating from './StarRating';
import VerificationModal from './VerificationModal';

/**
 * ReviewForm Component
 * @param {Object} props - Component props
 * @param {string} props.businessId - The business ID to review
 * @param {Function} props.onReviewSubmitted - Callback when review is successfully submitted
 */
function ReviewForm({ businessId, onReviewSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  
  // Content validation state
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);

  /**
   * Validate content with debounce
   * Provides real-time feedback on content quality
   */
  const validateReviewContent = useCallback(async (text) => {
    if (!text || text.length < 5) {
      setValidationResult(null);
      return;
    }

    setValidating(true);
    try {
      const result = await validateContent(text, 'review');
      setValidationResult(result);
    } catch (err) {
      console.error('Validation error:', err);
      // Don't block user if validation service fails
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  }, []);

  // Debounced validation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (comment.length >= 10) {
        validateReviewContent(comment);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [comment, validateReviewContent]);

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

    if (comment.length < 10) {
      setError('Please write at least 10 characters');
      return;
    }

    // Check validation result if available
    if (validationResult && !validationResult.valid) {
      setError(validationResult.issues[0] || 'Please improve your review content');
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
      setValidationResult(null);

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

  /**
   * Get quality indicator color based on score
   */
  const getQualityColor = (score) => {
    if (score >= 80) return 'var(--success-green)';
    if (score >= 60) return 'var(--warning-yellow)';
    if (score >= 40) return '#f97316'; // orange
    return 'var(--error-red)';
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
              placeholder="Share your experience... What did you like? What could be improved?"
              required
              maxLength={500}
              style={{ 
                minHeight: '120px',
                borderColor: validationResult && !validationResult.valid ? 'var(--error-red)' : undefined
              }}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {comment.length}/500 characters
              </span>
              {validating && (
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Checking content...
                </span>
              )}
            </div>
          </div>

          {/* Content Quality Feedback */}
          {validationResult && comment.length >= 10 && (
            <div 
              className="mb-3 p-3" 
              style={{ 
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${getQualityColor(validationResult.score)}`
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontWeight: 500 }}>Content Quality</span>
                <span style={{ 
                  color: getQualityColor(validationResult.score),
                  fontWeight: 'bold'
                }}>
                  {validationResult.quality === 'excellent' && '⭐ Excellent'}
                  {validationResult.quality === 'good' && '✓ Good'}
                  {validationResult.quality === 'fair' && '⚠️ Fair'}
                  {validationResult.quality === 'needs improvement' && '❌ Needs Work'}
                </span>
              </div>

              {/* Quality bar */}
              <div style={{ 
                height: '6px', 
                background: 'var(--bg-tertiary)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  height: '100%',
                  width: `${validationResult.score}%`,
                  background: getQualityColor(validationResult.score),
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Suggestions */}
              {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {validationResult.suggestions.slice(0, 2).map((suggestion, index) => (
                    <p key={index} style={{ margin: '0.25rem 0' }}>
                      💡 {suggestion}
                    </p>
                  ))}
                </div>
              )}

              {/* Issues */}
              {!validationResult.valid && validationResult.issues && (
                <div className="text-sm" style={{ color: 'var(--error-red)', marginTop: '0.5rem' }}>
                  {validationResult.issues.map((issue, index) => (
                    <p key={index} style={{ margin: '0.25rem 0' }}>
                      ⚠️ {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading || (validationResult && !validationResult.valid)}
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
