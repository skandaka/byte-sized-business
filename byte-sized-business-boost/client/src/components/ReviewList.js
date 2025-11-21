/**
 * Review List Component
 * Displays all reviews for a business with sorting options
 */

import React from 'react';
import StarRating from './StarRating';

function ReviewList({ reviews, onSort }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="card p-4 text-center">
        <h3>No Reviews Yet</h3>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Be the first to review this business!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Options */}
      <div className="flex justify-between items-center mb-3">
        <h3>{reviews.length} Review{reviews.length !== 1 ? 's' : ''}</h3>
        {onSort && (
          <div>
            <label htmlFor="review-sort" className="text-sm" style={{ marginRight: '0.5rem' }}>
              Sort by:
            </label>
            <select
              id="review-sort"
              className="input"
              style={{ width: 'auto', display: 'inline-block' }}
              onChange={(e) => onSort(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {reviews.map((review) => (
          <div key={review.id} className="card p-3">
            {/* Review Header */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <strong>{review.username}</strong>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <StarRating rating={review.rating} readonly size="small" />
              </div>
            </div>

            {/* Review Comment */}
            <p style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>{review.comment}</p>

            {/* Helpful Count */}
            {review.helpful_count > 0 && (
              <div className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                👍 {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewList;
