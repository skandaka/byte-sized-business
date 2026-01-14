/**
 * Favorites Page
 * Shows user's saved/favorited businesses (Required Feature #4)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import SafeImage from '../components/SafeImage';

function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (businessId) => {
    if (!window.confirm('Remove this business from favorites?')) return;

    try {
      await removeFavorite(user.id, businessId);
      setFavorites(favorites.filter((fav) => fav.id !== businessId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="mt-2">Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-3">My Favorites</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
        Your saved businesses for quick access
      </p>

      {favorites.length === 0 ? (
        <EmptyState
          icon="🤍"
          title="Your favorites list is empty"
          message="Discover local gems and save them here for quick access later. Click the heart icon on any business to add it to your favorites!"
          actionText="Explore Businesses"
          actionLink="/"
        />
      ) : (
        <>
          <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
            {favorites.length} saved {favorites.length === 1 ? 'business' : 'businesses'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((business) => (
              <div key={business.id} className="card p-3">
                <Link to={`/business/${business.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <SafeImage
                    src={business.image_url}
                    alt={business.name}
                    category={business.category}
                    businessName={business.name}
                    height={200}
                    style={{ marginBottom: '1rem' }}
                  />
                  <h3>{business.name}</h3>
                  <span
                    className="text-sm"
                    style={{
                      display: 'inline-block',
                      background: 'var(--primary-blue)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {business.category}
                  </span>
                  <div className="flex items-center gap-1 mb-2">
                    <StarRating rating={business.averageRating} readonly size="small" />
                    <span style={{ fontWeight: 'bold' }}>{business.averageRating}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>({business.reviewCount} reviews)</span>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(business.id)}
                  className="btn btn-danger"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Remove from Favorites
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default FavoritesPage;
