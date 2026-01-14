/**
 * Feature Flags Service
 * Centralized feature flag management for controlled rollouts
 */

// Feature flags configuration
const FLAGS = {
  // External data sourcing
  external_sourcing: true,
  scraping_enabled: false, // Disabled by default for safety

  // Phase 3 features
  business_pairing: true,
  random_discovery: true,
  community_goals: true,
  ai_recommendations: false, // Needs ML implementation
  owner_responses: true,

  // Phase 4 features
  advanced_analytics: true,
  user_streaks: true,

  // Phase 5 features
  animations: true,
  scroll_reveals: true,

  // Infrastructure
  telemetry: true,
  debug_mode: process.env.NODE_ENV === 'development',
  image_proxy: true,
  geocoding: true,
};

/**
 * Check if a feature is enabled
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} True if feature is enabled
 */
function isEnabled(flagName) {
  return FLAGS[flagName] === true;
}

/**
 * Get all feature flags
 * @returns {Object} All feature flags with their states
 */
function getAllFlags() {
  return { ...FLAGS };
}

/**
 * Enable a feature flag (runtime)
 * @param {string} flagName - Name of the feature flag
 */
function enable(flagName) {
  if (flagName in FLAGS) {
    FLAGS[flagName] = true;
    console.log(`✅ Feature flag enabled: ${flagName}`);
  } else {
    console.warn(`⚠️  Unknown feature flag: ${flagName}`);
  }
}

/**
 * Disable a feature flag (runtime)
 * @param {string} flagName - Name of the feature flag
 */
function disable(flagName) {
  if (flagName in FLAGS) {
    FLAGS[flagName] = false;
    console.log(`🚫 Feature flag disabled: ${flagName}`);
  } else {
    console.warn(`⚠️  Unknown feature flag: ${flagName}`);
  }
}

/**
 * Express middleware to add feature flags to request object
 */
function featureFlagMiddleware(req, res, next) {
  req.featureFlags = {
    isEnabled,
    getAllFlags,
  };
  next();
}

module.exports = {
  isEnabled,
  getAllFlags,
  enable,
  disable,
  featureFlagMiddleware,
};
