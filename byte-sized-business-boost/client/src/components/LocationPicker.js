/**
 * Location Picker Component
 * Allows users to select their location via geolocation or city input
 */

import React, { useState, useEffect } from 'react';

function LocationPicker({ onLocationChange, currentLocation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const CHICAGO_DEFAULT = {
    lat: 41.8781,
    lng: -87.6298,
    name: 'Chicago, IL',
    radius: 10, // miles
  };

  useEffect(() => {
    // Set Chicago as default if no location is set
    if (!currentLocation) {
      onLocationChange(CHICAGO_DEFAULT);
    }
  }, [currentLocation, onLocationChange]);

  const handleUseMyLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Your Location',
          radius: 10,
        };
        onLocationChange(location);
        setLoading(false);
        setShowManualInput(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Could not get your location. Please enter a city instead.');
        setLoading(false);
        setShowManualInput(true);
      }
    );
  };

  const handleManualCitySubmit = async (e) => {
    e.preventDefault();
    if (!manualCity.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Use OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualCity)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'ByteSizedBusinessBoost/1.0',
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: result.display_name.split(',').slice(0, 2).join(','),
          radius: 10,
        };
        onLocationChange(location);
        setShowManualInput(false);
        setManualCity('');
      } else {
        setError('City not found. Please try again.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to find city. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    if (currentLocation) {
      onLocationChange({ ...currentLocation, radius: newRadius });
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: 'var(--spacing-2)',
        marginBottom: 'var(--spacing-3)',
        background: 'var(--bg-secondary)',
      }}
    >
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            📍 Location
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {currentLocation ? currentLocation.name : 'No location selected'}
            {currentLocation && ` (within ${currentLocation.radius} miles)`}
          </p>
        </div>

        <div className="flex gap-2" style={{ alignItems: 'center' }}>
          {!showManualInput ? (
            <>
              <button
                onClick={handleUseMyLocation}
                className="btn btn-primary"
                disabled={loading}
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                {loading ? '🔄 Getting location...' : '📍 Use My Location'}
              </button>
              <button
                onClick={() => setShowManualInput(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                🗺️ Enter City
              </button>
            </>
          ) : (
            <form onSubmit={handleManualCitySubmit} className="flex gap-1">
              <input
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                placeholder="Enter city (e.g., Chicago, IL)"
                className="input"
                style={{ minWidth: '200px' }}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !manualCity.trim()}
              >
                {loading ? '🔄' : '✓'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowManualInput(false);
                  setManualCity('');
                  setError('');
                }}
                className="btn btn-secondary"
                disabled={loading}
              >
                ✕
              </button>
            </form>
          )}

          {currentLocation && (
            <select
              value={currentLocation.radius}
              onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
              className="input"
              style={{ width: 'auto', fontSize: '0.9rem' }}
            >
              <option value={1}>1 mile</option>
              <option value={3}>3 miles</option>
              <option value={5}>5 miles</option>
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
            </select>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 'var(--spacing-1)',
            padding: 'var(--spacing-1)',
            background: 'var(--error-red)',
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
