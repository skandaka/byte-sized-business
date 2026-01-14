/**
 * Lightweight delivery/ordering service metadata for seeded businesses.
 * Replace with live provider APIs when credentials are available.
 */

// Build search URLs for delivery services with business name
function getServiceLink(service, businessName, location) {
  const encodedName = encodeURIComponent(businessName);
  const encodedLocation = encodeURIComponent(location || '');
  
  switch (service) {
    case 'Uber Eats':
      return `https://www.ubereats.com/search?q=${encodedName}`;
    case 'DoorDash':
      return `https://www.doordash.com/search/store/${encodedName}/`;
    case 'Grubhub':
      return `https://www.grubhub.com/search?queryText=${encodedName}`;
    case 'Postmates':
      return `https://postmates.com/search?q=${encodedName}`;
    case 'Instacart':
      return `https://www.instacart.com/store/search/${encodedName}`;
    default:
      return null;
  }
}

const DEFAULT_SERVICES_BY_CATEGORY = {
  Food: ['Uber Eats', 'DoorDash', 'Grubhub'],
  Retail: ['Instacart', 'In-store Pickup'],
  Services: ['In-store Service'],
  Entertainment: ['On-site'],
  Health: ['On-site'],
  Other: ['In-store'],
};

function buildDeliveryOptions(name, category, location) {
  const services = DEFAULT_SERVICES_BY_CATEGORY[category] || [];

  return services.map((service) => ({
    name: service,
    link: getServiceLink(service, name, location),
  }));
}

module.exports = { buildDeliveryOptions };
