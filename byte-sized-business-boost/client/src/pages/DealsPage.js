/**
 * Deals Page
 * Shows all active deals with filtering by category (Required Feature #5)
 */

import React, { useState, useEffect } from 'react';
import { getDeals } from '../utils/api';
import DealCard from '../components/DealCard';

function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Food', 'Retail', 'Services', 'Entertainment', 'Health', 'Other'];

  useEffect(() => {
    fetchDeals();
  }, [selectedCategory]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const data = await getDeals(selectedCategory !== 'All' ? selectedCategory : null);
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="mt-2">Loading deals...</p>
      </div>
    );
  }

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
      {deals.length === 0 ? (
        <div className="card p-4 text-center">
          <h3>No Deals Available</h3>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Check back soon for new deals in this category!
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
            Showing {deals.length} active {deals.length === 1 ? 'deal' : 'deals'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
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
