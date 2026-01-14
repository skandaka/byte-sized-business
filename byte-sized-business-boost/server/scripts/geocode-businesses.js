/**
 * Script to geocode all businesses in the database
 * Adds lat/lng coordinates to existing businesses
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { geocodeAddress } = require('../services/geocoding');

const DB_PATH = path.join(__dirname, '..', 'database', 'business_boost.db');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeAllBusinesses() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to database');
  });

  // Get all businesses without coordinates
  db.all(
    'SELECT id, name, address FROM businesses WHERE latitude IS NULL OR longitude IS NULL',
    async (err, businesses) => {
      if (err) {
        console.error('Error fetching businesses:', err);
        db.close();
        return;
      }

      console.log(`Found ${businesses.length} businesses to geocode`);

      let successCount = 0;
      let failCount = 0;

      for (const business of businesses) {
        console.log(`\nGeocoding: ${business.name}`);
        console.log(`Address: ${business.address}`);

        const coords = await geocodeAddress(business.address);

        if (coords) {
          // Update business with coordinates
          db.run(
            `UPDATE businesses
             SET latitude = ?, longitude = ?, city = ?, state = ?, zip_code = ?
             WHERE id = ?`,
            [coords.lat, coords.lng, coords.city, coords.state, coords.zipCode, business.id],
            (err) => {
              if (err) {
                console.error(`  ✗ Failed to update: ${err.message}`);
                failCount++;
              } else {
                console.log(`  ✓ Updated: ${coords.lat}, ${coords.lng}`);
                if (coords.city) console.log(`    City: ${coords.city}, ${coords.state}`);
                successCount++;
              }
            }
          );
        } else {
          console.log('  ✗ Geocoding failed');
          failCount++;
        }

        // Rate limit: wait 1 second between requests (Nominatim requirement)
        await sleep(1000);
      }

      // Wait for all updates to complete
      setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        console.log(`Geocoding complete!`);
        console.log(`Success: ${successCount}`);
        console.log(`Failed: ${failCount}`);
        console.log('='.repeat(50));
        db.close();
      }, 2000);
    }
  );
}

// Run the script
if (require.main === module) {
  geocodeAllBusinesses();
}

module.exports = { geocodeAllBusinesses };
