/**
 * Database Initialization Script
 * Creates all necessary tables for the Byte-Sized Business Boost application
 * Follows the competition requirements for SQLite standalone database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'business_boost.db');

/**
 * Initialize database and create all tables
 * Tables: businesses, users, reviews, favorites, deals, verification_logs
 */
function initializeDatabase() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to SQLite database');
  });

  db.serialize(() => {
    // Businesses table
    db.run(`
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('Food', 'Retail', 'Services', 'Entertainment', 'Health', 'Other')),
        description TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        hours TEXT NOT NULL,
        email TEXT,
        website TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating businesses table:', err);
      else console.log('✓ Businesses table created');
    });

    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        is_verified INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err);
      else console.log('✓ Users table created');
    });

    // Reviews table
    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL CHECK(LENGTH(comment) <= 500),
        helpful_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating reviews table:', err);
      else console.log('✓ Reviews table created');
    });

    // Favorites table
    db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        business_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, business_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating favorites table:', err);
      else console.log('✓ Favorites table created');
    });

    // Deals table
    db.run(`
      CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        discount_code TEXT,
        expiration_date DATETIME NOT NULL,
        terms TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating deals table:', err);
      else console.log('✓ Deals table created');
    });

    // Verification logs table (for bot prevention tracking)
    db.run(`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        verification_type TEXT NOT NULL,
        success INTEGER NOT NULL,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating verification_logs table:', err);
      else console.log('✓ Verification logs table created');
    });

    // Create indexes for better query performance
    db.run('CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category)');
    db.run('CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)');
    db.run('CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_deals_business ON deals(business_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_deals_expiration ON deals(expiration_date)');

    console.log('✓ All indexes created');
  });

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\n✅ Database initialization complete!');
      console.log(`Database location: ${DB_PATH}`);
    }
  });
}

// Run initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, DB_PATH };
