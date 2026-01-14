/**
 * Deals Page
 * Shows all active deals with filtering by category (Required Feature #5)
 */

import React, { useState, useEffect } from 'react';
import { getDeals } from '../utils/api';
import { useBusiness } from '../contexts/BusinessContext';
import DealCard from '../components/DealCard';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/LoadingSkeleton';

function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { location } = useBusiness();

  const categories = ['All', 'Food', 'Retail', 'Services', 'Entertainment', 'Health', 'Other'];

  useEffect(() => {
    fetchDeals();
  }, [selectedCategory, location]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      // Pass location to get location-specific deals
      const filters = {
        category: selectedCategory !== 'All' ? selectedCategory : null,
        lat: location?.lat || 41.8781,
        lng: location?.lng || -87.6298,
        radius: location?.radius || 10,
      };
      const data = await getDeals(filters.category, filters.lat, filters.lng, filters.radius);
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-3">Exclusive Deals & Coupons</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
        Save money at your favorite local businesses with these limited-time offers!
      </p>

      {/* Category Filter */}
      <div className="mb-4">
        <h3 className="mb-2">Filter by Category</h3>
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
      </div>

      {/* Deals Grid */}
      {loading ? (
        <ListSkeleton count={6} type="deal" />
      ) : deals.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No deals available right now"
          message={selectedCategory === 'All'
            ? "Check back soon for exclusive local deals from your favorite businesses!"
            : `No active deals in ${selectedCategory} category at the moment. Try viewing all categories or check back later!`}
          actionText={selectedCategory === 'All' ? "Explore Businesses" : "View All Deals"}
          actionOnClick={selectedCategory === 'All' ? undefined : () => setSelectedCategory('All')}
          actionLink={selectedCategory === 'All' ? "/" : undefined}
        />
      ) : (
        <>
          <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
            Showing {deals.length} active {deals.length === 1 ? 'deal' : 'deals'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3" data-reveal>
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DealsPage;
