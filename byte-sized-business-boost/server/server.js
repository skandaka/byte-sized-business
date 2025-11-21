/**
 * Byte-Sized Business Boost - Express Server
 * FBLA Coding & Programming 2025-2026
 *
 * Technology Justification:
 * - Express.js provides a minimal and flexible Node.js web framework
 * - Non-blocking I/O handles concurrent requests efficiently
 * - Middleware architecture enables modular request processing
 * - RESTful API design follows industry best practices
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import route handlers
const businessRoutes = require('./routes/businesses');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const favoriteRoutes = require('./routes/favorites');
const dealRoutes = require('./routes/deals');
const analyticsRoutes = require('./routes/analytics');

// API Routes
app.use('/api/businesses', businessRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Byte-Sized Business Boost API', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      businesses: '/api/businesses',
      reviews: '/api/reviews',
      auth: '/api/auth',
      favorites: '/api/favorites',
      deals: '/api/deals',
      analytics: '/api/analytics'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error(err.stack);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 Byte-Sized Business Boost Server');
  console.log('=====================================');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  console.log('=====================================\n');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

module.exports = app;
