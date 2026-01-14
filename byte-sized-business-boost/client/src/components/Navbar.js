/**
 * Navbar Component
 * Main navigation bar with links and dark mode toggle
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode, highContrast, toggleHighContrast } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      style={{
        padding: '1rem 0',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <div className="container">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              color: 'var(--primary-blue)'
            }}
          >
            🏪 Byte-Sized Business
          </Link>

          {/* Mobile menu button */}
          <button
            className="btn btn-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none' }}
            aria-label="Toggle mobile menu"
          >
            ☰
          </button>

          {/* Desktop Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center'
            }}
            className="desktop-nav"
          >
            <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500 }}>
              Home
            </Link>
            <Link to="/discover" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500 }}>
              Discover
            </Link>
            <Link to="/map" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500 }}>
              Map
            </Link>

            {user ? (
              <>
                <Link to="/favorites" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Favorites
                </Link>
                <Link to="/profile" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Profile
                </Link>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {user.username}
                </span>
                <button onClick={logout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary">
                  Sign Up
                </Link>
              </>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="btn btn-secondary"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* High contrast toggle */}
            <button
              onClick={toggleHighContrast}
              className="btn btn-secondary"
              aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
              title={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
            >
              {highContrast ? '👁️' : '🎨'}
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: ${mobileMenuOpen ? 'flex' : 'none'} !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-secondary);
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
          }

          nav button[aria-label="Toggle mobile menu"] {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
