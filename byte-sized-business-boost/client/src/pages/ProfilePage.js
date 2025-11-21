/**
 * Profile Page
 * User profile with statistics and export functionality (Advanced Feature #11)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserReviews, getUserAnalytics, exportFavorites } from '../utils/api';

function ProfilePage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [reviewsData, analyticsData] = await Promise.all([
        getUserReviews(user.id),
        getUserAnalytics(user.id),
      ]);
      setReviews(reviewsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportFavorites = async () => {
    try {
      const blob = await exportFavorites(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-favorites.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      alert('Favorites exported successfully!');
    } catch (error) {
      console.error('Error exporting favorites:', error);
      alert('Failed to export favorites');
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">My Profile</h1>

      {/* User Info Card */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--primary-blue)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>{user.username}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{user.email}</p>
            <span
              style={{
                background: user.is_admin ? 'var(--warning-yellow)' : 'var(--success-green)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {user.is_admin ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {analytics && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
              {analytics.reviewCount}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Reviews Written</div>
          </div>
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success-green)' }}>
              {analytics.favoriteCount}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Favorite Businesses</div>
          </div>
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning-yellow)' }}>
              {analytics.averageRatingGiven ? analytics.averageRatingGiven.toFixed(1) : '0.0'}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Avg Rating Given</div>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="card p-4 mb-4">
        <h3 className="mb-3">Export Your Data</h3>
        <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
          Download your favorites and review history for your records
        </p>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button onClick={handleExportFavorites} className="btn btn-primary">
            📥 Export Favorites (CSV)
          </button>
          <button className="btn btn-secondary" onClick={() => alert('PDF export coming soon!')}>
            📄 Export Reviews (PDF)
          </button>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="card p-4">
        <h3 className="mb-3">Recent Reviews</h3>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>You haven't written any reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <strong>{review.business_name}</strong>
                    <span
                      className="text-sm"
                      style={{
                        marginLeft: '0.5rem',
                        background: 'var(--bg-tertiary)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {review.category}
                    </span>
                  </div>
                  <span style={{ color: 'var(--warning-yellow)', fontSize: '1.25rem' }}>
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>
                <p>{review.comment}</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
