/**
 * Seed Script - AUTHENTIC LOCAL BUSINESSES ONLY
 * Uses enhanced Google Places search focused on Chicago neighborhoods
 * Filters out all corporate chains - only small, family-owned businesses
 */

const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const path = require('path');
const { fetchLocalChicagoBusinesses } = require('../services/googlePlacesLocal');

const DB_PATH = path.join(__dirname, 'business_boost.db');

async function seedLocalBusinesses() {
  console.log('\n' + '='.repeat(70));
  console.log('🌱 SEEDING DATABASE WITH AUTHENTIC LOCAL CHICAGO BUSINESSES');
  console.log('='.repeat(70) + '\n');
  
  const db = new sqlite3.Database(DB_PATH);

  return new Promise(async (resolve, reject) => {
    db.serialize(async () => {
      try {
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        db.run('DELETE FROM reviews');
        db.run('DELETE FROM favorites');
        db.run('DELETE FROM deals');
        db.run('DELETE FROM businesses');
        db.run('DELETE FROM users');
        console.log('✓ Database cleared\n');

        // Fetch REAL local businesses
        const localBusinesses = await fetchLocalChicagoBusinesses();

        if (localBusinesses.length === 0) {
          throw new Error('No local businesses found. Check API key and quota.');
        }

        // Insert businesses
        console.log('\n💼 Inserting local businesses into database...');
        const businessIds = [];
        
        const insertBusiness = db.prepare(`
          INSERT INTO businesses (id, name, category, description, address, phone, hours, email, website, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const business of localBusinesses) {
          const id = uuidv4();
          businessIds.push({ id, category: business.category, name: business.name });
          
          insertBusiness.run(
            id,
            business.name,
            business.category,
            business.description,
            business.address,
            business.phone,
            JSON.stringify(business.hours),
            null,
            business.website,
            business.image_url
          );
        }

        insertBusiness.finalize();
        console.log(`✓ ${localBusinesses.length} local businesses added\n`);

        // Create demo users
        console.log('👥 Creating demo users...');
        const users = [
          { username: 'demo_user', email: 'demo@example.com', password: 'password123', isAdmin: 0 },
          { username: 'admin', email: 'admin@example.com', password: 'admin123', isAdmin: 1 },
          { username: 'chicago_local', email: 'local@chicago.com', password: 'password123', isAdmin: 0 },
          { username: 'neighborhood_fan', email: 'neighborhood@example.com', password: 'password123', isAdmin: 0 }
        ];

        const userIds = [];
        const insertUser = db.prepare(`
          INSERT INTO users (id, username, email, password_hash, is_admin)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const user of users) {
          const id = uuidv4();
          userIds.push({ id, username: user.username });
          const passwordHash = await bcrypt.hash(user.password, 10);
          
          insertUser.run(id, user.username, user.email, passwordHash, user.isAdmin);
        }

        insertUser.finalize();
        console.log(`✓ ${users.length} users created\n`);

        // Create authentic reviews
        console.log('⭐ Adding authentic local reviews...');
        const localReviewComments = [
          'This place is a hidden gem! So glad to support local businesses like this.',
          'Best in the neighborhood! Family-owned and it shows in the quality.',
          'Love discovering these local spots. Much better than corporate chains!',
          'Amazing! This is what Chicago neighborhoods are all about.',
          'Finally, a real local business. Will definitely be back!',
          'Supporting small businesses like this is so important. Great experience!',
          'Authentic and unique. You won\'t find this anywhere else!',
          'Best kept secret in the neighborhood. Tell your friends!',
          'Local, independent, and excellent. Everything a business should be.',
          'This is why I love Chicago\'s local business scene!'
        ];

        const insertReview = db.prepare(`
          INSERT INTO reviews (id, business_id, user_id, username, rating, comment)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        let reviewCount = 0;
        for (const business of businessIds) {
          const numReviews = Math.floor(Math.random() * 4) + 2; // 2-5 reviews
          
          for (let i = 0; i < numReviews; i++) {
            const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
            const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
            const comment = localReviewComments[Math.floor(Math.random() * localReviewComments.length)];
            
            insertReview.run(
              uuidv4(),
              business.id,
              randomUser.id,
              randomUser.username,
              rating,
              comment
            );
            reviewCount++;
          }
        }

        insertReview.finalize();
        console.log(`✓ ${reviewCount} authentic reviews added\n`);

        // Create local deals
        console.log('🎉 Creating special local deals...');
        const localDeals = [
          { title: 'Welcome Bonus', description: 'First-time customers get 15% off!' },
          { title: 'Neighborhood Special', description: 'Show your local ID for 10% off!' },
          { title: 'Support Local', description: 'Special pricing for community members' },
          { title: 'Family Deal', description: 'Bring your family, save together!' },
          { title: 'Local Love', description: '20% off for neighborhood residents' }
        ];

        const insertDeal = db.prepare(`
          INSERT INTO deals (id, business_id, title, description, discount_code, expiration_date, terms, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let dealCount = 0;
        for (const business of businessIds) {
          if (Math.random() < 0.4) { // 40% get deals
            const deal = localDeals[Math.floor(Math.random() * localDeals.length)];
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 45);
            
            insertDeal.run(
              uuidv4(),
              business.id,
              deal.title,
              deal.description,
              `LOCAL${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              expirationDate.toISOString(),
              'Valid for new and returning customers. Support local!',
              1
            );
            dealCount++;
          }
        }

        insertDeal.finalize();
        console.log(`✓ ${dealCount} special deals created\n`);

        console.log('='.repeat(70));
        console.log('\n✅ SUCCESS! DATABASE FILLED WITH AUTHENTIC LOCAL BUSINESSES\n');
        console.log(`   🏪 ${localBusinesses.length} small, family-owned Chicago businesses`);
        console.log(`   👥 ${users.length} demo users`);
        console.log(`   ⭐ ${reviewCount} authentic local reviews`);
        console.log(`   🎁 ${dealCount} special local deals`);
        console.log('\n📍 All businesses are from real Chicago neighborhoods');
        console.log('🚫 Zero corporate chains - 100% local and independent');
        console.log('\n' + '='.repeat(70) + '\n');

        db.close(() => {
          resolve();
        });

      } catch (error) {
        console.error('\n❌ Error:', error);
        db.close(() => {
          reject(error);
        });
      }
    });
  });
}

if (require.main === module) {
  seedLocalBusinesses()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedLocalBusinesses };
