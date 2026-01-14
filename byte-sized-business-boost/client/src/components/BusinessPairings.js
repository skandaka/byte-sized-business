/**
 * Business Pairings Component
 * Shows complementary businesses within walking distance
 * Helps users plan multi-stop local experiences
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBusinessPairings } from '../utils/api';
import SafeImage from './SafeImage';

function BusinessPairings({ business }) {
  const [pairings, setPairings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPairings() {
      if (!business || !business.id) return;

      try {
        setLoading(true);
        const data = await getBusinessPairings(business.id, {
          lat: business.latitude,
          lng: business.longitude,
          radius: 1,
          name: business.name,
          category: business.category,
        });

        setPairings(data.pairings || []);
      } catch (err) {
        console.error('Error fetching pairings:', err);
        setError('Could not load nearby businesses');
      } finally {
        setLoading(false);
      }
    }

    fetchPairings();
  }, [business]);

  if (loading) {
    return (
      <div className="business-pairings-container">
        <h3>🚶 Nearby Combos</h3>
        <p className="text-secondary">Finding complementary businesses nearby...</p>
      </div>
    );
  }

  if (error || !pairings || pairings.length === 0) {
    return null; // Don't show section if no pairings
  }

  const handlePairingClick = (pairedBusiness) => {
    navigate(`/business/${pairedBusiness.id}`);
  };

  return (
    <div className="business-pairings-container">
      <h3>🚶 Make It a Day Trip</h3>
      <p className="text-secondary" style={{ marginBottom: '1rem' }}>
        Combine with these nearby local businesses:
      </p>

      <div className="pairings-grid">
        {pairings.map((pairing) => (
          <div
            key={pairing.id}
            className="pairing-card"
            onClick={() => handlePairingClick(pairing)}
            style={{ cursor: 'pointer' }}
          >
            <div className="pairing-image">
              <SafeImage
                src={pairing.image_url}
                alt={pairing.name}
                category={pairing.category}
                businessName={pairing.name}
                height={120}
                style={{ borderRadius: '8px 8px 0 0' }}
              />
            </div>

            <div className="pairing-content">
              <h4 className="pairing-name">{pairing.name}</h4>

              <div className="pairing-meta">
                <span className="pairing-category badge badge-secondary">
                  {pairing.category}
                </span>
                <span className="pairing-distance">
                  {pairing.distance?.toFixed(1)} mi
                </span>
              </div>

              {pairing.averageRating > 0 && (
                <div className="pairing-rating">
                  <span className="rating-stars">
                    {'⭐'.repeat(Math.round(pairing.averageRating))}
                  </span>
                  <span className="rating-value">
                    {pairing.averageRating.toFixed(1)}
                  </span>
                  {pairing.reviewCount > 0 && (
                    <span className="review-count">({pairing.reviewCount})</span>
                  )}
                </div>
              )}

              {pairing.pairingReason && (
                <p className="pairing-reason">{pairing.pairingReason}</p>
              )}

              <div className="pairing-score-badge">
                Match: {Math.round(pairing.pairingScore)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .business-pairings-container {
          margin: 2rem 0;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 2px solid var(--border-color);
        }

        .business-pairings-container h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .pairings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .pairing-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .pairing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: var(--primary-color);
        }

        .pairing-content {
          padding: 1rem;
        }

        .pairing-name {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .pairing-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .pairing-category {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }

        .pairing-distance {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .pairing-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .rating-stars {
          line-height: 1;
        }

        .rating-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .review-count {
          color: var(--text-secondary);
          font-size: 0.8125rem;
        }

        .pairing-reason {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0.5rem 0 0 0;
          font-style: italic;
        }

        .pairing-score-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: var(--primary-color);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .pairings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default BusinessPairings;
