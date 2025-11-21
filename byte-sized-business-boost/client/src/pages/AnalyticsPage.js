/**
 * Analytics Page
 * Platform analytics dashboard with charts (Advanced Feature #10)
 */

import React, { useState, useEffect } from 'react';
import { getAnalyticsOverview, getTopRated, getRatingDistribution } from '../utils/api';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [topRated, setTopRated] = useState([]);
  const [ratingDist, setRatingDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewData, topRatedData, ratingDistData] = await Promise.all([
        getAnalyticsOverview(),
        getTopRated(10),
        getRatingDistribution(),
      ]);

      setOverview(overviewData);
      setTopRated(topRatedData);
      setRatingDist(ratingDistData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="mt-2">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Platform Analytics</h1>

      {/* Stats Cards */}
      {overview && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
              {overview.totalBusinesses}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Businesses</div>
          </div>
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success-green)' }}>
              {overview.totalReviews}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Reviews</div>
          </div>
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning-yellow)' }}>
              {overview.averageRating ? overview.averageRating.toFixed(1) : '0.0'}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Average Rating</div>
          </div>
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--error-red)' }}>
              {overview.totalUsers}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Users</div>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid sm:grid-cols-1 lg:grid-cols-2 mb-4" style={{ gap: 'var(--spacing-3)' }}>
        {/* Category Distribution */}
        <div className="card p-4">
          <h3 className="mb-3">Business Distribution by Category</h3>
          {overview && overview.categoryDistribution && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overview.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {overview.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="card p-4">
          <h3 className="mb-3">Rating Distribution</h3>
          {ratingDist.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" label={{ value: 'Stars', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--warning-yellow)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Rated Businesses */}
      <div className="card p-4">
        <h3 className="mb-3">Top 10 Highest-Rated Businesses</h3>
        {topRated.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topRated} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageRating" fill="var(--primary-blue)" name="Average Rating" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
