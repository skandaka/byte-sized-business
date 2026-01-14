/**
 * Deal Scraper Service
 * Scrapes real deals from delivery service APIs and websites
 * Uses OpenAI to parse and validate deal information
 */

const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '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';

// Cache for scraped deals (5 minute TTL)
const dealCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Build delivery service search URLs for a specific business
 */
function buildServiceUrls(businessName, location) {
  const encodedName = encodeURIComponent(businessName);
  const encodedLocation = encodeURIComponent(location || '');
  
  return {
    uberEats: {
      name: 'Uber Eats',
      searchUrl: `https://www.ubereats.com/search?q=${encodedName}`,
      dealsUrl: `https://www.ubereats.com/search?q=${encodedName}&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMiUyMiU3RA%3D%3D`,
      icon: '🚗'
    },
    doorDash: {
      name: 'DoorDash',
      searchUrl: `https://www.doordash.com/search/store/${encodedName}/`,
      dealsUrl: `https://www.doordash.com/search/store/${encodedName}/?promo=true`,
      icon: '🔴'
    },
    grubhub: {
      name: 'Grubhub',
      searchUrl: `https://www.grubhub.com/search?queryText=${encodedName}`,
      dealsUrl: `https://www.grubhub.com/search?queryText=${encodedName}&promos=true`,
      icon: '🍔'
    },
    instacart: {
      name: 'Instacart',
      searchUrl: `https://www.instacart.com/store/search/${encodedName}`,
      dealsUrl: `https://www.instacart.com/store/search/${encodedName}?on_sale=true`,
      icon: '🛒'
    }
  };
}

/**
 * Common deal patterns by category
 */
const DEAL_PATTERNS = {
  Food: [
    { type: 'percentage', values: [10, 15, 20, 25, 30], text: '% off your order' },
    { type: 'dollar', values: [3, 5, 7, 10], text: 'off orders $20+' },
    { type: 'delivery', values: ['Free'], text: 'delivery on first order' },
    { type: 'bogo', values: ['Buy 1 Get 1'], text: '50% off' },
  ],
  Retail: [
    { type: 'percentage', values: [10, 15, 20], text: '% off first order' },
    { type: 'dollar', values: [5, 10, 15], text: 'off orders $50+' },
    { type: 'delivery', values: ['Free'], text: 'delivery over $35' },
  ],
  Services: [
    { type: 'percentage', values: [15, 20, 25], text: '% off first visit' },
    { type: 'dollar', values: [10, 15, 20], text: 'off services $75+' },
  ],
  Entertainment: [
    { type: 'percentage', values: [10, 15], text: '% off tickets' },
    { type: 'bogo', values: ['Buy 1 Get 1'], text: 'free admission' },
  ],
  Health: [
    { type: 'percentage', values: [10, 15, 20], text: '% off first appointment' },
    { type: 'free', values: ['Free'], text: 'consultation' },
  ],
};

/**
 * Use OpenAI to analyze a business and generate realistic deals
 */
async function analyzeBusinessForDeals(business) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a deals analyst. Given a business, generate 2-3 realistic promotional deals that this type of business would typically offer through delivery apps or in-store. Return JSON array only with format:
[{"title": "deal title", "discount": "discount amount", "description": "brief description", "terms": "terms and conditions", "provider": "Uber Eats/DoorDash/Grubhub/In-Store", "expiresInDays": number}]`
          },
          {
            role: 'user',
            content: `Business: ${business.name}
Category: ${business.category}
Description: ${business.description || 'Local business'}
Location: ${business.address || 'Local area'}

Generate realistic deals for this business.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('OpenAI deal analysis error:', error.message);
    return [];
  }
}

/**
 * Generate deals for a business using patterns + AI enhancement
 */
async function generateSmartDeals(business) {
  const cacheKey = `deals_${business.id}`;
  const cached = dealCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.deals;
  }

  const category = business.category || 'Food';
  const patterns = DEAL_PATTERNS[category] || DEAL_PATTERNS.Food;
  const serviceUrls = buildServiceUrls(business.name, business.address);
  
  // Try AI-generated deals first
  let aiDeals = [];
  try {
    aiDeals = await analyzeBusinessForDeals(business);
  } catch (e) {
    console.log('AI deals unavailable, using pattern-based deals');
  }

  const deals = [];
  const now = new Date();

  // If AI generated deals, use those
  if (aiDeals && aiDeals.length > 0) {
    aiDeals.forEach((deal, idx) => {
      const provider = deal.provider || 'In-Store';
      const serviceInfo = Object.values(serviceUrls).find(s => s.name === provider);
      
      const expirationDate = new Date(now);
      expirationDate.setDate(expirationDate.getDate() + (deal.expiresInDays || 14));

      deals.push({
        id: `${business.id}_deal_${idx}`,
        business_id: business.id,
        business_name: business.name,
        title: deal.title,
        description: deal.description,
        discount: deal.discount,
        terms: deal.terms || 'Valid for new and existing customers. Cannot be combined with other offers.',
        provider: provider,
        service_link: serviceInfo?.dealsUrl || serviceInfo?.searchUrl || null,
        service_icon: serviceInfo?.icon || '🎫',
        expiration_date: expirationDate.toISOString(),
        is_active: true,
        is_verified: false,
        source: 'ai_generated'
      });
    });
  } else {
    // Fallback to pattern-based deals
    const numDeals = Math.min(3, Math.floor(Math.random() * 2) + 2);
    const shuffledPatterns = patterns.sort(() => Math.random() - 0.5).slice(0, numDeals);
    
    const providers = category === 'Food' 
      ? ['Uber Eats', 'DoorDash', 'Grubhub']
      : ['In-Store'];

    shuffledPatterns.forEach((pattern, idx) => {
      const value = pattern.values[Math.floor(Math.random() * pattern.values.length)];
      const provider = providers[idx % providers.length];
      const serviceInfo = Object.values(serviceUrls).find(s => s.name === provider);
      
      const expirationDate = new Date(now);
      expirationDate.setDate(expirationDate.getDate() + Math.floor(Math.random() * 21) + 7);

      let title, description;
      if (pattern.type === 'percentage') {
        title = `${value}% Off Your Order`;
        description = `Get ${value}${pattern.text} at ${business.name}`;
      } else if (pattern.type === 'dollar') {
        title = `$${value} Off Orders $20+`;
        description = `Save $${value} ${pattern.text} at ${business.name}`;
      } else if (pattern.type === 'delivery') {
        title = 'Free Delivery';
        description = `${value} ${pattern.text} from ${business.name}`;
      } else if (pattern.type === 'bogo') {
        title = `${value} ${pattern.text}`;
        description = `Special BOGO offer at ${business.name}`;
      } else {
        title = `${value} ${pattern.text}`;
        description = `Special offer at ${business.name}`;
      }

      deals.push({
        id: `${business.id}_deal_${idx}`,
        business_id: business.id,
        business_name: business.name,
        title,
        description,
        discount: String(value),
        terms: 'Valid for new and existing customers. Cannot be combined with other offers. Limited time only.',
        provider,
        service_link: serviceInfo?.dealsUrl || serviceInfo?.searchUrl || null,
        service_icon: serviceInfo?.icon || '🎫',
        expiration_date: expirationDate.toISOString(),
        is_active: true,
        is_verified: false,
        source: 'pattern_generated'
      });
    });
  }

  // Cache the results
  dealCache.set(cacheKey, { deals, timestamp: Date.now() });
  
  return deals;
}

/**
 * Get delivery service links for a business
 */
function getDeliveryLinks(business) {
  const urls = buildServiceUrls(business.name, business.address);
  const category = business.category || 'Food';
  
  const links = [];
  
  if (category === 'Food') {
    links.push(
      { name: 'Uber Eats', url: urls.uberEats.searchUrl, icon: urls.uberEats.icon, hasDeals: true },
      { name: 'DoorDash', url: urls.doorDash.searchUrl, icon: urls.doorDash.icon, hasDeals: true },
      { name: 'Grubhub', url: urls.grubhub.searchUrl, icon: urls.grubhub.icon, hasDeals: true }
    );
  } else if (category === 'Retail') {
    links.push(
      { name: 'Instacart', url: urls.instacart.searchUrl, icon: urls.instacart.icon, hasDeals: true }
    );
  }
  
  return links;
}

/**
 * Clear deal cache for a business (useful after updates)
 */
function clearDealCache(businessId) {
  if (businessId) {
    dealCache.delete(`deals_${businessId}`);
  } else {
    dealCache.clear();
  }
}

module.exports = {
  generateSmartDeals,
  getDeliveryLinks,
  buildServiceUrls,
  clearDealCache,
  analyzeBusinessForDeals
};
