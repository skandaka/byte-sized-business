/**
 * Home Page Component
 * Main landing page displaying all businesses with filters
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useBusiness } from '../contexts/BusinessContext';

function HomePage() {
  const { businesses, loading, selectedCategory, setSelectedCategory, sortBy, setSortBy } = useBusiness();

  const categories = ['All', 'Food', 'Retail', 'Services', 'Entertainment', 'Health', 'Other'];
  const sortOptions = [
    { value: 'highest-rated', label: 'Highest Rated' },
    { value: 'most-reviews', label: 'Most Reviews' },
    { value: 'lowest-rated', label: 'Lowest Rated' },
    { value: 'most-recent', label: 'Most Recent' },
    { value: 'a-z', label: 'A-Z' },
  ];

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="mt-2">Loading businesses...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Discover & Support Local Businesses
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Browse, review, and save your favorite small businesses. Find exclusive deals and support your local community.
        </p>
      </section>

      {/* Category Filter */}
      <section className="mb-3">
        <h3 className="mb-2">Browse by Category</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="btn"
              style={{
                background: selectedCategory === category ? 'var(--primary-blue)' : 'var(--bg-tertiary)',
                color: selectedCategory === category ? 'white' : 'var(--text-primary)',
                padding: '0.5rem 1rem',
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Sort Bar */}
      <section className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          Showing {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
        </p>
        <div>
          <label htmlFor="sort-select" style={{ marginRight: '0.5rem' }}>Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
            style={{ width: 'auto', display: 'inline-block' }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Business Grid */}
      <section>
        {businesses.length === 0 ? (
          <div className="card text-center p-4">
            <h3>No businesses found</h3>
            <p className="mt-2">Try selecting a different category.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Link
                key={business.id}
                to={`/business/${business.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                  {/* Business Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      background: `url(${business.image_url}) center/cover`,
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem'
                    }}
                    role="img"
                    aria-label={business.name}
                  />

                  {/* Business Info */}
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 style={{ margin: 0 }}>{business.name}</h3>
                      <span
                        className="text-sm"
                        style={{
                          background: 'var(--primary-blue)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {business.category}
                      </span>
                    </div>

                    <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {business.description.substring(0, 120)}...
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <span style={{ color: 'var(--warning-yellow)', fontSize: '1.2rem' }}>
                        {'⭐'.repeat(Math.round(business.averageRating))}
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{business.averageRating}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        ({business.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Address */}
                    <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      📍 {business.address.split(',')[0]}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
