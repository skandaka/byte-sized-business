/**
 * Main Application Component
 * Handles routing and global providers for the application
 * 
 * FBLA Coding & Programming 2025-2026
 * Features: Navigation, Authentication, Theming, Tutorial System
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BusinessProvider } from './contexts/BusinessContext';

// Components
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import TutorialModal, { useTutorial } from './components/TutorialModal';

// Pages
import HomePage from './pages/HomePage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RandomDiscoveryPage from './pages/RandomDiscoveryPage';
import BusinessClaimPage from './pages/BusinessClaimPage';
import HelpPage from './pages/HelpPage';
import DealsPage from './pages/DealsPage';
import AnalyticsPage from './pages/AnalyticsPage';

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
  // Simple scroll-based reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.08 }
    );

    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <BusinessProvider>
            <AppContent />
          </BusinessProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

/**
 * App Content Component
 * Separated to allow using hooks within context providers
 */
function AppContent() {
  // Tutorial system hook
  const { showTutorial, completeTutorial, closeTutorial, openTutorial } = useTutorial();

  return (
    <div className="App">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Navigation bar with tutorial trigger */}
      <Navbar onOpenTutorial={openTutorial} />

      {/* Main content area */}
      <main id="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/business/:id" element={<BusinessDetailPage />} />
          <Route path="/business/:id/claim" element={<BusinessClaimPage />} />
          <Route path="/discover" element={<RandomDiscoveryPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/help" element={<HelpPage />} />
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

      {/* Tutorial Modal for new users */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />

      {/* Global toast notification system */}
      <Toast />
    </div>
  );
}

export default App;
