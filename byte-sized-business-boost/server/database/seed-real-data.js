/**
 * Database Seed Script - Real Data from Google Places API
 * Populates database with real Chicago businesses
 */

const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const path = require('path');
const { fetchChicagoBusinesses } = require('../services/googlePlaces');

const DB_PATH = path.join(__dirname, 'business_boost.db');

async function seedDatabase() {
  console.log('🌱 Starting database seeding with REAL GOOGLE PLACES DATA...\n');
  console.log('=' .repeat(60));
  
  const db = new sqlite3.Database(DB_PATH);

  return new Promise(async (resolve, reject) => {
    db.serialize(async () => {
      try {
        // Clear existing data
        console.log('\n🗑️  Clearing existing data...');
        db.run('DELETE FROM reviews');
        db.run('DELETE FROM favorites');
        db.run('DELETE FROM deals');
        db.run('DELETE FROM businesses');
        db.run('DELETE FROM users');
        db.run('DELETE FROM verification_logs');
        console.log('✓ Existing data cleared\n');

        // Fetch real businesses from Google Places API
        const realBusinesses = await fetchChicagoBusinesses();

        // Insert real businesses
        console.log('💼 Inserting real businesses into database...');
        const businessIds = [];
        
        const insertBusiness = db.prepare(`
          INSERT INTO businesses (id, name, category, description, address, phone, hours, email, website, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const business of realBusinesses) {
          const id = uuidv4();
          businessIds.push({ id, category: business.category });
          
          insertBusiness.run(
            id,
            business.name,
            business.category,
            business.description,
            business.address,
            business.phone,
            JSON.stringify(business.hours),
            null, // email
            business.website,
            business.image_url
          );
        }

        insertBusiness.finalize();
        console.log(`✓ ${realBusinesses.length} real businesses inserted\n`);

        // Create demo users
        console.log('👥 Creating demo users...');
        const users = [
          { username: 'demo_user', email: 'demo@example.com', password: 'password123', isAdmin: 0 },
          { username: 'admin', email: 'admin@example.com', password: 'admin123', isAdmin: 1 },
          { username: 'john_doe', email: 'john@example.com', password: 'password123', isAdmin: 0 },
          { username: 'jane_smith', email: 'jane@example.com', password: 'password123', isAdmin: 0 }
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
        console.log(`✓ ${users.length} demo users created\n`);

        // Create sample reviews
        console.log('⭐ Adding sample reviews...');
        const reviewComments = [
          'Amazing experience! Highly recommend this place.',
          'Great service and friendly staff. Will definitely come back.',
          'Good quality but a bit pricey. Overall satisfied.',
          'Excellent! Everything was perfect.',
          'Nice place, but could be improved in some areas.',
          'Outstanding service! Exceeded my expectations.',
          'Pretty good, nothing special though.',
          'Love this place! Best in Chicago!',
          'Decent experience. Would visit again.',
          'Fantastic! Can\'t wait to return.'
        ];

        const insertReview = db.prepare(`
          INSERT INTO reviews (id, business_id, user_id, username, rating, comment)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        let reviewCount = 0;
        for (const business of businessIds) {
          // Add 1-3 reviews per business
          const numReviews = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < numReviews; i++) {
            const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
            const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars for realism
            const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
            
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
        console.log(`✓ ${reviewCount} sample reviews added\n`);

        // Create deals for some businesses
        console.log('🎉 Creating special deals...');
        const dealTemplates = [
          { title: '20% Off First Visit', description: 'New customers get 20% off their first visit!' },
          { title: 'Buy One Get One Free', description: 'BOGO on select items this week only!' },
          { title: '10% Student Discount', description: 'Show your student ID for 10% off!' },
          { title: 'Happy Hour Special', description: '50% off during happy hour (3-6 PM)' },
          { title: 'Weekend Special', description: 'Special pricing all weekend long!' }
        ];

        const insertDeal = db.prepare(`
          INSERT INTO deals (id, business_id, title, description, discount_code, expiration_date, terms, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let dealCount = 0;
        // Add deals to 30% of businesses
        for (const business of businessIds) {
          if (Math.random() < 0.3) {
            const deal = dealTemplates[Math.floor(Math.random() * dealTemplates.length)];
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30); // 30 days from now
            
            insertDeal.run(
              uuidv4(),
              business.id,
              deal.title,
              deal.description,
              `DEAL${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              expirationDate.toISOString(),
              'Valid for new and existing customers. Cannot be combined with other offers.',
              1
            );
            dealCount++;
          }
        }

        insertDeal.finalize();
        console.log(`✓ ${dealCount} special deals created\n`);

        console.log('=' .repeat(60));
        console.log('\n✅ DATABASE SUCCESSFULLY SEEDED WITH REAL DATA!');
        console.log(`   - ${realBusinesses.length} real Chicago businesses`);
        console.log(`   - ${users.length} demo users`);
        console.log(`   - ${reviewCount} sample reviews`);
        console.log(`   - ${dealCount} special deals`);
        console.log('\n🎉 Your app now has REAL data from Google Places!\n');

        db.close(() => {
          resolve();
        });

      } catch (error) {
        console.error('\n❌ Error seeding database:', error);
        db.close(() => {
          reject(error);
        });
      }
    });
  });
}

// Run if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
