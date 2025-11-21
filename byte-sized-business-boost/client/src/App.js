/**
 * Main Application Component
 * Handles routing and global providers for the application
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BusinessProvider } from './contexts/BusinessContext';

// Components
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import HomePage from './pages/HomePage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import DealsPage from './pages/DealsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

/**
 * Main App Component
 * Sets up routing and wraps application in context providers
 */
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <BusinessProvider>
            <div className="App">
              {/* Skip to main content link for accessibility */}
              <a href="#main-content" className="skip-to-main">
                Skip to main content
              </a>

              {/* Navigation bar */}
              <Navbar />

              {/* Main content area */}
              <main id="main-content">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/business/:id" element={<BusinessDetailPage />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected routes */}
                  <Route
                    path="/favorites"
                    element={
                      <ProtectedRoute>
                        <FavoritesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Global toast notification system */}
              <Toast />
            </div>
          </BusinessProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
