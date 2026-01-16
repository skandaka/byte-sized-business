/**
 * Business Detail Page
 * Shows detailed information about a single business with reviews
 * FBLA Rubric: Full business information, reviews, deals, and Q&A
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBusinessById, getReviews, addFavorite, removeFavorite, checkFavorite, getBusinessDeals } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import SafeImage from '../components/SafeImage';
import BusinessPairings from '../components/BusinessPairings';
import QASection from '../components/QASection';

function BusinessDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [deals, setDeals] = useState([]);
  const [deliveryLinks, setDeliveryLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const isExternal = business?.isExternal;

  useEffect(() => {
    fetchBusinessData();
    fetchReviews();
    if (user) {
      checkIfFavorited();
    }
  }, [id, user]);

  // Fetch deals when business data is available
  useEffect(() => {
    if (business) {
      fetchDeals();
    }
  }, [business]);

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

  const fetchDeals = async () => {
    try {
      setDealsLoading(true);
      const data = await getBusinessDeals(id, {
        name: business.name,
        category: business.category,
        description: business.description,
        address: business.address
      });
      
      setDeals(data.deals || []);
      setDeliveryLinks(data.deliveryLinks || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setDeals([]);
      setDeliveryLinks([]);
    } finally {
      setDealsLoading(false);
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
        // Pass business data for external businesses so they can be stored
        await addFavorite(user.id, id, business);
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
          <SafeImage
            src={business.image_url}
            alt={business.name}
            category={business.category}
            businessName={business.name}
            height={300}
            width="300px"
            style={{ borderRadius: 'var(--radius-lg)', flexShrink: 0 }}
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
                  fontSize: '1.5rem'
                }}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Rating - Clickable link to Google */}
            <div className="flex items-center gap-2 mb-3">
              {business.external_id ? (
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${business.external_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s'
                  }}
                  title="View on Google Maps"
                >
                  <StarRating rating={business.averageRating} readonly size="medium" />
                  <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    {business.averageRating}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                  <span style={{ 
                    color: 'var(--primary-blue)', 
                    fontSize: '0.8rem',
                    marginLeft: '0.5rem'
                  }}>
                    View on Google ↗
                  </span>
                </a>
              ) : (
                <>
                  <StarRating rating={business.averageRating} readonly size="medium" />
                  <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {business.averageRating}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </>
              )}
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
              {business.deliveryOptions && business.deliveryOptions.length > 0 && (
                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <span>🛵</span>
                  <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                    {business.deliveryOptions.map((svc) => (
                      <a
                        key={svc.name}
                        href={svc.link || '#'}
                        onClick={(e) => {
                          if (!svc.link) e.preventDefault();
                        }}
                        target={svc.link ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        style={{
                          background: 'var(--bg-tertiary)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '999px',
                          color: 'var(--text-secondary)',
                          textDecoration: svc.link ? 'underline' : 'none'
                        }}
                      >
                        {svc.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Claim Business Link */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <Link 
                to={`/business/${id}/claim`}
                style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.875rem',
                  textDecoration: 'underline'
                }}
              >
                🏪 Own this business? Claim it
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="flex" style={{ borderBottom: '2px solid var(--border-color)', gap: '1rem', flexWrap: 'wrap' }}>
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
          <button
            onClick={() => setActiveTab('qna')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'qna' ? '3px solid var(--primary-blue)' : 'none',
              color: activeTab === 'qna' ? 'var(--primary-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'qna' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            Q&A 💬
          </button>
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
            Deals & Offers {deals.length > 0 && `(${deals.length})`}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'about' && (
          <div className="card p-4">
            <h3 className="mb-3">Hours of Operation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 2rem' }}>
              {Object.entries(hours).map(([day, times]) => {
                // Handle both formats: string (from Google) or object (from database)
                const displayTime = typeof times === 'string'
                  ? times
                  : (times.open === 'Closed' ? 'Closed' : `${times.open} - ${times.close}`);

                return (
                  <React.Fragment key={day}>
                    <strong style={{ textTransform: 'capitalize' }}>{day}:</strong>
                    <span>{displayTime}</span>
                  </React.Fragment>
                );
              })}
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

        {/* Q&A Tab - Interactive Q&A Feature */}
        {activeTab === 'qna' && (
          <QASection 
            businessId={id} 
            businessName={business.name}
          />
        )}

        {activeTab === 'deals' && (
          <div>
            {/* Delivery Service Links */}
            {deliveryLinks.length > 0 && (
              <div className="card p-4 mb-4">
                <h3 className="mb-3">🛵 Order Online</h3>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {deliveryLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--primary-blue)';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'var(--bg-tertiary)';
                        e.target.style.color = 'var(--text-primary)';
                      }}
                    >
                      {link.icon} {link.name}
                      {link.hasDeals && <span style={{ fontSize: '0.75rem', background: 'var(--success-green)', color: 'white', padding: '0.125rem 0.375rem', borderRadius: '999px' }}>Deals</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Deals Grid */}
            {dealsLoading ? (
              <div className="text-center p-4">
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p className="mt-2">Finding deals for {business.name}...</p>
              </div>
            ) : deals.length === 0 ? (
              <div className="card p-4 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>
                  No deals available for this business right now. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal) => {
                  const expirationDate = new Date(deal.expiration_date);
                  const now = new Date();
                  const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
                  const isExpired = daysRemaining <= 0;

                  return (
                    <div 
                      key={deal.id} 
                      className="card p-4"
                      style={{
                        opacity: isExpired ? 0.6 : 1,
                        border: isExpiringSoon ? '2px solid var(--warning-yellow)' : undefined
                      }}
                    >
                      {/* Deal Header */}
                      <div className="flex justify-between items-start mb-2">
                        <h4 style={{ marginBottom: '0.25rem' }}>{deal.title}</h4>
                        {isExpiringSoon && !isExpired && (
                          <span style={{
                            background: 'var(--warning-yellow)',
                            color: '#333',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            ⏰ {daysRemaining}d left
                          </span>
                        )}
                      </div>

                      {/* Provider Badge */}
                      {deal.provider && (
                        <div className="mb-2">
                          <span style={{
                            background: 'var(--bg-tertiary)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            {deal.service_icon || '🎫'} {deal.provider}
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {deal.description}
                      </p>

                      {/* Terms */}
                      {deal.terms && (
                        <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                          {deal.terms}
                        </p>
                      )}

                      {/* Action Button */}
                      {deal.service_link ? (
                        <a
                          href={deal.service_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ 
                            width: '100%', 
                            textDecoration: 'none', 
                            textAlign: 'center',
                            display: 'block'
                          }}
                        >
                          Get Deal on {deal.provider} →
                        </a>
                      ) : (
                        <div style={{
                          background: 'var(--bg-tertiary)',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          textAlign: 'center'
                        }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Available In-Store
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Business Pairings - Complementary businesses nearby */}
        {business && business.latitude && business.longitude && (
          <BusinessPairings business={business} />
        )}
      </div>
    </div>
  );
}

export default BusinessDetailPage;
