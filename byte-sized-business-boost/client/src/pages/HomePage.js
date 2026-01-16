/**
 * Home Page Component
 * Main landing page displaying all businesses with filters
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useBusiness } from '../contexts/BusinessContext';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import { ListSkeleton } from '../components/LoadingSkeleton';
import SafeImage from '../components/SafeImage';
import LocationPicker from '../components/LocationPicker';

function HomePage() {
  const {
    businesses,
    loading,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    includeExternal,
    setIncludeExternal,
    location,
    setLocation,
  } = useBusiness();

  const categories = ['All', 'Food', 'Retail', 'Services', 'Entertainment', 'Health', 'Other'];
  const sortOptions = [
    { value: 'highest-rated', label: 'Highest Rated' },
    { value: 'most-reviews', label: 'Most Reviews' },
    { value: 'lowest-rated', label: 'Lowest Rated' },
    { value: 'most-recent', label: 'Most Recent' },
    { value: 'a-z', label: 'A-Z' },
  ];

  // Show skeleton on initial load
  const showSkeleton = loading && businesses.length === 0;

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

      {/* Location Picker */}
      <section className="mb-3">
        <LocationPicker
          currentLocation={location}
          onLocationChange={setLocation}
        />
      </section>

      {/* Search Bar */}
      <section className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={businesses.length}
          isSearching={loading}
        />
      </section>

      {/* Category Filter */}
      <section className="mb-3" data-reveal>
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
        <label className="flex items-center gap-1" style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeExternal}
            onChange={(e) => setIncludeExternal(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          Include partner picks (Yelp/Google)
        </label>
      </section>

      {/* Business Grid */}
      <section>
        {showSkeleton ? (
          <ListSkeleton count={6} type="business" />
        ) : businesses.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={`No businesses found in ${selectedCategory === 'All' ? 'any category' : selectedCategory}`}
            message={selectedCategory === 'All'
              ? "There are no businesses available at the moment. Please check back soon!"
              : `Try selecting "All" or a different category to discover more local businesses.`}
            actionText="View All Categories"
            actionOnClick={() => setSelectedCategory('All')}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3" data-reveal>
            {businesses.map((business) => (
              <Link
                key={business.id}
                to={`/business/${business.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                  <SafeImage
                    src={business.image_url}
                    alt={business.name}
                    category={business.category}
                    businessName={business.name}
                    height={200}
                    style={{ marginBottom: '1rem' }}
                  />

                  {/* Business Info */}
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{business.name}</h3>
                      <span
                        className="text-sm"
                        style={{
                          background: {
                            'Food': 'var(--success-green)',
                            'Retail': 'var(--primary-blue)',
                            'Services': '#9b59b6',
                            'Entertainment': 'var(--warning-yellow)',
                            'Health': '#e74c3c',
                            'Other': 'var(--text-tertiary)'
                          }[business.category] || 'var(--primary-blue)',
                          color: business.category === 'Entertainment' ? '#333' : 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {business.category}
                      </span>
                      {business.isExternal && (
                        <span className="text-sm" style={{ color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
                          Partner
                        </span>
                      )}
                    </div>

                    <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {business.description.substring(0, 120)}...
                    </p>

                    {/* Rating - Clickable to Google */}
                    <div className="flex items-center gap-1">
                      {business.external_id ? (
                        <a
                          href={`https://www.google.com/maps/place/?q=place_id:${business.external_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            textDecoration: 'none',
                            color: 'inherit'
                          }}
                          title="View on Google Maps"
                        >
                          <span style={{ color: 'var(--warning-yellow)', fontSize: '1.2rem' }}>
                            {'⭐'.repeat(Math.round(business.averageRating || 0))}
                          </span>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{business.averageRating || 0}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            ({business.reviewCount || 0})
                          </span>
                        </a>
                      ) : (
                        <>
                          <span style={{ color: 'var(--warning-yellow)', fontSize: '1.2rem' }}>
                            {'⭐'.repeat(Math.round(business.averageRating || 0))}
                          </span>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{business.averageRating || 0}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            ({business.reviewCount || 0} reviews)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Address */}
                    <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      📍 {business.address.split(',')[0]}
                      {business.distance && (
                        <span style={{ marginLeft: '0.5rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                          ({business.distance.toFixed(1)} mi)
                        </span>
                      )}
                    </p>

                    {business.deliveryOptions && business.deliveryOptions.length > 0 && (
                      <div className="flex gap-1 mt-1" style={{ flexWrap: 'wrap' }}>
                        {business.deliveryOptions.slice(0, 3).map((svc) =>
                          svc.link ? (
                            <a
                              key={`${business.id}-${svc.name}`}
                              href={svc.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                background: 'var(--bg-tertiary)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '999px',
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                display: 'inline-block',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'var(--primary-blue)';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'var(--bg-tertiary)';
                                e.target.style.color = 'var(--text-secondary)';
                              }}
                            >
                              {svc.name} ↗
                            </a>
                          ) : (
                            <span
                              key={`${business.id}-${svc.name}`}
                              className="text-sm"
                              style={{
                                background: 'var(--bg-tertiary)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '999px',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              {svc.name}
                            </span>
                          )
                        )}
                      </div>
                    )}
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
