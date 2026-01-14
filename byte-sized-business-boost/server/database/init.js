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

    // Deal claims table (tracks usage counter)
    db.run(`
      CREATE TABLE IF NOT EXISTS deal_claims (
        id TEXT PRIMARY KEY,
        deal_id TEXT NOT NULL,
        user_id TEXT,
        claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) console.error('Error creating deal_claims table:', err);
      else console.log('✓ Deal claims table created');
    });

    // User achievements table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        achievement_type TEXT NOT NULL,
        achievement_name TEXT NOT NULL,
        description TEXT,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating user_achievements table:', err);
      else console.log('✓ User achievements table created');
    });

    // Business spotlight table
    db.run(`
      CREATE TABLE IF NOT EXISTS business_spotlight (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        reason TEXT,
        views_count INTEGER DEFAULT 0,
        clicks_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating business_spotlight table:', err);
      else console.log('✓ Business spotlight table created');
    });

    // Community goals table
    db.run(`
      CREATE TABLE IF NOT EXISTS community_goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        target_value INTEGER NOT NULL,
        current_value INTEGER DEFAULT 0,
        goal_type TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating community_goals table:', err);
      else console.log('✓ Community goals table created');
    });

    // User goal contributions table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_goal_contributions (
        id TEXT PRIMARY KEY,
        goal_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        contribution_value INTEGER DEFAULT 1,
        contributed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES community_goals(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating user_goal_contributions table:', err);
      else console.log('✓ User goal contributions table created');
    });

    // Q&A Questions table
    db.run(`
      CREATE TABLE IF NOT EXISTS qna_questions (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        question TEXT NOT NULL,
        is_answered INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating qna_questions table:', err);
      else console.log('✓ Q&A questions table created');
    });

    // Q&A Answers table
    db.run(`
      CREATE TABLE IF NOT EXISTS qna_answers (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        answer TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        is_business_owner INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES qna_questions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating qna_answers table:', err);
      else console.log('✓ Q&A answers table created');
    });

    // User behavior tracking (for AI recommendations)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_behavior (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        business_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        time_spent INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating user_behavior table:', err);
      else console.log('✓ User behavior table created');
    });

    // Search history table
    db.run(`
      CREATE TABLE IF NOT EXISTS search_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        search_query TEXT NOT NULL,
        results_count INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating search_history table:', err);
      else console.log('✓ Search history table created');
    });

    // Business owner claims table
    db.run(`
      CREATE TABLE IF NOT EXISTS business_owner_claims (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        verification_status TEXT DEFAULT 'pending',
        verification_document TEXT,
        claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_at DATETIME,
        UNIQUE(business_id, user_id),
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating business_owner_claims table:', err);
      else console.log('✓ Business owner claims table created');
    });

    // Business announcements table
    db.run(`
      CREATE TABLE IF NOT EXISTS business_announcements (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        announcement_type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating business_announcements table:', err);
      else console.log('✓ Business announcements table created');
    });

    // Review responses table (business owner replies)
    db.run(`
      CREATE TABLE IF NOT EXISTS review_responses (
        id TEXT PRIMARY KEY,
        review_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        response_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating review_responses table:', err);
      else console.log('✓ Review responses table created');
    });

    // User preferences table (for personalization)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        favorite_categories TEXT,
        budget_preference TEXT,
        atmosphere_preference TEXT,
        important_factors TEXT,
        quiz_completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating user_preferences table:', err);
      else console.log('✓ User preferences table created');
    });

    // Create indexes for better query performance
    db.run('CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category)');
    db.run('CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)');
    db.run('CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_deals_business ON deals(business_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_deals_expiration ON deals(expiration_date)');
    db.run('CREATE INDEX IF NOT EXISTS idx_deal_claims_deal ON deal_claims(deal_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_deal_claims_user ON deal_claims(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_spotlight_dates ON business_spotlight(start_date, end_date)');
    db.run('CREATE INDEX IF NOT EXISTS idx_community_goals_active ON community_goals(is_active)');
    db.run('CREATE INDEX IF NOT EXISTS idx_qna_questions_business ON qna_questions(business_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_qna_answers_question ON qna_answers(question_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_user_behavior_user ON user_behavior(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_user_behavior_business ON user_behavior(business_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id)');

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
