/**
 * API Utility Functions
 * Centralized API communication layer for the application
 * All HTTP requests to the backend go through these functions
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== BUSINESS API ==========

/**
 * Fetch all businesses with optional filters
 * @param {Object} filters - Filter options (category, minRating, search, sort)
 * @returns {Promise<Array>} Array of business objects
 */
export const getBusinesses = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.minRating) params.append('minRating', filters.minRating);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);

  const response = await api.get(`/businesses?${params.toString()}`);
  return response.data;
};

/**
 * Fetch single business by ID
 * @param {string} id - Business ID
 * @returns {Promise<Object>} Business object with details
 */
export const getBusinessById = async (id) => {
  const response = await api.get(`/businesses/${id}`);
  return response.data;
};

/**
 * Create a new business
 * @param {Object} businessData - Business information
 * @returns {Promise<Object>} Created business object
 */
export const createBusiness = async (businessData) => {
  const response = await api.post('/businesses', businessData);
  return response.data;
};

// ========== REVIEWS API ==========

/**
 * Fetch reviews for a specific business
 * @param {string} businessId - Business ID
 * @param {string} sort - Sort order (recent, highest, lowest, helpful)
 * @returns {Promise<Array>} Array of review objects
 */
export const getReviews = async (businessId, sort = 'recent') => {
  const response = await api.get(`/reviews/${businessId}?sort=${sort}`);
  return response.data;
};

/**
 * Create a new review
 * @param {Object} reviewData - Review information
 * @returns {Promise<Object>} Created review object
 */
export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Success message
 */
export const deleteReview = async (reviewId, userId) => {
  const response = await api.delete(`/reviews/${reviewId}`, { data: { userId } });
  return response.data;
};

/**
 * Mark review as helpful
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} Updated helpful count
 */
export const markReviewHelpful = async (reviewId) => {
  const response = await api.put(`/reviews/${reviewId}/helpful`);
  return response.data;
};

/**
 * Get reviews by user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's reviews
 */
export const getUserReviews = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};

// ========== AUTH API ==========

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User object and JWT token
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login existing user
 * @param {Object} credentials - Email and password
 * @returns {Promise<Object>} User object and JWT token
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile with statistics
 */
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

/**
 * Logout user
 * @returns {Promise<Object>} Success message
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// ========== FAVORITES API ==========

/**
 * Get user's favorites
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of favorited businesses
 */
export const getFavorites = async (userId) => {
  const response = await api.get(`/favorites/${userId}`);
  return response.data;
};

/**
 * Add business to favorites
 * @param {string} userId - User ID
 * @param {string} businessId - Business ID
 * @returns {Promise<Object>} Success message
 */
export const addFavorite = async (userId, businessId) => {
  const response = await api.post('/favorites', { userId, businessId });
  return response.data;
};

/**
 * Remove business from favorites
 * @param {string} userId - User ID
 * @param {string} businessId - Business ID
 * @returns {Promise<Object>} Success message
 */
export const removeFavorite = async (userId, businessId) => {
  const response = await api.delete(`/favorites/${userId}/${businessId}`);
  return response.data;
};

/**
 * Check if business is favorited
 * @param {string} userId - User ID
 * @param {string} businessId - Business ID
 * @returns {Promise<Object>} Object with isFavorited boolean
 */
export const checkFavorite = async (userId, businessId) => {
  const response = await api.get(`/favorites/${userId}/check/${businessId}`);
  return response.data;
};

/**
 * Export favorites as CSV
 * @param {string} userId - User ID
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportFavorites = async (userId) => {
  const response = await api.get(`/favorites/${userId}/export`, {
    responseType: 'blob',
  });
  return response.data;
};

// ========== DEALS API ==========

/**
 * Get all active deals
 * @param {string} category - Category filter
 * @returns {Promise<Array>} Array of deal objects
 */
export const getDeals = async (category = null) => {
  const params = category && category !== 'All' ? `?category=${category}` : '';
  const response = await api.get(`/deals${params}`);
  return response.data;
};

/**
 * Get deals for specific business
 * @param {string} businessId - Business ID
 * @returns {Promise<Array>} Array of deals
 */
export const getBusinessDeals = async (businessId) => {
  const response = await api.get(`/deals/business/${businessId}`);
  return response.data;
};

/**
 * Get deal by ID
 * @param {string} dealId - Deal ID
 * @returns {Promise<Object>} Deal object
 */
export const getDealById = async (dealId) => {
  const response = await api.get(`/deals/${dealId}`);
  return response.data;
};

/**
 * Claim a deal
 * @param {string} dealId - Deal ID
 * @param {string} userId - User ID
 * @param {string} verificationToken - CAPTCHA verification token
 * @returns {Promise<Object>} Deal details with discount code
 */
export const claimDeal = async (dealId, userId, verificationToken) => {
  const response = await api.post(`/deals/${dealId}/claim`, { userId, verificationToken });
  return response.data;
};

/**
 * Create a new deal
 * @param {Object} dealData - Deal information
 * @returns {Promise<Object>} Created deal object
 */
export const createDeal = async (dealData) => {
  const response = await api.post('/deals', dealData);
  return response.data;
};

// ========== ANALYTICS API ==========

/**
 * Get platform overview statistics
 * @returns {Promise<Object>} Platform statistics
 */
export const getAnalyticsOverview = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};

/**
 * Get top-rated businesses
 * @param {number} limit - Number of businesses to return
 * @returns {Promise<Array>} Top-rated businesses
 */
export const getTopRated = async (limit = 10) => {
  const response = await api.get(`/analytics/top-rated?limit=${limit}`);
  return response.data;
};

/**
 * Get trending businesses
 * @param {number} limit - Number of businesses to return
 * @returns {Promise<Array>} Trending businesses
 */
export const getTrending = async (limit = 10) => {
  const response = await api.get(`/analytics/trending?limit=${limit}`);
  return response.data;
};

/**
 * Get review trends over time
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Array>} Review count by date
 */
export const getReviewsOverTime = async (days = 30) => {
  const response = await api.get(`/analytics/reviews-over-time?days=${days}`);
  return response.data;
};

/**
 * Get rating distribution
 * @returns {Promise<Array>} Count of reviews by rating (1-5)
 */
export const getRatingDistribution = async () => {
  const response = await api.get('/analytics/rating-distribution');
  return response.data;
};

/**
 * Get user-specific analytics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
export const getUserAnalytics = async (userId) => {
  const response = await api.get(`/analytics/user/${userId}`);
  return response.data;
};

/**
 * Get business-specific analytics
 * @param {string} businessId - Business ID
 * @returns {Promise<Object>} Business analytics data
 */
export const getBusinessAnalytics = async (businessId) => {
  const response = await api.get(`/analytics/business/${businessId}`);
  return response.data;
};

export default api;
