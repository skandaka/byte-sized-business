/**
 * Fix business images to use reliable Unsplash placeholder images
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/business_boost.db');

// Reliable Unsplash images by category
const categoryImages = {
  'Food': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop',
  ],
  'Retail': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop',
  ],
  'Services': [
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
  ],
  'Entertainment': [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
  ],
  'Health': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519415943484-9fa1882c1a09?w=800&h=600&fit=crop',
  ],
  'Other': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
  ],
};

const db = new sqlite3.Database(DB_PATH);

db.all('SELECT id, name, category, image_url FROM businesses', [], (err, businesses) => {
  if (err) {
    console.error('Error fetching businesses:', err);
    process.exit(1);
  }

  console.log(`Found ${businesses.length} businesses to update`);

  let updatedCount = 0;
  const categoryCounters = {};

  businesses.forEach((business, index) => {
    const category = business.category || 'Other';
    const images = categoryImages[category] || categoryImages['Other'];
    
    // Get next image index for this category
    categoryCounters[category] = (categoryCounters[category] || 0) % images.length;
    const newImageUrl = images[categoryCounters[category]];
    categoryCounters[category]++;

    db.run(
      'UPDATE businesses SET image_url = ? WHERE id = ?',
      [newImageUrl, business.id],
      function(updateErr) {
        if (updateErr) {
          console.error(`Error updating ${business.name}:`, updateErr);
        } else {
          updatedCount++;
          console.log(`✓ Updated: ${business.name} (${category})`);
        }

        if (index === businesses.length - 1) {
          console.log(`\n✅ Updated ${updatedCount} businesses with reliable images!`);
          db.close();
        }
      }
    );
  });
});
