/**
 * Authentication Context
 * Manages user authentication state across the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getProfile } from '../utils/api';

const AuthContext = createContext();

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * Auth Provider Component
 * Wraps application to provide authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiLogin({ email, password });

      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setLoading(false);

      return response.user;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Register new user
   * @param {string} username - Username
   * @param {string} email - Email address
   * @param {string} password - Password
   * @returns {Promise<Object>} User data
   */
  const register = async (username, email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiRegister({ username, email, password });

      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setLoading(false);

      return response.user;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  /**
   * Refresh user profile data
   */
  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      const updatedUser = { ...user, ...profile };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.error('Error refreshing profile:', err);
      throw err;
    }
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  /**
   * Check if user is admin
   * @returns {boolean} True if user has admin privileges
   */
  const isAdmin = () => {
    return user?.is_admin === 1;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
