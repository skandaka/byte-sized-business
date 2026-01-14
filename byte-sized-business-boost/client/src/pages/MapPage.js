/**
 * Map Page
 * Interactive map showing local businesses near you
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBusiness } from '../contexts/BusinessContext';
import { getBusinesses } from '../utils/api';
import SafeImage from '../components/SafeImage';

function MapPage() {
  const { location } = useBusiness();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Food', 'Retail', 'Services', 'Entertainment', 'Health'];

  useEffect(() => {
    fetchBusinesses();
  }, [location, selectedCategory]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const filters = {
        lat: location?.lat || 41.8781,
        lng: location?.lng || -87.6298,
        radius: location?.radius || 10,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      };
      const data = await getBusinesses(filters);
      setBusinesses(data.slice(0, 30)); // Limit to 30 for performance
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group businesses by approximate location for the visual grid
  const groupedByDistance = businesses.reduce((acc, b) => {
    const distanceGroup = b.distance < 1 ? 'nearby' : b.distance < 3 ? 'close' : 'farther';
    if (!acc[distanceGroup]) acc[distanceGroup] = [];
    acc[distanceGroup].push(b);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Explore Nearby</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Discover local businesses in {location?.name || 'your area'}
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              border: 'none',
              background: selectedCategory === cat ? 'var(--primary-blue)' : 'var(--bg-secondary)',
              color: selectedCategory === cat ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading businesses...</p>
        </div>
      ) : (
        <div>
          {/* Nearby Section (< 1 mile) */}
          {groupedByDistance.nearby?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#4caf50' }}>●</span> Within Walking Distance
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 'normal' }}>
                  (less than 1 mile)
                </span>
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {groupedByDistance.nearby.map((business) => (
                  <BusinessMapCard key={business.id} business={business} />
                ))}
              </div>
            </div>
          )}

          {/* Close Section (1-3 miles) */}
          {groupedByDistance.close?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#ffc107' }}>●</span> Short Drive Away
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 'normal' }}>
                  (1-3 miles)
                </span>
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {groupedByDistance.close.map((business) => (
                  <BusinessMapCard key={business.id} business={business} />
                ))}
              </div>
            </div>
          )}

          {/* Farther Section (3+ miles) */}
          {groupedByDistance.farther?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#2196f3' }}>●</span> Worth the Trip
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 'normal' }}>
                  (3+ miles)
                </span>
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {groupedByDistance.farther.map((business) => (
                  <BusinessMapCard key={business.id} business={business} />
                ))}
              </div>
            </div>
          )}

          {businesses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                No businesses found in this area. Try changing your location or category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BusinessMapCard({ business }) {
  return (
    <Link
      to={`/business/${business.id}`}
      style={{
        display: 'block',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'all 0.2s',
        border: '1px solid var(--border-color)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <SafeImage
        src={business.image_url}
        alt={business.name}
        category={business.category}
        businessName={business.name}
        style={{ width: '100%', height: '140px', objectFit: 'cover' }}
      />
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1rem', 
            color: 'var(--text-primary)',
            fontWeight: 600
          }}>
            {business.name}
          </h3>
          <span style={{
            background: 'var(--bg-tertiary)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap'
          }}>
            {business.distance?.toFixed(1)} mi
          </span>
        </div>
        
        <p style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)' 
        }}>
          {business.category}
        </p>

        {business.averageRating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ color: '#ffc107' }}>★</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {business.averageRating?.toFixed(1)}
            </span>
            {business.reviewCount > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ({business.reviewCount})
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default MapPage;
