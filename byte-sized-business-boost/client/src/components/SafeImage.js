import React, { useState, useEffect } from 'react';
import { getBusinessImage, PLACEHOLDER_IMAGE } from '../utils/images';

/**
 * Simple, reliable image component with fallback
 */
function SafeImage({
  src,
  alt,
  category = 'Other',
  businessName = '',
  height = 200,
  width = '100%',
  className = '',
  style = {},
  imgStyle = {},
}) {
  // Use the source directly if it's a valid Google Places or https URL
  const getImageUrl = () => {
    if (src && typeof src === 'string') {
      const trimmed = src.trim();
      // Prioritize Google Places photos
      if (trimmed.includes('googleapis.com/maps/api/place/photo')) {
        return trimmed;
      }
      // Accept any https URL
      if (trimmed.startsWith('https://')) {
        return trimmed;
      }
    }
    // Fallback to category-based image
    return getBusinessImage(src, category, businessName || alt);
  };

  const imageUrl = getImageUrl();
  const fallbackUrl = getBusinessImage(null, category, businessName || alt);

  const [currentSrc, setCurrentSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  // Update image when props change
  useEffect(() => {
    const newUrl = getImageUrl();
    setCurrentSrc(newUrl);
    setHasError(false);
  }, [src, category, businessName, alt]);

  const handleError = () => {
    if (!hasError) {
      console.log('Image failed to load:', currentSrc?.substring(0, 100));
      setHasError(true);
      setCurrentSrc(fallbackUrl);
    }
  };

  const containerStyle = {
    width,
    height: typeof height === 'number' ? `${height}px` : height,
    overflow: 'hidden',
    background: '#e5e7eb',
    borderRadius: 'var(--radius-md)',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onError={handleError}
        referrerPolicy="no-referrer"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...imgStyle,
        }}
      />
    </div>
  );
}

export default SafeImage;
