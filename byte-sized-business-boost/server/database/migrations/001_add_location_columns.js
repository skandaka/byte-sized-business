/**
 * Migration: Add latitude and longitude columns to businesses table
 * Also adds location-related indexes for efficient queries
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'business_boost.db');

function runMigration() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to SQLite database');
  });

  db.serialize(() => {
    // Check if columns already exist
    db.all("PRAGMA table_info(businesses)", (err, columns) => {
      if (err) {
        console.error('Error checking table schema:', err);
        db.close();
        return;
      }

      const hasLat = columns.some(col => col.name === 'latitude');
      const hasLng = columns.some(col => col.name === 'longitude');

      if (hasLat && hasLng) {
        console.log('✓ Location columns already exist');
        db.close();
        return;
      }

      // Add latitude and longitude columns
      db.run(`
        ALTER TABLE businesses ADD COLUMN latitude REAL
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding latitude column:', err);
        } else {
          console.log('✓ Added latitude column');
        }
      });

      db.run(`
        ALTER TABLE businesses ADD COLUMN longitude REAL
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding longitude column:', err);
        } else {
          console.log('✓ Added longitude column');
        }
      });

      // Add location-related columns
      db.run(`
        ALTER TABLE businesses ADD COLUMN city TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding city column:', err);
        } else {
          console.log('✓ Added city column');
        }
      });

      db.run(`
        ALTER TABLE businesses ADD COLUMN state TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding state column:', err);
        } else {
          console.log('✓ Added state column');
        }
      });

      db.run(`
        ALTER TABLE businesses ADD COLUMN zip_code TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding zip_code column:', err);
        } else {
          console.log('✓ Added zip_code column');
        }
      });

      // Add external source tracking columns
      db.run(`
        ALTER TABLE businesses ADD COLUMN is_external INTEGER DEFAULT 0
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding is_external column:', err);
        } else {
          console.log('✓ Added is_external column');
        }
      });

      db.run(`
        ALTER TABLE businesses ADD COLUMN external_source TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding external_source column:', err);
        } else {
          console.log('✓ Added external_source column');
        }
      });

      db.run(`
        ALTER TABLE businesses ADD COLUMN external_id TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding external_id column:', err);
        } else {
          console.log('✓ Added external_id column');
        }
      });

      // Add delivery/service options column (JSON string)
      db.run(`
        ALTER TABLE businesses ADD COLUMN delivery_options TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding delivery_options column:', err);
        } else {
          console.log('✓ Added delivery_options column');
        }
      });

      // Create indexes for location-based queries
      setTimeout(() => {
        db.run('CREATE INDEX IF NOT EXISTS idx_businesses_lat ON businesses(latitude)');
        db.run('CREATE INDEX IF NOT EXISTS idx_businesses_lng ON businesses(longitude)');
        db.run('CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city)');
        db.run('CREATE INDEX IF NOT EXISTS idx_businesses_external ON businesses(is_external)');
        console.log('✓ Location indexes created');

        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('\n✅ Migration complete!');
          }
        });
      }, 1000);
    });
  });
}

// Run migration
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
