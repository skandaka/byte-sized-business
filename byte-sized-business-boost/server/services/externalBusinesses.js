/**
 * Mocked external search feed (Yelp/Google-style). Swap with real API calls when keys are provided.
 */
const sampleHours = {
  monday: { open: '9:00 AM', close: '7:00 PM' },
  tuesday: { open: '9:00 AM', close: '7:00 PM' },
  wednesday: { open: '9:00 AM', close: '7:00 PM' },
  thursday: { open: '9:00 AM', close: '7:00 PM' },
  friday: { open: '9:00 AM', close: '8:00 PM' },
  saturday: { open: '10:00 AM', close: '8:00 PM' },
  sunday: { open: '11:00 AM', close: '6:00 PM' },
};

const EXTERNAL_BUSINESSES = [
  {
    id: 'ext-yelp-101',
    name: 'Lakeview Brunch Co.',
    category: 'Food',
    description: 'Yelp pick: sunny brunch spot with seasonal menus and latte art.',
    address: '1420 W Belmont Ave, Chicago, IL',
    phone: '(312) 555-0142',
    hours: sampleHours,
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    website: 'https://www.yelp.com',
    source: 'Yelp',
    averageRating: 4.6,
    reviewCount: 183,
  },
  {
    id: 'ext-google-202',
    name: 'River North Art Loft',
    category: 'Entertainment',
    description: 'Google Places: indie gallery + live sketch nights featuring local artists.',
    address: '318 W Superior St, Chicago, IL',
    phone: '(312) 555-0318',
    hours: sampleHours,
    image_url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
    website: 'https://maps.google.com',
    source: 'Google Places',
    averageRating: 4.8,
    reviewCount: 92,
  },
  {
    id: 'ext-yelp-303',
    name: 'Greenpoint Wellness',
    category: 'Health',
    description: 'Yelp: boutique wellness studio offering yoga + infrared sauna.',
    address: '915 W Randolph St, Chicago, IL',
    phone: '(312) 555-0915',
    hours: sampleHours,
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80',
    website: 'https://www.yelp.com',
    source: 'Yelp',
    averageRating: 4.7,
    reviewCount: 121,
  }
];

function getExternalBusinesses(category) {
  if (!category || category === 'All') return EXTERNAL_BUSINESSES;
  return EXTERNAL_BUSINESSES.filter((b) => b.category === category);
}

function findExternalBusinessById(id) {
  return EXTERNAL_BUSINESSES.find((b) => b.id === id);
}

module.exports = {
  getExternalBusinesses,
  findExternalBusinessById,
};
