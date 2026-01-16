/**
 * Random Discovery Page
 * Full-screen, swipeable business discovery (like Tinder for local businesses)
 * Smooth card transitions with working favorites
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBusinesses, addFavorite } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';
import SafeImage from '../components/SafeImage';

function RandomDiscoveryPage() {
  const [businesses, setBusinesses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, fetchFavorites } = useBusiness();

  useEffect(() => {
    fetchRandomBusinesses();
  }, [location]);

  const fetchRandomBusinesses = async () => {
    try {
      setLoading(true);

      // Use Chicago as default if no location set
      const defaultLocation = {
        lat: 41.8781,
        lng: -87.6298,
      };

      // Fetch businesses - use 10 mile default radius
      const filters = {
        lat: location?.lat || defaultLocation.lat,
        lng: location?.lng || defaultLocation.lng,
        radius: 10,
      };

      const data = await getBusinesses(filters);

      // Shuffle businesses for random order
      const shuffled = data.sort(() => Math.random() - 0.5);

      // Filter out visited businesses (stored in localStorage)
      const visited = JSON.parse(localStorage.getItem('visitedBusinesses') || '[]');
      const unvisited = shuffled.filter(b => !visited.includes(b.id));

      setBusinesses(unvisited);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsVisited = (businessId) => {
    const visited = JSON.parse(localStorage.getItem('visitedBusinesses') || '[]');
    if (!visited.includes(businessId)) {
      visited.push(businessId);
      localStorage.setItem('visitedBusinesses', JSON.stringify(visited));
    }
  };

  const handleSwipeLeft = () => {
    if (isTransitioning) return;
    setSwipeDirection('left');
    setIsTransitioning(true);

    setTimeout(() => {
      if (currentBusiness) {
        markAsVisited(currentBusiness.id);
      }
      nextBusiness();
    }, 400);
  };

  const handleSwipeRight = async () => {
    if (isTransitioning) return;
    setSwipeDirection('right');
    setIsTransitioning(true);

    if (currentBusiness) {
      markAsVisited(currentBusiness.id);

      // Add to favorites if user is logged in
      if (user) {
        try {
          await addFavorite(user.id, currentBusiness.id);
          // Refresh favorites in context
          if (fetchFavorites) {
            fetchFavorites();
          }
          // Show toast
          setShowFavoriteToast(true);
          setTimeout(() => setShowFavoriteToast(false), 2000);
        } catch (error) {
          console.error('Error adding favorite:', error);
        }
      } else {
        // Show login prompt
        alert('Please log in to save favorites!');
      }
    }

    setTimeout(() => {
      nextBusiness();
    }, 400);
  };

  const handleViewDetails = () => {
    if (currentBusiness) {
      navigate(`/business/${currentBusiness.id}`);
    }
  };

  const nextBusiness = () => {
    setSwipeDirection(null);
    setDragOffset(0);
    setIsTransitioning(false);

    if (currentIndex < businesses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more businesses - refresh
      fetchRandomBusinesses();
    }
  };

  // Touch/Mouse drag handlers
  const handleDragStart = (e) => {
    if (isTransitioning) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDrag = (e) => {
    if (dragStart === null || isTransitioning) return;

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const offset = clientX - dragStart;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (isTransitioning) return;
    
    if (Math.abs(dragOffset) > 100) {
      // Swipe threshold: 100px
      if (dragOffset > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else {
      // Snap back
      setDragOffset(0);
    }
    setDragStart(null);
  };

  const clearVisitedHistory = () => {
    localStorage.removeItem('visitedBusinesses');
    fetchRandomBusinesses();
  };

  const currentBusiness = businesses[currentIndex];

  if (loading) {
    return (
      <div className="random-discovery-page">
        <div className="loading-container">
          <div className="loading-pulse">
            <div className="pulse-ring"></div>
            <div className="pulse-dot"></div>
          </div>
          <p>Finding amazing local businesses...</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="random-discovery-page">
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h2>You've discovered them all!</h2>
          <p>No more businesses to discover in this area.</p>
          <div className="empty-actions">
            <button onClick={clearVisitedHistory} className="btn btn-primary">
              🔄 Start Fresh
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              ← Back to Home
            </button>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Card transform based on drag
  const getCardStyle = () => {
    if (swipeDirection === 'left') {
      return {
        transform: 'translateX(-150%) rotate(-30deg)',
        opacity: 0,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }
    if (swipeDirection === 'right') {
      return {
        transform: 'translateX(150%) rotate(30deg)',
        opacity: 0,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }
    return {
      transform: `translateX(${dragOffset}px) rotate(${dragOffset / 25}deg)`,
      transition: dragStart !== null ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  const overlayOpacity = Math.min(Math.abs(dragOffset) / 150, 1);

  return (
    <div className="random-discovery-page">
      {/* Favorite Toast */}
      {showFavoriteToast && (
        <div className="favorite-toast">
          ❤️ Added to favorites!
        </div>
      )}

      {/* Header */}
      <div className="discovery-header">
        <button onClick={() => navigate('/')} className="btn-icon" aria-label="Go back">
          ←
        </button>
        <h2>Discover Local</h2>
        <div className="discovery-counter">
          {currentIndex + 1} / {businesses.length}
        </div>
      </div>

      {/* Business Card */}
      <div className="card-container">
        <div
          ref={cardRef}
          className="discovery-card"
          style={getCardStyle()}
          onMouseDown={handleDragStart}
          onMouseMove={handleDrag}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDrag}
          onTouchEnd={handleDragEnd}
        >
          {/* Swipe Overlays */}
          {dragOffset > 0 && (
            <div className="swipe-overlay swipe-right" style={{ opacity: overlayOpacity }}>
              <span className="swipe-label">❤️ SAVE</span>
            </div>
          )}
          {dragOffset < 0 && (
            <div className="swipe-overlay swipe-left" style={{ opacity: overlayOpacity }}>
              <span className="swipe-label">👎 SKIP</span>
            </div>
          )}

          {/* Business Image */}
          <div className="discovery-image">
            <SafeImage
              src={currentBusiness.image_url}
              alt={currentBusiness.name}
              category={currentBusiness.category}
              businessName={currentBusiness.name}
              height="100%"
              style={{ width: '100%' }}
            />
          </div>

          {/* Business Info */}
          <div className="discovery-info">
            <div className="discovery-main">
              <h1>{currentBusiness.name}</h1>
              <p className="category-badge">{currentBusiness.category}</p>
            </div>

            <div className="discovery-meta">
              {currentBusiness.averageRating > 0 && (
                <a 
                  href={currentBusiness.external_id ? `https://www.google.com/maps/place/?q=place_id:${currentBusiness.external_id}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rating-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="rating">
                    ⭐ {currentBusiness.averageRating.toFixed(1)}
                    {currentBusiness.reviewCount > 0 && (
                      <span className="review-count">({currentBusiness.reviewCount})</span>
                    )}
                  </span>
                </a>
              )}

              {currentBusiness.distance && (
                <div className="distance">
                  📍 {currentBusiness.distance.toFixed(1)} mi
                </div>
              )}
            </div>

            <p className="description">
              {currentBusiness.description?.substring(0, 150)}
              {currentBusiness.description?.length > 150 ? '...' : ''}
            </p>

            <button onClick={handleViewDetails} className="btn-details">
              View Full Details →
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="discovery-actions">
        <button
          onClick={handleSwipeLeft}
          className="btn-action btn-skip"
          disabled={isTransitioning}
          title="Skip (Not interested)"
        >
          ✕
        </button>

        <button
          onClick={handleViewDetails}
          className="btn-action btn-info"
          title="View Details"
        >
          ℹ️
        </button>

        <button
          onClick={handleSwipeRight}
          className="btn-action btn-like"
          disabled={isTransitioning}
          title="Like (Save to favorites)"
        >
          ❤️
        </button>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .random-discovery-page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1000;
  }

  .favorite-toast {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--success-green);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-weight: 600;
    z-index: 1001;
    animation: toastSlide 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  @keyframes toastSlide {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .discovery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }

  .discovery-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
    font-weight: 700;
  }

  .discovery-counter {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .btn-icon {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-primary);
    padding: 0.5rem;
    transition: transform 0.2s;
  }

  .btn-icon:hover {
    transform: scale(1.1);
  }

  .card-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    perspective: 1000px;
  }

  .discovery-card {
    width: 100%;
    max-width: 420px;
    height: calc(100% - 2rem);
    max-height: 600px;
    background: var(--bg-secondary);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    cursor: grab;
    user-select: none;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .discovery-card:active {
    cursor: grabbing;
  }

  .discovery-image {
    width: 100%;
    height: 55%;
    background: var(--bg-tertiary);
    position: relative;
    overflow: hidden;
  }

  .swipe-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 10;
    backdrop-filter: blur(2px);
  }

  .swipe-overlay.swipe-right {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(76, 175, 80, 0.2) 100%);
  }

  .swipe-overlay.swipe-left {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(244, 67, 54, 0.2) 100%);
  }

  .swipe-label {
    font-size: 2.5rem;
    font-weight: 900;
    color: white;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    letter-spacing: 2px;
  }

  .discovery-info {
    padding: 1.25rem;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .discovery-main h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: var(--text-primary);
    font-weight: 700;
    line-height: 1.2;
  }

  .category-badge {
    display: inline-block;
    background: var(--primary-blue);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    margin: 0;
  }

  .discovery-meta {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .rating-link {
    text-decoration: none;
    color: inherit;
    transition: color 0.2s;
  }

  .rating-link:hover {
    color: var(--primary-blue);
  }

  .rating, .distance {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .review-count {
    opacity: 0.7;
  }

  .description {
    color: var(--text-primary);
    line-height: 1.5;
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    flex: 1;
  }

  .btn-details {
    width: 100%;
    padding: 0.875rem;
    background: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.95rem;
  }

  .btn-details:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }

  .discovery-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
  }

  .btn-action {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-action:hover:not(:disabled) {
    transform: scale(1.15);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .btn-action:active:not(:disabled) {
    transform: scale(0.95);
  }

  .btn-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-skip {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    color: white;
  }

  .btn-info {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    color: white;
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }

  .btn-like {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    color: white;
  }

  .loading-container, .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2rem;
  }

  .loading-pulse {
    position: relative;
    width: 60px;
    height: 60px;
    margin-bottom: 1.5rem;
  }

  .pulse-ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 3px solid var(--primary-blue);
    border-radius: 50%;
    animation: pulse-ring 1.5s ease-out infinite;
  }

  .pulse-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    background: var(--primary-blue);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse-dot 1.5s ease-out infinite;
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.5);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  @keyframes pulse-dot {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 1s ease infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .empty-state h2 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .empty-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .discovery-card {
      max-height: none;
      height: calc(100% - 1rem);
    }

    .discovery-actions {
      padding: 1rem;
      gap: 1rem;
    }

    .btn-action {
      width: 56px;
      height: 56px;
    }

    .btn-info {
      width: 48px;
      height: 48px;
    }
  }
`;

export default RandomDiscoveryPage;
