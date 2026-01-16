/**
 * Dynamic deals generation for any business
 * Generates realistic, category-appropriate deals for local businesses
 */
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

// Deal templates by category - each deal is specific to the business type
const DEAL_TEMPLATES = {
  Food: [
    { title: '15% Off Your Meal', discount: '15%', provider: 'In-Store', link: null },
    { title: '$5 Off Orders $25+', discount: '$5', provider: 'In-Store', link: null },
    { title: 'Buy One Entree Get One 50% Off', discount: 'BOGO', provider: 'In-Store', link: null },
    { title: 'Free Dessert with Any Purchase', discount: 'Free Item', provider: 'In-Store', link: null },
    { title: '20% Off Weekend Brunch', discount: '20%', provider: 'In-Store', link: null },
    { title: 'Free Drink with Meal', discount: 'Free Item', provider: 'In-Store', link: null },
    { title: 'Happy Hour: 25% Off 4-6pm', discount: '25%', provider: 'In-Store', link: null },
  ],
  Retail: [
    { title: '10% Off Your Purchase', discount: '10%', provider: 'In-Store', link: null },
    { title: 'Free Shipping on Orders $50+', discount: 'Free Shipping', provider: 'Online', link: null },
    { title: '$10 Off $75+ Purchase', discount: '$10', provider: 'In-Store', link: null },
    { title: 'Buy 2 Get 1 Free', discount: 'B2G1', provider: 'In-Store', link: null },
    { title: '20% Off New Arrivals', discount: '20%', provider: 'In-Store', link: null },
    { title: 'Clearance: Extra 30% Off Sale Items', discount: '30%', provider: 'In-Store', link: null },
  ],
  Services: [
    { title: '20% Off First Visit', discount: '20%', provider: 'In-Store', link: null },
    { title: '$15 Off Any Service $75+', discount: '$15', provider: 'In-Store', link: null },
    { title: 'Free Consultation', discount: 'Free', provider: 'In-Store', link: null },
    { title: '15% Off for Returning Customers', discount: '15%', provider: 'In-Store', link: null },
    { title: 'Refer a Friend: Both Get $10 Off', discount: '$10', provider: 'In-Store', link: null },
  ],
  Entertainment: [
    { title: '$5 Off Admission', discount: '$5', provider: 'In-Store', link: null },
    { title: 'Buy One Ticket Get One Free', discount: 'BOGO', provider: 'In-Store', link: null },
    { title: '15% Off Group Bookings', discount: '15%', provider: 'In-Store', link: null },
    { title: 'Family Pack: 4 Tickets for Price of 3', discount: '25%', provider: 'In-Store', link: null },
    { title: 'Weekend Special: 20% Off', discount: '20%', provider: 'In-Store', link: null },
  ],
  Health: [
    { title: 'Free Initial Consultation', discount: 'Free', provider: 'In-Store', link: null },
    { title: '10% Off First Visit', discount: '10%', provider: 'In-Store', link: null },
    { title: '$20 Off Membership', discount: '$20', provider: 'In-Store', link: null },
    { title: 'Refer a Friend: Both Get 15% Off', discount: '15%', provider: 'In-Store', link: null },
    { title: 'New Member Special: First Month 50% Off', discount: '50%', provider: 'In-Store', link: null },
  ],
  Other: [
    { title: '10% Off Your First Purchase', discount: '10%', provider: 'In-Store', link: null },
    { title: '$5 Off Any Service', discount: '$5', provider: 'In-Store', link: null },
    { title: 'Loyalty Reward: 15% Off', discount: '15%', provider: 'In-Store', link: null },
  ],
};

const DEAL_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
  'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
];

// Generate unique deal code
function generateDealCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'LOCAL';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate deals for a specific business
function generateDealsForBusiness(business) {
  const category = business.category || 'Other';
  const templates = DEAL_TEMPLATES[category] || DEAL_TEMPLATES.Other;
  
  // Each business gets 1-3 deals
  const numDeals = Math.floor(Math.random() * 3) + 1;
  const selectedTemplates = templates.sort(() => Math.random() - 0.5).slice(0, numDeals);
  
  // Create category-specific descriptions
  const categoryDescriptions = {
    Food: `Enjoy this special offer at ${business.name}! Perfect for your next meal.`,
    Retail: `Shop and save at ${business.name}! Limited time offer.`,
    Services: `Book your appointment at ${business.name} and save!`,
    Entertainment: `Fun awaits at ${business.name}! Don't miss this deal.`,
    Health: `Take care of yourself at ${business.name} with this special offer.`,
    Other: `Special offer at ${business.name}!`
  };
  
  return selectedTemplates.map((template, idx) => ({
    id: `deal_${business.id}_${idx}`,
    business_id: business.id,
    business_name: business.name,
    title: template.title,
    description: categoryDescriptions[category] || categoryDescriptions.Other,
    discount_code: generateDealCode(),
    provider: template.provider,
    service_link: template.link,
    category: category,
    image_url: business.image_url || DEAL_IMAGES[Math.floor(Math.random() * DEAL_IMAGES.length)],
    expiration_date: addDays(Math.floor(Math.random() * 30) + 7),
    terms: 'Valid for new and existing customers. Cannot be combined with other offers.',
    is_external: true,
    is_active: true,
  }));
}

// Generate deals for multiple businesses
function generateDealsForBusinesses(businesses) {
  const allDeals = [];
  
  businesses.forEach(business => {
    const deals = generateDealsForBusiness(business);
    allDeals.push(...deals);
  });
  
  return allDeals;
}

// Legacy function for backward compatibility
function getExternalDeals(category, businesses = []) {
  const now = new Date();
  
  // If businesses provided, generate deals for them
  if (businesses.length > 0) {
    const deals = generateDealsForBusinesses(businesses);
    return deals.map((deal) => ({
      ...deal,
      claim_count: Math.floor(Math.random() * 50),
      daysRemaining: Math.ceil((new Date(deal.expiration_date) - now) / (1000 * 60 * 60 * 24)),
      isExpiringSoon: Math.ceil((new Date(deal.expiration_date) - now) / (1000 * 60 * 60 * 24)) <= 7,
      isExpired: false,
    }));
  }
  
  // Fallback to empty array if no businesses
  return [];
}

module.exports = {
  getExternalDeals,
  generateDealsForBusiness,
  generateDealsForBusinesses,
};
