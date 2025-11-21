/**
 * Star Rating Component
 * Interactive star rating selector (1-5 stars)
 */

import React, { useState } from 'react';

function StarRating({ rating, onChange, readonly = false, size = 'medium' }) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    small: '1rem',
    medium: '1.5rem',
    large: '2rem',
  };

  const handleClick = (value) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.25rem',
        cursor: readonly ? 'default' : 'pointer',
      }}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          style={{
            fontSize: sizes[size],
            color: star <= displayRating ? 'var(--warning-yellow)' : 'var(--gray-300)',
            transition: 'color var(--transition-fast)',
          }}
          role="radio"
          aria-checked={star === rating}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          tabIndex={readonly ? -1 : 0}
          onKeyDown={(e) => {
            if (!readonly && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleClick(star);
            }
          }}
        >
          {star <= displayRating ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}

export default StarRating;
