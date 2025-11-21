/**
 * Database Seed Script
 * Populates database with demo data for FBLA competition
 * - 30 sample businesses across 6 categories
 * - Demo users with different roles
 * - Realistic reviews with varied ratings
 * - 20 active deals with expiration dates
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { DB_PATH } = require('./init');

const db = new sqlite3.Database(DB_PATH);

// Demo users
const DEMO_USERS = [
  {
    id: uuidv4(),
    username: 'demo_user',
    email: 'user@demo.com',
    password: 'Demo123!',
    is_admin: 0
  },
  {
    id: uuidv4(),
    username: 'admin_user',
    email: 'admin@demo.com',
    password: 'Admin123!',
    is_admin: 1
  },
  {
    id: uuidv4(),
    username: 'test_user',
    email: 'test@demo.com',
    password: 'Test123!',
    is_admin: 0
  },
  {
    id: uuidv4(),
    username: 'Sarah_M',
    email: 'sarah@example.com',
    password: 'User123!',
    is_admin: 0
  },
  {
    id: uuidv4(),
    username: 'Mike_Johnson',
    email: 'mike@example.com',
    password: 'User123!',
    is_admin: 0
  },
  {
    id: uuidv4(),
    username: 'Emily_Chen',
    email: 'emily@example.com',
    password: 'User123!',
    is_admin: 0
  }
];

// 30 Sample businesses
const BUSINESSES = [
  // FOOD (8 businesses)
  {
    id: uuidv4(),
    name: 'Downtown Coffee House',
    category: 'Food',
    description: 'Artisan coffee and pastries in the heart of downtown. We source our beans from sustainable farms and roast them fresh daily. Our cozy atmosphere makes it perfect for work or catching up with friends. Try our signature lavender latte!',
    address: '123 Main St, Chicago, IL 60601',
    phone: '(312) 555-0100',
    hours: JSON.stringify({
      monday: { open: '7:00 AM', close: '7:00 PM' },
      tuesday: { open: '7:00 AM', close: '7:00 PM' },
      wednesday: { open: '7:00 AM', close: '7:00 PM' },
      thursday: { open: '7:00 AM', close: '7:00 PM' },
      friday: { open: '7:00 AM', close: '8:00 PM' },
      saturday: { open: '8:00 AM', close: '8:00 PM' },
      sunday: { open: '8:00 AM', close: '6:00 PM' }
    }),
    email: 'info@downtowncoffee.com',
    website: 'https://downtowncoffee.com',
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'
  },
  {
    id: uuidv4(),
    name: 'Mama Mia Pizzeria',
    category: 'Food',
    description: 'Family-owned authentic Italian pizzeria serving Chicago since 1985. Our wood-fired pizzas use recipes passed down through three generations. Everything is made from scratch daily, including our famous marinara sauce. Dine-in or takeout available.',
    address: '456 Oak Avenue, Chicago, IL 60602',
    phone: '(312) 555-0101',
    hours: JSON.stringify({
      monday: { open: '11:00 AM', close: '10:00 PM' },
      tuesday: { open: '11:00 AM', close: '10:00 PM' },
      wednesday: { open: '11:00 AM', close: '10:00 PM' },
      thursday: { open: '11:00 AM', close: '10:00 PM' },
      friday: { open: '11:00 AM', close: '11:00 PM' },
      saturday: { open: '11:00 AM', close: '11:00 PM' },
      sunday: { open: '12:00 PM', close: '9:00 PM' }
    }),
    email: 'orders@mamamiapizza.com',
    website: 'https://mamamiapizza.com',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591'
  },
  {
    id: uuidv4(),
    name: 'Green Leaf Organic Cafe',
    category: 'Food',
    description: 'Health-conscious cafe specializing in organic, locally-sourced ingredients. Our menu features vegan and gluten-free options, fresh smoothie bowls, and farm-to-table salads. We partner with local farmers to bring you the freshest seasonal produce.',
    address: '789 Elm Street, Chicago, IL 60603',
    phone: '(312) 555-0102',
    hours: JSON.stringify({
      monday: { open: '8:00 AM', close: '6:00 PM' },
      tuesday: { open: '8:00 AM', close: '6:00 PM' },
      wednesday: { open: '8:00 AM', close: '6:00 PM' },
      thursday: { open: '8:00 AM', close: '6:00 PM' },
      friday: { open: '8:00 AM', close: '6:00 PM' },
      saturday: { open: '9:00 AM', close: '5:00 PM' },
      sunday: { open: '9:00 AM', close: '4:00 PM' }
    }),
    email: 'hello@greenleafcafe.com',
    website: 'https://greenleafcafe.com',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'
  },
  {
    id: uuidv4(),
    name: 'The Burger Joint',
    category: 'Food',
    description: 'Gourmet burgers with a creative twist! We use premium grass-fed beef and offer unique toppings like truffle aioli and caramelized onions. Our hand-cut fries are legendary. Vegetarian and turkey burger options available.',
    address: '321 Pine Road, Chicago, IL 60604',
    phone: '(312) 555-0103',
    hours: JSON.stringify({
      monday: { open: '11:00 AM', close: '9:00 PM' },
      tuesday: { open: '11:00 AM', close: '9:00 PM' },
      wednesday: { open: '11:00 AM', close: '9:00 PM' },
      thursday: { open: '11:00 AM', close: '9:00 PM' },
      friday: { open: '11:00 AM', close: '10:00 PM' },
      saturday: { open: '11:00 AM', close: '10:00 PM' },
      sunday: { open: '12:00 PM', close: '8:00 PM' }
    }),
    email: 'eat@burgerjoint.com',
    website: 'https://burgerjoint.com',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
  },
  {
    id: uuidv4(),
    name: 'Sweet Tooth Bakery',
    category: 'Food',
    description: 'Artisanal bakery specializing in custom cakes, fresh pastries, and European-style breads. Our award-winning croissants are baked fresh every morning. We also create custom celebration cakes for any occasion. Stop by for our daily specials!',
    address: '654 Maple Drive, Chicago, IL 60605',
    phone: '(312) 555-0104',
    hours: JSON.stringify({
      monday: { open: '6:00 AM', close: '6:00 PM' },
      tuesday: { open: '6:00 AM', close: '6:00 PM' },
      wednesday: { open: '6:00 AM', close: '6:00 PM' },
      thursday: { open: '6:00 AM', close: '6:00 PM' },
      friday: { open: '6:00 AM', close: '7:00 PM' },
      saturday: { open: '7:00 AM', close: '7:00 PM' },
      sunday: { open: '7:00 AM', close: '5:00 PM' }
    }),
    email: 'orders@sweettoothbakery.com',
    website: 'https://sweettoothbakery.com',
    image_url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f'
  },
  {
    id: uuidv4(),
    name: 'Sushi Paradise',
    category: 'Food',
    description: 'Authentic Japanese cuisine with fresh sushi, sashimi, and traditional ramen bowls. Our head chef trained in Tokyo for 15 years. We receive daily fish deliveries to ensure the highest quality. Try our omakase for an unforgettable experience.',
    address: '987 Cedar Lane, Chicago, IL 60606',
    phone: '(312) 555-0105',
    hours: JSON.stringify({
      monday: { open: 'Closed', close: 'Closed' },
      tuesday: { open: '11:30 AM', close: '10:00 PM' },
      wednesday: { open: '11:30 AM', close: '10:00 PM' },
      thursday: { open: '11:30 AM', close: '10:00 PM' },
      friday: { open: '11:30 AM', close: '11:00 PM' },
      saturday: { open: '12:00 PM', close: '11:00 PM' },
      sunday: { open: '12:00 PM', close: '9:00 PM' }
    }),
    email: 'reservations@sushiparadise.com',
    website: 'https://sushiparadise.com',
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351'
  },
  {
    id: uuidv4(),
    name: 'Taco Fiesta',
    category: 'Food',
    description: 'Vibrant Mexican street food with authentic flavors and fresh ingredients. Our tacos are made with handmade tortillas and traditional recipes from Oaxaca. Try our famous fish tacos and house-made salsas ranging from mild to extra spicy!',
    address: '246 Birch Street, Chicago, IL 60607',
    phone: '(312) 555-0106',
    hours: JSON.stringify({
      monday: { open: '11:00 AM', close: '9:00 PM' },
      tuesday: { open: '11:00 AM', close: '9:00 PM' },
      wednesday: { open: '11:00 AM', close: '9:00 PM' },
      thursday: { open: '11:00 AM', close: '9:00 PM' },
      friday: { open: '11:00 AM', close: '10:00 PM' },
      saturday: { open: '10:00 AM', close: '10:00 PM' },
      sunday: { open: '10:00 AM', close: '9:00 PM' }
    }),
    email: 'hola@tacofiesta.com',
    website: 'https://tacofiesta.com',
    image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b'
  },
  {
    id: uuidv4(),
    name: 'The Tea Garden',
    category: 'Food',
    description: 'Tranquil tea house offering over 100 premium loose-leaf teas from around the world. Enjoy traditional afternoon tea service with homemade scones and finger sandwiches. Our knowledgeable staff can help you find your perfect brew.',
    address: '135 Willow Way, Chicago, IL 60608',
    phone: '(312) 555-0107',
    hours: JSON.stringify({
      monday: { open: '9:00 AM', close: '7:00 PM' },
      tuesday: { open: '9:00 AM', close: '7:00 PM' },
      wednesday: { open: '9:00 AM', close: '7:00 PM' },
      thursday: { open: '9:00 AM', close: '7:00 PM' },
      friday: { open: '9:00 AM', close: '8:00 PM' },
      saturday: { open: '10:00 AM', close: '8:00 PM' },
      sunday: { open: '10:00 AM', close: '6:00 PM' }
    }),
    email: 'info@teagarden.com',
    website: 'https://teagarden.com',
    image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9'
  },

  // RETAIL (7 businesses)
  {
    id: uuidv4(),
    name: 'The Book Nook',
    category: 'Retail',
    description: 'Independent bookstore featuring carefully curated selections of fiction, non-fiction, and local authors. We host weekly book clubs and author signings. Our cozy reading corner with coffee makes browsing a pleasure. Special orders always welcome.',
    address: '468 Story Lane, Chicago, IL 60609',
    phone: '(312) 555-0108',
    hours: JSON.stringify({
      monday: { open: '10:00 AM', close: '8:00 PM' },
      tuesday: { open: '10:00 AM', close: '8:00 PM' },
      wednesday: { open: '10:00 AM', close: '8:00 PM' },
      thursday: { open: '10:00 AM', close: '8:00 PM' },
      friday: { open: '10:00 AM', close: '9:00 PM' },
      saturday: { open: '9:00 AM', close: '9:00 PM' },
      sunday: { open: '11:00 AM', close: '6:00 PM' }
    }),
    email: 'info@booknook.com',
    website: 'https://booknook.com',
    image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794'
  },
  {
    id: uuidv4(),
    name: 'Vintage Threads',
    category: 'Retail',
    description: 'Curated vintage clothing boutique specializing in 1960s-1990s fashion. Each piece is hand-selected for quality and style. From retro band tees to elegant vintage dresses, we have something unique for everyone. New arrivals every week!',
    address: '753 Fashion Ave, Chicago, IL 60610',
    phone: '(312) 555-0109',
    hours: JSON.stringify({
      monday: { open: 'Closed', close: 'Closed' },
      tuesday: { open: '11:00 AM', close: '7:00 PM' },
      wednesday: { open: '11:00 AM', close: '7:00 PM' },
      thursday: { open: '11:00 AM', close: '7:00 PM' },
      friday: { open: '11:00 AM', close: '8:00 PM' },
      saturday: { open: '10:00 AM', close: '8:00 PM' },
      sunday: { open: '12:00 PM', close: '6:00 PM' }
    }),
    email: 'shop@vintagethreads.com',
    website: 'https://vintagethreads.com',
    image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04'
  },
  {
    id: uuidv4(),
    name: 'Artisan Gift Gallery',
    category: 'Retail',
    description: 'Local artisan marketplace showcasing handmade pottery, jewelry, art prints, and home decor from over 50 Chicago-area artists. Perfect for unique gifts and supporting local creators. Custom orders and gift wrapping available.',
    address: '852 Craft Circle, Chicago, IL 60611',
    phone: '(312) 555-0110',
    hours: JSON.stringify({
      monday: { open: '10:00 AM', close: '6:00 PM' },
      tuesday: { open: '10:00 AM', close: '6:00 PM' },
      wednesday: { open: '10:00 AM', close: '6:00 PM' },
      thursday: { open: '10:00 AM', close: '6:00 PM' },
      friday: { open: '10:00 AM', close: '7:00 PM' },
      saturday: { open: '10:00 AM', close: '7:00 PM' },
      sunday: { open: '11:00 AM', close: '5:00 PM' }
    }),
    email: 'hello@artisangallery.com',
    website: 'https://artisangallery.com',
    image_url: 'https://images.unsplash.com/photo-1514498961774-2a0dd8f0f336'
  },
  {
    id: uuidv4(),
    name: 'Tech Haven',
    category: 'Retail',
    description: 'Local electronics and gadget store offering personalized service and expert advice. We repair smartphones, tablets, and computers. Browse our selection of accessories, smart home devices, and the latest tech. Free diagnostics on all repairs.',
    address: '951 Circuit Street, Chicago, IL 60612',
    phone: '(312) 555-0111',
    hours: JSON.stringify({
      monday: { open: '9:00 AM', close: '7:00 PM' },
      tuesday: { open: '9:00 AM', close: '7:00 PM' },
      wednesday: { open: '9:00 AM', close: '7:00 PM' },
      thursday: { open: '9:00 AM', close: '7:00 PM' },
      friday: { open: '9:00 AM', close: '8:00 PM' },
      saturday: { open: '10:00 AM', close: '6:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    }),
    email: 'support@techhaven.com',
    website: 'https://techhaven.com',
    image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661'
  },
  {
    id: uuidv4(),
    name: 'Plant Paradise',
    category: 'Retail',
    description: 'Urban plant shop specializing in houseplants, succulents, and gardening supplies. Our plant experts provide care advice and workshops on plant parenthood. From beginner-friendly pothos to rare philodendrons, we help you grow your green thumb.',
    address: '357 Green Thumb Blvd, Chicago, IL 60613',
    phone: '(312) 555-0112',
    hours: JSON.stringify({
      monday: { open: '10:00 AM', close: '6:00 PM' },
      tuesday: { open: '10:00 AM', close: '6:00 PM' },
      wednesday: { open: '10:00 AM', close: '6:00 PM' },
      thursday: { open: '10:00 AM', close: '6:00 PM' },
      friday: { open: '10:00 AM', close: '7:00 PM' },
      saturday: { open: '9:00 AM', close: '7:00 PM' },
      sunday: { open: '10:00 AM', close: '5:00 PM' }
    }),
    email: 'grow@plantparadise.com',
    website: 'https://plantparadise.com',
    image_url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8'
  },
  {
    id: uuidv4(),
    name: 'Sneaker Vault',
    category: 'Retail',
    description: 'Premium sneaker boutique featuring limited editions, collectibles, and streetwear. We authenticate all products and offer consignment services. From classic Jordans to the latest drops, sneakerheads will find their grails here.',
    address: '741 Kicks Avenue, Chicago, IL 60614',
    phone: '(312) 555-0113',
    hours: JSON.stringify({
      monday: { open: '11:00 AM', close: '8:00 PM' },
      tuesday: { open: '11:00 AM', close: '8:00 PM' },
      wednesday: { open: '11:00 AM', close: '8:00 PM' },
      thursday: { open: '11:00 AM', close: '8:00 PM' },
      friday: { open: '11:00 AM', close: '9:00 PM' },
      saturday: { open: '10:00 AM', close: '9:00 PM' },
      sunday: { open: '12:00 PM', close: '7:00 PM' }
    }),
    email: 'shop@sneakervault.com',
    website: 'https://sneakervault.com',
    image_url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2'
  },
  {
    id: uuidv4(),
    name: 'Vinyl Records & More',
    category: 'Retail',
    description: 'Record store paradise for music lovers! Browse thousands of new and used vinyl records across all genres. We also sell turntables, speakers, and accessories. Listening stations available to preview before you buy. Trade-ins welcome.',
    address: '159 Melody Lane, Chicago, IL 60615',
    phone: '(312) 555-0114',
    hours: JSON.stringify({
      monday: { open: '11:00 AM', close: '7:00 PM' },
      tuesday: { open: '11:00 AM', close: '7:00 PM' },
      wednesday: { open: '11:00 AM', close: '7:00 PM' },
      thursday: { open: '11:00 AM', close: '8:00 PM' },
      friday: { open: '11:00 AM', close: '8:00 PM' },
      saturday: { open: '10:00 AM', close: '8:00 PM' },
      sunday: { open: '12:00 PM', close: '6:00 PM' }
    }),
    email: 'info@vinylrecords.com',
    website: 'https://vinylrecords.com',
    image_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'
  },

  // SERVICES (6 businesses)
  {
    id: uuidv4(),
    name: 'Pristine Auto Detailing',
    category: 'Services',
    description: 'Professional car detailing and cleaning services. We offer interior deep cleaning, exterior waxing, paint correction, and ceramic coating. Our eco-friendly products are safe for your vehicle and the environment. Mobile service available.',
    address: '852 Motor Way, Chicago, IL 60616',
    phone: '(312) 555-0115',
    hours: JSON.stringify({
      monday: { open: '8:00 AM', close: '6:00 PM' },
      tuesday: { open: '8:00 AM', close: '6:00 PM' },
      wednesday: { open: '8:00 AM', close: '6:00 PM' },
      thursday: { open: '8:00 AM', close: '6:00 PM' },
      friday: { open: '8:00 AM', close: '6:00 PM' },
      saturday: { open: '9:00 AM', close: '5:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    }),
    email: 'book@pristineauto.com',
    website: 'https://pristineauto.com',
    image_url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f'
  },
  {
    id: uuidv4(),
    name: 'Glamour Hair Salon',
    category: 'Services',
    description: 'Full-service hair salon offering cuts, color, styling, and treatments. Our talented stylists stay current with the latest trends and techniques. We use premium products and provide personalized consultations. First-time clients get 20% off!',
    address: '753 Beauty Boulevard, Chicago, IL 60617',
    phone: '(312) 555-0116',
    hours: JSON.stringify({
      monday: { open: 'Closed', close: 'Closed' },
      tuesday: { open: '9:00 AM', close: '8:00 PM' },
      wednesday: { open: '9:00 AM', close: '8:00 PM' },
      thursday: { open: '9:00 AM', close: '8:00 PM' },
      friday: { open: '9:00 AM', close: '8:00 PM' },
      saturday: { open: '8:00 AM', close: '6:00 PM' },
      sunday: { open: '10:00 AM', close: '5:00 PM' }
    }),
    email: 'appointments@glamourhair.com',
    website: 'https://glamourhair.com',
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035'
  },
  {
    id: uuidv4(),
    name: 'QuickFix Phone Repair',
    category: 'Services',
    description: 'Fast and affordable phone and tablet repair. We fix cracked screens, battery replacements, and water damage. Most repairs completed in under an hour. We service all major brands with a 90-day warranty on parts and labor.',
    address: '456 Repair Road, Chicago, IL 60618',
    phone: '(312) 555-0117',
    hours: JSON.stringify({
      monday: { open: '10:00 AM', close: '7:00 PM' },
      tuesday: { open: '10:00 AM', close: '7:00 PM' },
      wednesday: { open: '10:00 AM', close: '7:00 PM' },
      thursday: { open: '10:00 AM', close: '7:00 PM' },
      friday: { open: '10:00 AM', close: '7:00 PM' },
      saturday: { open: '10:00 AM', close: '6:00 PM' },
      sunday: { open: '11:00 AM', close: '5:00 PM' }
    }),
    email: 'help@quickfixrepair.com',
    website: 'https://quickfixrepair.com',
    image_url: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845'
  },
  {
    id: uuidv4(),
    name: 'Paws & Claws Pet Grooming',
    category: 'Services',
    description: 'Professional pet grooming services for dogs and cats of all sizes. Our gentle groomers provide baths, haircuts, nail trimming, and ear cleaning. We use natural, hypoallergenic products. Your furry friend will leave looking and smelling amazing!',
    address: '321 Pet Place, Chicago, IL 60619',
    phone: '(312) 555-0118',
    hours: JSON.stringify({
      monday: { open: '8:00 AM', close: '5:00 PM' },
      tuesday: { open: '8:00 AM', close: '5:00 PM' },
      wednesday: { open: '8:00 AM', close: '5:00 PM' },
      thursday: { open: '8:00 AM', close: '5:00 PM' },
      friday: { open: '8:00 AM', close: '5:00 PM' },
      saturday: { open: '9:00 AM', close: '4:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    }),
    email: 'woof@pawsandclaws.com',
    website: 'https://pawsandclaws.com',
    image_url: 'https://images.unsplash.com/photo-1600456899121-68eda5705257'
  },
  {
    id: uuidv4(),
    name: 'Elite Dry Cleaners',
    category: 'Services',
    description: 'Premium dry cleaning and laundry services with same-day turnaround available. We specialize in delicate fabrics, wedding gowns, and leather care. Our eco-friendly cleaning process is gentle on clothes and the planet. Free pickup and delivery!',
    address: '789 Clean Street, Chicago, IL 60620',
    phone: '(312) 555-0119',
    hours: JSON.stringify({
      monday: { open: '7:00 AM', close: '7:00 PM' },
      tuesday: { open: '7:00 AM', close: '7:00 PM' },
      wednesday: { open: '7:00 AM', close: '7:00 PM' },
      thursday: { open: '7:00 AM', close: '7:00 PM' },
      friday: { open: '7:00 AM', close: '7:00 PM' },
      saturday: { open: '8:00 AM', close: '5:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    }),
    email: 'service@elitecleaners.com',
    website: 'https://elitecleaners.com',
    image_url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c'
  },
  {
    id: uuidv4(),
    name: 'HomeServe Handyman',
    category: 'Services',
    description: 'Reliable handyman services for all your home repair needs. From plumbing and electrical to painting and furniture assembly, we do it all. Licensed, insured, and background-checked professionals. Free estimates and flexible scheduling.',
    address: '147 Fix-It Lane, Chicago, IL 60621',
    phone: '(312) 555-0120',
    hours: JSON.stringify({
      monday: { open: '8:00 AM', close: '6:00 PM' },
      tuesday: { open: '8:00 AM', close: '6:00 PM' },
      wednesday: { open: '8:00 AM', close: '6:00 PM' },
      thursday: { open: '8:00 AM', close: '6:00 PM' },
      friday: { open: '8:00 AM', close: '6:00 PM' },
      saturday: { open: '9:00 AM', close: '3:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    }),
    email: 'contact@homeserve.com',
    website: 'https://homeserve.com',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952'
  },

  // ENTERTAINMENT (5 businesses)
  {
    id: uuidv4(),
    name: 'Starlight Cinema',
    category: 'Entertainment',
    description: 'Independent movie theater showcasing indie films, documentaries, and classic cinema. Our intimate venue features comfortable seating and a curated selection you won\'t find at big chains. Concessions include local craft beer and gourmet popcorn.',
    address: '369 Film Street, Chicago, IL 60622',
    phone: '(312) 555-0121',
    hours: JSON.stringify({
      monday: { open: '12:00 PM', close: '11:00 PM' },
      tuesday: { open: '12:00 PM', close: '11:00 PM' },
      wednesday: { open: '12:00 PM', close: '11:00 PM' },
      thursday: { open: '12:00 PM', close: '11:00 PM' },
      friday: { open: '12:00 PM', close: '12:00 AM' },
      saturday: { open: '10:00 AM', close: '12:00 AM' },
      sunday: { open: '10:00 AM', close: '11:00 PM' }
    }),
    email: 'tickets@starlightcinema.com',
    website: 'https://starlightcinema.com',
    image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1'
  },
  {
    id: uuidv4(),
    name: 'The Puzzle Palace',
    category: 'Entertainment',
    description: 'Escape room adventure center with 5 immersive themed rooms. Perfect for team building, date nights, or friends looking for a challenge. Rooms range from beginner to expert difficulty. Book online and test your problem-solving skills!',
    address: '258 Mystery Ave, Chicago, IL 60623',
    phone: '(312) 555-0122',
    hours: JSON.stringify({
      monday: { open: 'Closed', close: 'Closed' },
      tuesday: { open: 'Closed', close: 'Closed' },
      wednesday: { open: '3:00 PM', close: '10:00 PM' },
      thursday: { open: '3:00 PM', close: '10:00 PM' },
      friday: { open: '3:00 PM', close: '11:00 PM' },
      saturday: { open: '10:00 AM', close: '11:00 PM' },
      sunday: { open: '10:00 AM', close: '8:00 PM' }
    }),
    email: 'book@puzzlepalace.com',
    website: 'https://puzzlepalace.com',
    image_url: 'https://images.unsplash.com/photo-1604599315908-94e39e6d0e05'
  },
  {
    id: uuidv4(),
    name: 'Retro Arcade Lounge',
    category: 'Entertainment',
    description: 'Nostalgic arcade featuring classic games from the 80s and 90s. All games are set to free-play with entrance fee. Full bar serving craft cocktails and local beers. Host your next party in our private event space!',
    address: '951 Joystick Junction, Chicago, IL 60624',
    phone: '(312) 555-0123',
    hours: JSON.stringify({
      monday: { open: 'Closed', close: 'Closed' },
      tuesday: { open: 'Closed', close: 'Closed' },
      wednesday: { open: '5:00 PM', close: '12:00 AM' },
      thursday: { open: '5:00 PM', close: '12:00 AM' },
      friday: { open: '5:00 PM', close: '2:00 AM' },
      saturday: { open: '12:00 PM', close: '2:00 AM' },
      sunday: { open: '12:00 PM', close: '10:00 PM' }
    }),
    email: 'play@retroarcade.com',
    website: 'https://retroarcade.com',
    image_url: 'https://images.unsplash.com/photo-1511882150382-421056c89033'
  },
  {
    id: uuidv4(),
    name: 'Canvas & Cork',
    category: 'Entertainment',
    description: 'Paint and sip studio where creativity meets relaxation. No experience necessary - our instructors guide you step-by-step. BYOB or purchase wine from our selection. Perfect for girls\' night, date night, or solo creativity time!',
    address: '753 Artist Alley, Chicago, IL 60625',
    phone: '(312) 555-0124',
    hours: JSON.stringify({
      monday: { open: 'Closed', close: 'Closed' },
      tuesday: { open: 'Closed', close: 'Closed' },
      wednesday: { open: '6:00 PM', close: '9:00 PM' },
      thursday: { open: '6:00 PM', close: '9:00 PM' },
      friday: { open: '6:00 PM', close: '10:00 PM' },
      saturday: { open: '2:00 PM', close: '10:00 PM' },
      sunday: { open: '2:00 PM', close: '8:00 PM' }
    }),
    email: 'create@canvasandcork.com',
    website: 'https://canvasandcork.com',
    image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b'
  },
  {
    id: uuidv4(),
    name: 'Urban Bowling Alley',
    category: 'Entertainment',
    description: 'Modern bowling alley with 16 lanes, arcade games, and full-service restaurant. Cosmic bowling on weekends with blacklights and DJ. League nights available. Perfect for birthday parties and corporate events. Online reservations recommended.',
    address: '456 Strike Street, Chicago, IL 60626',
    phone: '(312) 555-0125',
    hours: JSON.stringify({
      monday: { open: '4:00 PM', close: '11:00 PM' },
      tuesday: { open: '4:00 PM', close: '11:00 PM' },
      wednesday: { open: '4:00 PM', close: '11:00 PM' },
      thursday: { open: '4:00 PM', close: '11:00 PM' },
      friday: { open: '4:00 PM', close: '1:00 AM' },
      saturday: { open: '10:00 AM', close: '1:00 AM' },
      sunday: { open: '10:00 AM', close: '11:00 PM' }
    }),
    email: 'reservations@urbanbowling.com',
    website: 'https://urbanbowling.com',
    image_url: 'https://images.unsplash.com/photo-1548630826-2ec01a41f48f'
  },

  // HEALTH (4 businesses)
  {
    id: uuidv4(),
    name: 'FitLife Gym',
    category: 'Health',
    description: 'State-of-the-art fitness center with cardio equipment, free weights, and group classes. Personal training available. Amenities include locker rooms, showers, and smoothie bar. 24/7 access for members. Try your first week free!',
    address: '147 Muscle Avenue, Chicago, IL 60627',
    phone: '(312) 555-0126',
    hours: JSON.stringify({
      monday: { open: '24 Hours', close: '24 Hours' },
      tuesday: { open: '24 Hours', close: '24 Hours' },
      wednesday: { open: '24 Hours', close: '24 Hours' },
      thursday: { open: '24 Hours', close: '24 Hours' },
      friday: { open: '24 Hours', close: '24 Hours' },
      saturday: { open: '24 Hours', close: '24 Hours' },
      sunday: { open: '24 Hours', close: '24 Hours' }
    }),
    email: 'join@fitlifegym.com',
    website: 'https://fitlifegym.com',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'
  },
  {
    id: uuidv4(),
    name: 'Zen Yoga Studio',
    category: 'Health',
    description: 'Peaceful yoga and meditation studio offering classes for all levels. From gentle restorative yoga to power vinyasa flow, we have something for everyone. Experienced instructors in a serene environment. First class is always free!',
    address: '369 Namaste Lane, Chicago, IL 60628',
    phone: '(312) 555-0127',
    hours: JSON.stringify({
      monday: { open: '6:00 AM', close: '8:00 PM' },
      tuesday: { open: '6:00 AM', close: '8:00 PM' },
      wednesday: { open: '6:00 AM', close: '8:00 PM' },
      thursday: { open: '6:00 AM', close: '8:00 PM' },
      friday: { open: '6:00 AM', close: '7:00 PM' },
      saturday: { open: '8:00 AM', close: '6:00 PM' },
      sunday: { open: '8:00 AM', close: '6:00 PM' }
    }),
    email: 'om@zenyoga.com',
    website: 'https://zenyoga.com',
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773'
  },
  {
    id: uuidv4(),
    name: 'Serenity Day Spa',
    category: 'Health',
    description: 'Luxury day spa offering massages, facials, body treatments, and nail services. Our licensed therapists use premium organic products. Escape the stress of daily life in our tranquil oasis. Couples packages and gift certificates available.',
    address: '852 Relaxation Road, Chicago, IL 60629',
    phone: '(312) 555-0128',
    hours: JSON.stringify({
      monday: { open: '9:00 AM', close: '8:00 PM' },
      tuesday: { open: '9:00 AM', close: '8:00 PM' },
      wednesday: { open: '9:00 AM', close: '8:00 PM' },
      thursday: { open: '9:00 AM', close: '8:00 PM' },
      friday: { open: '9:00 AM', close: '8:00 PM' },
      saturday: { open: '8:00 AM', close: '7:00 PM' },
      sunday: { open: '10:00 AM', close: '6:00 PM' }
    }),
    email: 'book@serenityspa.com',
    website: 'https://serenityspa.com',
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef'
  },
  {
    id: uuidv4(),
    name: 'Vitality Nutrition Center',
    category: 'Health',
    description: 'Health food store and juice bar specializing in supplements, organic groceries, and fresh-pressed juices. Our certified nutritionists offer free consultations. Shop vitamins, protein powders, healthy snacks, and wellness products.',
    address: '741 Wellness Way, Chicago, IL 60630',
    phone: '(312) 555-0129',
    hours: JSON.stringify({
      monday: { open: '8:00 AM', close: '7:00 PM' },
      tuesday: { open: '8:00 AM', close: '7:00 PM' },
      wednesday: { open: '8:00 AM', close: '7:00 PM' },
      thursday: { open: '8:00 AM', close: '7:00 PM' },
      friday: { open: '8:00 AM', close: '7:00 PM' },
      saturday: { open: '9:00 AM', close: '6:00 PM' },
      sunday: { open: '10:00 AM', close: '5:00 PM' }
    }),
    email: 'info@vitalitynutrition.com',
    website: 'https://vitalitynutrition.com',
    image_url: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af'
  }
];

/**
 * Seed the database with all demo data
 */
async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // 1. Insert demo users
        console.log('Adding demo users...');
        const insertUser = db.prepare('INSERT INTO users (id, username, email, password_hash, is_admin) VALUES (?, ?, ?, ?, ?)');

        for (const user of DEMO_USERS) {
          const hash = await bcrypt.hash(user.password, 10);
          insertUser.run(user.id, user.username, user.email, hash, user.is_admin);
        }
        insertUser.finalize();
        console.log(`✓ Added ${DEMO_USERS.length} demo users`);

        // 2. Insert businesses
        console.log('\nAdding businesses...');
        const insertBusiness = db.prepare(`
          INSERT INTO businesses (id, name, category, description, address, phone, hours, email, website, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const business of BUSINESSES) {
          insertBusiness.run(
            business.id,
            business.name,
            business.category,
            business.description,
            business.address,
            business.phone,
            business.hours,
            business.email,
            business.website,
            business.image_url
          );
        }
        insertBusiness.finalize();
        console.log(`✓ Added ${BUSINESSES.length} businesses`);

        // 3. Add reviews (will continue in next section due to length)
        console.log('\nAdding reviews...');
        await addReviews();

        // 4. Add favorites for demo_user
        console.log('\nAdding favorites...');
        await addFavorites();

        // 5. Add deals
        console.log('\nAdding deals...');
        await addDeals();

        console.log('\n✅ Database seeding complete!');
        resolve();
      } catch (error) {
        console.error('Error seeding database:', error);
        reject(error);
      }
    });
  });
}

/**
 * Add reviews for businesses
 * Distribution: 60% positive (4-5 stars), 30% neutral (3 stars), 10% negative (1-2 stars)
 */
function addReviews() {
  return new Promise((resolve) => {
    const reviews = [];
    const reviewTexts = {
      5: [
        'Absolutely amazing! Will definitely be coming back.',
        'Best experience I\'ve had in Chicago. Highly recommend to everyone!',
        'Outstanding service and quality. Exceeded all my expectations.',
        'Love this place! It\'s become my go-to spot.',
        'Five stars all the way! Everything was perfect.'
      ],
      4: [
        'Great experience overall. Just a few minor things could be improved.',
        'Really enjoyed my visit. Would recommend to friends.',
        'Solid choice! Good quality and reasonable prices.',
        'Very satisfied with everything. Will return soon.',
        'Impressive! Only small areas for improvement.'
      ],
      3: [
        'It was okay. Nothing special but not bad either.',
        'Average experience. Met my basic expectations.',
        'Decent but I\'ve been to better places.',
        'Not bad, but could use some improvements.',
        'Middle of the road. Might give it another try.'
      ],
      2: [
        'Disappointing. Expected much better based on reviews.',
        'Below average. Several issues during my visit.',
        'Not impressed. Would not recommend.',
        'Had some problems. Needs improvement.'
      ],
      1: [
        'Very poor experience. Would not return.',
        'Terrible service. Extremely disappointed.',
        'Waste of time and money. Avoid.'
      ]
    };

    // Add 3-8 reviews per business
    BUSINESSES.forEach(business => {
      const numReviews = Math.floor(Math.random() * 6) + 3; // 3-8 reviews

      for (let i = 0; i < numReviews; i++) {
        // Determine rating based on distribution
        const rand = Math.random();
        let rating;
        if (rand < 0.6) rating = Math.random() < 0.5 ? 5 : 4; // 60% positive
        else if (rand < 0.9) rating = 3; // 30% neutral
        else rating = Math.random() < 0.5 ? 2 : 1; // 10% negative

        const userIndex = Math.floor(Math.random() * DEMO_USERS.length);
        const user = DEMO_USERS[userIndex];

        // Random date within last 60 days
        const daysAgo = Math.floor(Math.random() * 60);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        // Pick random review text for this rating
        const textOptions = reviewTexts[rating];
        const comment = textOptions[Math.floor(Math.random() * textOptions.length)];

        reviews.push({
          id: uuidv4(),
          business_id: business.id,
          user_id: user.id,
          username: user.username,
          rating,
          comment,
          helpful_count: Math.floor(Math.random() * 20),
          created_at: createdAt.toISOString()
        });
      }
    });

    const insertReview = db.prepare(`
      INSERT INTO reviews (id, business_id, user_id, username, rating, comment, helpful_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    reviews.forEach(review => {
      insertReview.run(
        review.id,
        review.business_id,
        review.user_id,
        review.username,
        review.rating,
        review.comment,
        review.helpful_count,
        review.created_at
      );
    });

    insertReview.finalize();
    console.log(`✓ Added ${reviews.length} reviews`);
    resolve();
  });
}

/**
 * Add favorites for demo_user
 */
function addFavorites() {
  return new Promise((resolve) => {
    const demoUser = DEMO_USERS[0]; // demo_user
    const favoriteBusinesses = BUSINESSES.slice(0, 5); // First 5 businesses

    const insertFavorite = db.prepare('INSERT INTO favorites (id, user_id, business_id) VALUES (?, ?, ?)');

    favoriteBusinesses.forEach(business => {
      insertFavorite.run(uuidv4(), demoUser.id, business.id);
    });

    insertFavorite.finalize();
    console.log(`✓ Added ${favoriteBusinesses.length} favorites`);
    resolve();
  });
}

/**
 * Add 20 deals with varied expiration dates
 */
function addDeals() {
  return new Promise((resolve) => {
    const deals = [
      // Expiring soon (< 7 days) - 5 deals
      {
        business_id: BUSINESSES[0].id, // Downtown Coffee
        title: '20% Off All Drinks',
        description: 'Show this coupon at checkout for 20% off any beverage',
        discount_code: 'COFFEE20',
        days_until_expiration: 3,
        terms: 'Valid Monday-Friday only. Cannot combine with other offers.'
      },
      {
        business_id: BUSINESSES[1].id, // Mama Mia
        title: 'Buy One Pizza Get One Half Off',
        description: 'Purchase any large pizza and get a second large for 50% off',
        discount_code: 'BOGO50',
        days_until_expiration: 5,
        terms: 'Dine-in or carryout only. Not valid on delivery.'
      },
      {
        business_id: BUSINESSES[8].id, // Book Nook
        title: 'Free Bookmark with Purchase',
        description: 'Get a free handmade bookmark with any book purchase',
        discount_code: 'BOOKMARK',
        days_until_expiration: 6,
        terms: 'While supplies last.'
      },
      {
        business_id: BUSINESSES[16].id, // Glamour Salon
        title: 'First Time Client Special',
        description: '20% off your first haircut service',
        discount_code: 'FIRST20',
        days_until_expiration: 4,
        terms: 'New clients only.'
      },
      {
        business_id: BUSINESSES[23].id, // FitLife Gym
        title: 'Free Week Trial',
        description: 'Try our gym free for 7 days',
        discount_code: 'TRIAL7',
        days_until_expiration: 2,
        terms: 'Must show valid ID. One per person.'
      },

      // Expiring within 30 days - 10 deals
      {
        business_id: BUSINESSES[2].id,
        title: '15% Off Smoothie Bowls',
        description: 'Healthy breakfast special',
        discount_code: 'SMOOTH15',
        days_until_expiration: 15,
        terms: 'Valid on smoothie bowls only.'
      },
      {
        business_id: BUSINESSES[3].id,
        title: 'Free Fries with Burger',
        description: 'Get free hand-cut fries with any burger purchase',
        discount_code: 'FRIES',
        days_until_expiration: 20,
        terms: 'Dine-in only.'
      },
      {
        business_id: BUSINESSES[4].id,
        title: '$5 Off Orders Over $25',
        description: 'Save $5 on bakery orders',
        discount_code: 'SWEET5',
        days_until_expiration: 25,
        terms: 'Minimum purchase $25.'
      },
      {
        business_id: BUSINESSES[9].id,
        title: '10% Off Vintage Dresses',
        description: 'All vintage dresses on sale',
        discount_code: 'DRESS10',
        days_until_expiration: 18,
        terms: 'Excludes designer pieces.'
      },
      {
        business_id: BUSINESSES[11].id,
        title: 'Free Phone Case',
        description: 'Free case with any phone repair',
        discount_code: 'CASE',
        days_until_expiration: 22,
        terms: 'Basic cases only.'
      },
      {
        business_id: BUSINESSES[12].id,
        title: '20% Off Succulents',
        description: 'All succulent plants 20% off',
        discount_code: 'SUCCULENT20',
        days_until_expiration: 28,
        terms: 'In-store only.'
      },
      {
        business_id: BUSINESSES[15].id,
        title: 'Buy 2 Get 1 Free',
        description: 'Buy 2 records, get cheapest free',
        discount_code: 'VINYL3',
        days_until_expiration: 14,
        terms: 'Equal or lesser value.'
      },
      {
        business_id: BUSINESSES[19].id,
        title: 'Pet Grooming Package',
        description: '$10 off full grooming service',
        discount_code: 'GROOM10',
        days_until_expiration: 26,
        terms: 'Full service only.'
      },
      {
        business_id: BUSINESSES[21].id,
        title: 'Escape Room Group Discount',
        description: '25% off for groups of 6+',
        discount_code: 'GROUP25',
        days_until_expiration: 19,
        terms: 'Advance booking required.'
      },
      {
        business_id: BUSINESSES[24].id,
        title: 'Yoga Class Pass',
        description: '5 classes for the price of 4',
        discount_code: 'YOGA5',
        days_until_expiration: 27,
        terms: 'Valid for 60 days from purchase.'
      },

      // Expiring within 90 days - 5 deals
      {
        business_id: BUSINESSES[5].id,
        title: 'Sushi Happy Hour',
        description: '30% off all sushi rolls 3-6pm',
        discount_code: 'HAPPY30',
        days_until_expiration: 60,
        terms: 'Dine-in only. Weekdays.'
      },
      {
        business_id: BUSINESSES[10].id,
        title: 'Gift Gallery Rewards',
        description: 'Earn double points on purchases',
        discount_code: 'DOUBLE',
        days_until_expiration: 75,
        terms: 'Rewards members only.'
      },
      {
        business_id: BUSINESSES[13].id,
        title: 'Sneaker Cleaning Service',
        description: 'Free cleaning with sneaker purchase',
        discount_code: 'CLEAN',
        days_until_expiration: 50,
        terms: 'New sneakers only.'
      },
      {
        business_id: BUSINESSES[20].id,
        title: 'Bowling League Special',
        description: '$5 per person on league nights',
        discount_code: 'LEAGUE5',
        days_until_expiration: 85,
        terms: 'Monday-Thursday evenings.'
      },
      {
        business_id: BUSINESSES[25].id,
        title: 'Spa Package Deal',
        description: 'Massage + Facial combo for $100',
        discount_code: 'RELAX100',
        days_until_expiration: 70,
        terms: '60-minute services. Booking required.'
      }
    ];

    const insertDeal = db.prepare(`
      INSERT INTO deals (id, business_id, title, description, discount_code, expiration_date, terms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    deals.forEach(deal => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + deal.days_until_expiration);
      expirationDate.setHours(23, 59, 59, 999);

      insertDeal.run(
        uuidv4(),
        deal.business_id,
        deal.title,
        deal.description,
        deal.discount_code,
        expirationDate.toISOString(),
        deal.terms
      );
    });

    insertDeal.finalize();
    console.log(`✓ Added ${deals.length} deals`);
    resolve();
  });
}

// Close database and run seed
if (require.main === module) {
  seedDatabase().then(() => {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
      else console.log('\nDatabase connection closed.');
      process.exit(0);
    });
  }).catch(err => {
    console.error('Seed failed:', err);
    db.close();
    process.exit(1);
  });
}

module.exports = { seedDatabase };
