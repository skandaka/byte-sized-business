/**
 * Random Discovery Page
 * Full-screen, swipeable business discovery (like Tinder for local businesses)
 * Excludes visited and favorited businesses for fresh discoveries
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
  const [slotMachineActive, setSlotMachineActive] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location } = useBusiness();

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
        radius: 10,
      };

      // Fetch businesses from current location or default
      const filters = {
        lat: location?.lat || defaultLocation.lat,
        lng: location?.lng || defaultLocation.lng,
        radius: location?.radius || defaultLocation.radius,
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
    visited.push(businessId);
    localStorage.setItem('visitedBusinesses', JSON.stringify(visited));
  };

  const handleSwipeLeft = () => {
    // Skip / Not interested
    setSwipeDirection('left');

    setTimeout(() => {
      if (currentBusiness) {
        markAsVisited(currentBusiness.id);
      }
      nextBusiness();
    }, 300);
  };

  const handleSwipeRight = async () => {
    // Like / Save to favorites
    setSwipeDirection('right');

    setTimeout(async () => {
      if (currentBusiness) {
        markAsVisited(currentBusiness.id);

        // Add to favorites if user is logged in
        if (user) {
          try {
            await addFavorite(currentBusiness.id);
          } catch (error) {
            console.error('Error adding favorite:', error);
          }
        }
      }
      nextBusiness();
    }, 300);
  };

  const handleViewDetails = () => {
    if (currentBusiness) {
      navigate(`/business/${currentBusiness.id}`);
    }
  };

  const nextBusiness = () => {
    setSwipeDirection(null);
    setDragOffset(0);

    // Trigger slot machine animation
    setSlotMachineActive(true);

    setTimeout(() => {
      if (currentIndex < businesses.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more businesses - refresh
        fetchRandomBusinesses();
      }

      // End animation
      setTimeout(() => {
        setSlotMachineActive(false);
      }, 100);
    }, 800); // Slot machine spins for 800ms
  };

  // Touch/Mouse drag handlers
  const handleDragStart = (e) => {
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDrag = (e) => {
    if (dragStart === null) return;

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const offset = clientX - dragStart;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
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

  const currentBusiness = businesses[currentIndex];

  if (loading) {
    return (
      <div className="random-discovery-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Finding amazing local businesses...</p>
        </div>
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="random-discovery-page">
        <div className="empty-state">
          <h2>🎉 You've discovered them all!</h2>
          <p>No more businesses in your area. Try expanding your search radius.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Only apply drag transform when NOT animating slot machine
  const cardStyle = slotMachineActive ? {} : {
    transform: `translateX(${dragOffset}px) rotate(${dragOffset / 20}deg)`,
    transition: dragStart !== null ? 'none' : 'transform 0.3s ease',
    opacity: swipeDirection ? 0 : 1,
  };

  const overlayOpacity = Math.min(Math.abs(dragOffset) / 150, 1);

  return (
    <div className="random-discovery-page">
      {/* Header */}
      <div className="discovery-header">
        <button onClick={() => navigate('/')} className="btn-icon">
          ←
        </button>
        <h2>Discover Local</h2>
        <div className="discovery-counter">
          {currentIndex + 1} / {businesses.length}
        </div>
      </div>

      {/* Business Card */}
      <div
        ref={cardRef}
        className={`discovery-card ${slotMachineActive ? 'slot-machine-spin' : ''}`}
        style={cardStyle}
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
            <span className="swipe-label">❤️ LIKE</span>
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
              <div className="rating">
                <span>⭐ {currentBusiness.averageRating.toFixed(1)}</span>
                {currentBusiness.reviewCount > 0 && (
                  <span className="review-count">({currentBusiness.reviewCount})</span>
                )}
              </div>
            )}

            {currentBusiness.distance && (
              <div className="distance">
                📍 {currentBusiness.distance.toFixed(1)} mi away
              </div>
            )}
          </div>

          <p className="description">{currentBusiness.description}</p>

          <button onClick={handleViewDetails} className="btn-details">
            View Full Details →
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="discovery-actions">
        <button
          onClick={handleSwipeLeft}
          className="btn-action btn-skip"
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
          title="Like (Save to favorites)"
        >
          ❤️
        </button>
      </div>

      <style>{`
        .random-discovery-page {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1000;
        }

        .discovery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .discovery-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .discovery-counter {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .btn-icon {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-primary);
          padding: 0.5rem;
        }

        .discovery-card {
          flex: 1;
          margin: 2rem auto;
          max-width: 500px;
          width: calc(100% - 4rem);
          background: var(--bg-secondary);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          cursor: grab;
          user-select: none;
          position: relative;
        }

        .discovery-card:active {
          cursor: grabbing;
        }

        .discovery-card.slot-machine-spin {
          animation: slotMachineSpin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes slotMachineSpin {
          0% {
            transform: translateY(-150%) rotateX(90deg) scale(0.5);
            opacity: 0;
          }
          25% {
            transform: translateY(-75%) rotateX(45deg) scale(0.7);
            opacity: 0.5;
          }
          50% {
            transform: translateY(30%) rotateX(-20deg) scale(1.1);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-10%) rotateX(10deg) scale(1.05);
            opacity: 0.95;
          }
          100% {
            transform: translateY(0) rotateX(0) scale(1);
            opacity: 1;
          }
        }

        .discovery-image {
          width: 100%;
          height: 50%;
          background: var(--bg-tertiary);
          position: relative;
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
        }

        .swipe-overlay.swipe-right {
          background: rgba(76, 175, 80, 0.3);
        }

        .swipe-overlay.swipe-left {
          background: rgba(244, 67, 54, 0.3);
        }

        .swipe-label {
          font-size: 3rem;
          font-weight: 900;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .discovery-info {
          padding: 1.5rem;
          height: 50%;
          overflow-y: auto;
        }

        .discovery-main h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          color: var(--text-primary);
        }

        .category-badge {
          display: inline-block;
          background: var(--primary-color);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .discovery-meta {
          display: flex;
          gap: 1.5rem;
          margin: 1rem 0;
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .rating, .distance {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .description {
          color: var(--text-primary);
          line-height: 1.6;
          margin: 1rem 0;
        }

        .btn-details {
          width: 100%;
          padding: 0.75rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-details:hover {
          background: var(--primary-dark);
        }

        .discovery-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
        }

        .btn-action {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .btn-action:hover {
          transform: scale(1.1);
        }

        .btn-skip {
          background: #f44336;
          color: white;
        }

        .btn-info {
          background: #2196f3;
          color: white;
        }

        .btn-like {
          background: #4caf50;
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

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .discovery-card {
            margin: 1rem auto;
            width: calc(100% - 2rem);
          }

          .discovery-actions {
            padding: 1rem;
            gap: 1rem;
          }

          .btn-action {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
}

export default RandomDiscoveryPage;
