/**
 * Enhanced Search Bar Component
 * Features: rotating placeholders, search history, result count
 */

import React, { useState, useEffect, useRef } from 'react';

const PLACEHOLDER_SUGGESTIONS = [
  'Try searching for coffee shops...',
  'Search for restaurants near you...',
  'Find local gyms and fitness centers...',
  'Discover salons and spas...',
  'Look for retail stores...',
  'Search for entertainment venues...',
];

function SearchBar({ value, onChange, onSearch, resultCount, isSearching }) {
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_SUGGESTIONS[0]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchBarRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Rotate placeholders every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_SUGGESTIONS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update placeholder when index changes
  useEffect(() => {
    setPlaceholder(PLACEHOLDER_SUGGESTIONS[placeholderIndex]);
  }, [placeholderIndex]);

  // Handle click outside to close history dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      saveToHistory(value.trim());
      if (onSearch) onSearch(value.trim());
      setShowHistory(false);
    }
  };

  const handleFocus = () => {
    if (searchHistory.length > 0 && !value) {
      setShowHistory(true);
    }
  };

  const saveToHistory = (query) => {
    if (!query) return;

    const newHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleHistoryClick = (query) => {
    onChange(query);
    if (onSearch) onSearch(query);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    setShowHistory(false);
  };

  return (
    <div ref={searchBarRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="input"
          style={{
            width: '100%',
            paddingRight: value ? '2.5rem' : '1rem',
            fontSize: '1rem',
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: 'var(--text-tertiary)',
              padding: '0.25rem',
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Result Count */}
      {isSearching !== undefined && value && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          {isSearching ? (
            'Searching...'
          ) : resultCount !== undefined ? (
            <>
              Found <strong>{resultCount}</strong> {resultCount === 1 ? 'business' : 'businesses'}
              {value && <> matching "<strong>{value}</strong>"</>}
            </>
          ) : null}
        </div>
      )}

      {/* Search History Dropdown */}
      {showHistory && searchHistory.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginTop: '0.25rem',
            zIndex: 10,
            maxHeight: '250px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              RECENT SEARCHES
            </span>
            <button
              onClick={clearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-blue)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          </div>
          {searchHistory.map((query, index) => (
            <button
              key={index}
              onClick={() => handleHistoryClick(query)}
              style={{
                width: '100%',
                padding: '0.75rem',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderBottom: index < searchHistory.length - 1 ? '1px solid var(--border-color)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ color: 'var(--text-tertiary)' }}>🕐</span>
              <span>{query}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
