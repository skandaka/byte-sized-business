/**
 * Location Picker Component
 * ZIP code based location selection for finding local businesses
 */

import React, { useState, useEffect } from 'react';

// ZIP code to coordinates mapping for major areas
const ZIP_DATABASE = {
  // Chicago area
  '60601': { lat: 41.8819, lng: -87.6278, name: 'Chicago Loop, IL' },
  '60602': { lat: 41.8833, lng: -87.6292, name: 'Chicago Loop, IL' },
  '60603': { lat: 41.8798, lng: -87.6258, name: 'Chicago Loop, IL' },
  '60604': { lat: 41.8777, lng: -87.6277, name: 'Chicago, IL' },
  '60605': { lat: 41.8662, lng: -87.6185, name: 'South Loop, Chicago, IL' },
  '60606': { lat: 41.8827, lng: -87.6392, name: 'West Loop, Chicago, IL' },
  '60607': { lat: 41.8721, lng: -87.6513, name: 'West Loop, Chicago, IL' },
  '60608': { lat: 41.8515, lng: -87.6694, name: 'Pilsen, Chicago, IL' },
  '60609': { lat: 41.8093, lng: -87.6533, name: 'Back of the Yards, Chicago, IL' },
  '60610': { lat: 41.9031, lng: -87.6364, name: 'Near North Side, Chicago, IL' },
  '60611': { lat: 41.8927, lng: -87.6183, name: 'Streeterville, Chicago, IL' },
  '60612': { lat: 41.8801, lng: -87.6860, name: 'Near West Side, Chicago, IL' },
  '60613': { lat: 41.9542, lng: -87.6564, name: 'Lakeview, Chicago, IL' },
  '60614': { lat: 41.9216, lng: -87.6482, name: 'Lincoln Park, Chicago, IL' },
  '60615': { lat: 41.8019, lng: -87.5978, name: 'Hyde Park, Chicago, IL' },
  '60616': { lat: 41.8423, lng: -87.6310, name: 'Chinatown, Chicago, IL' },
  '60617': { lat: 41.7256, lng: -87.5476, name: 'South Chicago, IL' },
  '60618': { lat: 41.9465, lng: -87.7049, name: 'Avondale, Chicago, IL' },
  '60619': { lat: 41.7450, lng: -87.6046, name: 'Chatham, Chicago, IL' },
  '60620': { lat: 41.7418, lng: -87.6516, name: 'Auburn Gresham, Chicago, IL' },
  '60621': { lat: 41.7754, lng: -87.6416, name: 'Englewood, Chicago, IL' },
  '60622': { lat: 41.9018, lng: -87.6773, name: 'Wicker Park, Chicago, IL' },
  '60623': { lat: 41.8495, lng: -87.7088, name: 'Little Village, Chicago, IL' },
  '60624': { lat: 41.8817, lng: -87.7229, name: 'Garfield Park, Chicago, IL' },
  '60625': { lat: 41.9713, lng: -87.6996, name: 'Lincoln Square, Chicago, IL' },
  '60626': { lat: 42.0094, lng: -87.6686, name: 'Rogers Park, Chicago, IL' },
  '60628': { lat: 41.6928, lng: -87.6108, name: 'Roseland, Chicago, IL' },
  '60629': { lat: 41.7782, lng: -87.7115, name: 'Chicago Lawn, Chicago, IL' },
  '60630': { lat: 41.9738, lng: -87.7616, name: 'Jefferson Park, Chicago, IL' },
  '60631': { lat: 41.9954, lng: -87.8059, name: 'Edison Park, Chicago, IL' },
  '60632': { lat: 41.8061, lng: -87.7043, name: 'Brighton Park, Chicago, IL' },
  '60633': { lat: 41.6555, lng: -87.5500, name: 'Hegewisch, Chicago, IL' },
  '60634': { lat: 41.9431, lng: -87.8019, name: 'Portage Park, Chicago, IL' },
  '60636': { lat: 41.7756, lng: -87.6679, name: 'West Englewood, Chicago, IL' },
  '60637': { lat: 41.7835, lng: -87.5989, name: 'Woodlawn, Chicago, IL' },
  '60638': { lat: 41.7862, lng: -87.7730, name: 'Clearing, Chicago, IL' },
  '60639': { lat: 41.9204, lng: -87.7536, name: 'Belmont Cragin, Chicago, IL' },
  '60640': { lat: 41.9745, lng: -87.6603, name: 'Uptown, Chicago, IL' },
  '60641': { lat: 41.9480, lng: -87.7507, name: 'Portage Park, Chicago, IL' },
  '60642': { lat: 41.9011, lng: -87.6592, name: 'Lincoln Park, Chicago, IL' },
  '60643': { lat: 41.6982, lng: -87.6644, name: 'Morgan Park, Chicago, IL' },
  '60644': { lat: 41.8818, lng: -87.7572, name: 'Austin, Chicago, IL' },
  '60645': { lat: 42.0065, lng: -87.6985, name: 'West Ridge, Chicago, IL' },
  '60646': { lat: 41.9987, lng: -87.7531, name: 'Sauganash, Chicago, IL' },
  '60647': { lat: 41.9209, lng: -87.7010, name: 'Logan Square, Chicago, IL' },
  '60649': { lat: 41.7637, lng: -87.5673, name: 'South Shore, Chicago, IL' },
  '60651': { lat: 41.9021, lng: -87.7398, name: 'Humboldt Park, Chicago, IL' },
  '60652': { lat: 41.7454, lng: -87.7131, name: 'Ashburn, Chicago, IL' },
  '60653': { lat: 41.8195, lng: -87.6084, name: 'Bronzeville, Chicago, IL' },
  '60654': { lat: 41.8924, lng: -87.6351, name: 'River North, Chicago, IL' },
  '60655': { lat: 41.6927, lng: -87.7017, name: 'Mount Greenwood, Chicago, IL' },
  '60656': { lat: 41.9775, lng: -87.8401, name: 'Norwood Park, Chicago, IL' },
  '60657': { lat: 41.9400, lng: -87.6564, name: 'Lakeview, Chicago, IL' },
  '60659': { lat: 41.9891, lng: -87.7046, name: 'West Rogers Park, Chicago, IL' },
  '60660': { lat: 41.9898, lng: -87.6603, name: 'Edgewater, Chicago, IL' },
  '60661': { lat: 41.8826, lng: -87.6458, name: 'Fulton Market, Chicago, IL' },
};

function LocationPicker({ onLocationChange, currentLocation }) {
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const CHICAGO_DEFAULT = {
    lat: 41.8781,
    lng: -87.6298,
    name: 'Chicago, IL',
    zipCode: '60601',
  };

  useEffect(() => {
    // Set Chicago as default if no location is set
    if (!currentLocation) {
      onLocationChange(CHICAGO_DEFAULT);
    }
  }, []);

  const handleZipCodeSubmit = async (e) => {
    e.preventDefault();
    if (!zipCode.trim()) return;

    setLoading(true);
    setError('');

    const cleanZip = zipCode.trim();

    // Check our local database first
    if (ZIP_DATABASE[cleanZip]) {
      const zipData = ZIP_DATABASE[cleanZip];
      onLocationChange({
        lat: zipData.lat,
        lng: zipData.lng,
        name: zipData.name,
        zipCode: cleanZip,
      });
      setLoading(false);
      setZipCode('');
      return;
    }

    // Fallback to geocoding API for other ZIP codes
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${cleanZip}&country=US&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'ByteSizedBusinessBoost/1.0',
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        onLocationChange({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: result.display_name.split(',').slice(0, 2).join(','),
          zipCode: cleanZip,
        });
        setZipCode('');
      } else {
        setError('ZIP code not found. Try a Chicago area ZIP code (60601-60661).');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to find ZIP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const popularZips = [
    { zip: '60601', name: 'Loop' },
    { zip: '60614', name: 'Lincoln Park' },
    { zip: '60622', name: 'Wicker Park' },
    { zip: '60657', name: 'Lakeview' },
    { zip: '60640', name: 'Uptown' },
  ];

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
            {currentLocation ? (
              <>
                {currentLocation.name}
                {currentLocation.zipCode && (
                  <span style={{ marginLeft: '0.5rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                    ({currentLocation.zipCode})
                  </span>
                )}
              </>
            ) : (
              'No location selected'
            )}
          </p>
        </div>

        <form onSubmit={handleZipCodeSubmit} className="flex gap-2" style={{ alignItems: 'center' }}>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => {
              // Only allow numbers, max 5 digits
              const val = e.target.value.replace(/\D/g, '').slice(0, 5);
              setZipCode(val);
            }}
            placeholder="Enter ZIP code"
            className="input"
            style={{ width: '140px', textAlign: 'center', fontSize: '1rem', fontWeight: '600' }}
            disabled={loading}
            maxLength={5}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || zipCode.length !== 5}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            {loading ? '🔄' : '🔍 Search'}
          </button>
        </form>
      </div>

      {/* Quick select popular neighborhoods */}
      <div style={{ marginTop: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginRight: '0.5rem' }}>
          Quick select:
        </span>
        <div style={{ display: 'inline-flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {popularZips.map(({ zip, name }) => (
            <button
              key={zip}
              onClick={() => {
                const zipData = ZIP_DATABASE[zip];
                if (zipData) {
                  onLocationChange({
                    lat: zipData.lat,
                    lng: zipData.lng,
                    name: zipData.name,
                    zipCode: zip,
                  });
                }
              }}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                background: currentLocation?.zipCode === zip ? 'var(--primary-blue)' : 'var(--bg-tertiary)',
                color: currentLocation?.zipCode === zip ? 'white' : 'var(--text-secondary)',
                borderRadius: '999px',
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 'var(--spacing-1)',
            padding: 'var(--spacing-1)',
            background: 'rgba(244, 67, 54, 0.1)',
            borderRadius: 'var(--radius-sm)',
            color: '#f44336',
            fontSize: '0.875rem',
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
