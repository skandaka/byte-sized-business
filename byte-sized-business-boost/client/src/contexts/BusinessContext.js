/**
 * Business Context
 * Manages global business state, filtering, and favorites
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBusinesses, getFavorites } from '../utils/api';
import { useAuth } from './AuthContext';

const BusinessContext = createContext();

/**
 * Custom hook to use business context
 * @returns {Object} Business context value
 */
export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within BusinessProvider');
  }
  return context;
}

/**
 * Business Provider Component
 * Manages businesses data and filtering state
 */
export function BusinessProvider({ children }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('highest-rated');
  const [minRating, setMinRating] = useState(0);
  const [includeExternal, setIncludeExternal] = useState(true);
  
  // Default to Chicago location for live business search with real photos
  const [location, setLocation] = useState({
    lat: 41.8781,
    lng: -87.6298,
    name: 'Chicago, IL',
    radius: 10
  });

  /**
   * Fetch businesses with current filters
   */
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        category: selectedCategory,
        search: searchQuery,
        sort: sortBy,
        minRating: minRating > 0 ? minRating : undefined,
        lat: location?.lat,
        lng: location?.lng,
        radius: location?.radius,
      };

      const data = await getBusinesses(filters, includeExternal);
      setBusinesses(data);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch user's favorites
   */
  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const data = await getFavorites(user.id);
      setFavorites(data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // Fetch businesses when filters change
  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory, searchQuery, sortBy, minRating, includeExternal, location]);

  // Fetch favorites when user changes
  useEffect(() => {
    fetchFavorites();
  }, [user]);

  /**
   * Check if business is favorited
   * @param {string} businessId - Business ID
   * @returns {boolean} True if business is in favorites
   */
  const isFavorited = (businessId) => {
    return favorites.some((fav) => fav.id === businessId);
  };

  /**
   * Reset all filters to defaults
   */
  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('highest-rated');
    setMinRating(0);
  };

  const value = {
    businesses,
    favorites,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    minRating,
    setMinRating,
    includeExternal,
    setIncludeExternal,
    location,
    setLocation,
    fetchBusinesses,
    fetchFavorites,
    isFavorited,
    resetFilters,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export default BusinessContext;
