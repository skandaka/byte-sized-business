/**
 * Business Detail Page
 * Shows detailed information about a single business with reviews
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBusinessById, getReviews, addFavorite, removeFavorite, checkFavorite } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

function BusinessDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    fetchBusinessData();
    fetchReviews();
    if (user) {
      checkIfFavorited();
    }
  }, [id, user]);

  const fetchBusinessData = async () => {
    try {
      const data = await getBusinessById(id);
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await getReviews(id);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkIfFavorited = async () => {
    try {
      const result = await checkFavorite(user.id, id);
      setIsFavorited(result.isFavorited);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please log in to save favorites');
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite(user.id, id);
        setIsFavorited(false);
      } else {
        await addFavorite(user.id, id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
    fetchBusinessData();
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="mt-2">Loading business details...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mt-4 text-center">
        <h2>Business Not Found</h2>
        <p className="mt-2">The business you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary mt-3">
          Back to Home
        </Link>
      </div>
    );
  }

  const hours = typeof business.hours === 'string' ? JSON.parse(business.hours) : business.hours;

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <Link to="/" style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>
          ← Back to all businesses
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="card p-4 mb-3">
        <div className="flex" style={{ gap: '2rem', flexWrap: 'wrap' }}>
          {/* Business Image */}
          <div
            style={{
              width: '300px',
              height: '300px',
              background: `url(${business.image_url}) center/cover`,
              borderRadius: 'var(--radius-lg)',
              flexShrink: 0,
            }}
            role="img"
            aria-label={business.name}
          />

          {/* Business Info */}
          <div style={{ flex: 1 }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 style={{ marginBottom: '0.5rem' }}>{business.name}</h1>
                <span
                  style={{
                    display: 'inline-block',
                    background: 'var(--primary-blue)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                  }}
                >
                  {business.category}
                </span>
              </div>

              {/* Favorite Button */}
              <button
                onClick={handleFavoriteToggle}
                className="btn"
                style={{
                  background: isFavorited ? 'var(--error-red)' : 'var(--bg-tertiary)',
                  color: isFavorited ? 'white' : 'var(--text-primary)',
                  fontSize: '1.5rem',
                }}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={business.averageRating} readonly size="medium" />
              <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                {business.averageRating}
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>
                ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{business.description}</p>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{business.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <a href={`tel:${business.phone}`} style={{ color: 'var(--primary-blue)' }}>
                  {business.phone}
                </a>
              </div>
              {business.email && (
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <a href={`mailto:${business.email}`} style={{ color: 'var(--primary-blue)' }}>
                    {business.email}
                  </a>
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-2">
                  <span>🌐</span>
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary-blue)' }}
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="flex" style={{ borderBottom: '2px solid var(--border-color)', gap: '1rem' }}>
          <button
            onClick={() => setActiveTab('about')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'about' ? '3px solid var(--primary-blue)' : 'none',
              color: activeTab === 'about' ? 'var(--primary-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'about' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'reviews' ? '3px solid var(--primary-blue)' : 'none',
              color: activeTab === 'reviews' ? 'var(--primary-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'reviews' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            Reviews ({reviews.length})
          </button>
          {business.deals && business.deals.length > 0 && (
            <button
              onClick={() => setActiveTab('deals')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'deals' ? '3px solid var(--primary-blue)' : 'none',
                color: activeTab === 'deals' ? 'var(--primary-blue)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'deals' ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              Deals ({business.deals.length})
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'about' && (
          <div className="card p-4">
            <h3 className="mb-3">Hours of Operation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 2rem' }}>
              {Object.entries(hours).map(([day, times]) => (
                <React.Fragment key={day}>
                  <strong style={{ textTransform: 'capitalize' }}>{day}:</strong>
                  <span>
                    {times.open === 'Closed'
                      ? 'Closed'
                      : `${times.open} - ${times.close}`}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="mb-4">
              <ReviewForm businessId={id} onReviewSubmitted={handleReviewSubmitted} />
            </div>
            <ReviewList reviews={reviews} onSort={(sortBy) => console.log('Sort by:', sortBy)} />
          </div>
        )}

        {activeTab === 'deals' && business.deals && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            {business.deals.map((deal) => (
              <div key={deal.id} className="card p-3">
                <h4 className="mb-2">{deal.title}</h4>
                <p className="mb-2">{deal.description}</p>
                {deal.discount_code && (
                  <div className="mb-2">
                    <strong>Code:</strong>{' '}
                    <code
                      style={{
                        background: 'var(--bg-tertiary)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {deal.discount_code}
                    </code>
                  </div>
                )}
                {deal.terms && (
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {deal.terms}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessDetailPage;
