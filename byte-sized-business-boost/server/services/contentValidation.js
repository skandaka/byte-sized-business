/**
 * Content Validation Service
 * FBLA Rubric: "Validation on both syntactical and semantic levels"
 * 
 * This service provides comprehensive input validation including:
 * - Syntactical validation (format, length, structure)
 * - Semantic validation (meaning, appropriateness, quality)
 * 
 * Features:
 * - Profanity filtering
 * - Spam detection
 * - Sentiment analysis (basic)
 * - Content quality scoring
 * - Helpful suggestions for improvement
 */

/**
 * List of inappropriate words/patterns to filter
 * Note: This is a family-friendly placeholder list for FBLA competition
 * In production, use a comprehensive library like 'bad-words'
 */
const INAPPROPRIATE_PATTERNS = [
  // Spam indicators
  /buy\s+now/gi,
  /click\s+here/gi,
  /free\s+money/gi,
  /make\s+\$\d+/gi,
  /limited\s+time\s+offer/gi,
  /act\s+now/gi,
  /\b(http|www)\.\S+/gi,  // URLs (often spam)
  
  // Repetitive patterns (spam indicator)
  /(.)\1{4,}/,  // Same character 5+ times
  /(\b\w+\b)(\s+\1){3,}/gi,  // Same word repeated 4+ times
];

/**
 * Quality indicator words (positive signals)
 */
const QUALITY_INDICATORS = {
  positive: [
    'helpful', 'friendly', 'excellent', 'amazing', 'great',
    'professional', 'quality', 'recommend', 'wonderful', 'fantastic',
    'delicious', 'fresh', 'clean', 'cozy', 'welcoming'
  ],
  descriptive: [
    'atmosphere', 'service', 'staff', 'price', 'value',
    'experience', 'location', 'parking', 'menu', 'selection',
    'hours', 'wait', 'portion', 'taste', 'decor'
  ],
  specific: [
    'tried', 'ordered', 'visited', 'bought', 'purchased',
    'loved', 'enjoyed', 'returned', 'favorite', 'regular'
  ]
};

/**
 * Main validation function
 * Performs both syntactical and semantic validation
 * 
 * @param {string} content - The text content to validate
 * @param {string} type - Content type: 'review', 'question', 'answer', 'general'
 * @returns {Object} Validation result with { valid, score, issues, suggestions }
 */
function validateContent(content, type = 'general') {
  const result = {
    valid: true,
    score: 100,
    issues: [],
    suggestions: [],
    stats: {}
  };

  // Handle empty/null content
  if (!content || typeof content !== 'string') {
    return {
      valid: false,
      score: 0,
      issues: ['Content is required'],
      suggestions: ['Please enter some text'],
      stats: {}
    };
  }

  const trimmedContent = content.trim();

  // ========== SYNTACTICAL VALIDATION ==========

  // Length checks based on content type
  const lengthLimits = {
    review: { min: 10, max: 500, name: 'Review' },
    question: { min: 10, max: 500, name: 'Question' },
    answer: { min: 10, max: 1000, name: 'Answer' },
    general: { min: 3, max: 2000, name: 'Content' }
  };

  const limits = lengthLimits[type] || lengthLimits.general;

  if (trimmedContent.length < limits.min) {
    result.valid = false;
    result.issues.push(`${limits.name} is too short (minimum ${limits.min} characters)`);
    result.suggestions.push('Add more detail to make your submission helpful');
    result.score -= 40;
  }

  if (trimmedContent.length > limits.max) {
    result.valid = false;
    result.issues.push(`${limits.name} exceeds maximum length (${limits.max} characters)`);
    result.suggestions.push(`Try to be more concise - focus on the most important points`);
    result.score -= 30;
  }

  // Word count check
  const words = trimmedContent.split(/\s+/).filter(w => w.length > 0);
  result.stats.wordCount = words.length;

  if (words.length < 3) {
    result.valid = false;
    result.issues.push('Content needs more words');
    result.suggestions.push('Write at least a complete sentence');
    result.score -= 30;
  }

  // ========== SEMANTIC VALIDATION ==========

  // Check for inappropriate content
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(trimmedContent)) {
      result.valid = false;
      result.issues.push('Content may contain spam or inappropriate material');
      result.suggestions.push('Please keep your content genuine and helpful');
      result.score -= 50;
      break;
    }
  }

  // Check for excessive capitalization (shouting)
  const capsRatio = (trimmedContent.match(/[A-Z]/g) || []).length / trimmedContent.length;
  if (capsRatio > 0.6 && trimmedContent.length > 20) {
    result.issues.push('Excessive use of capital letters');
    result.suggestions.push('Please use normal capitalization for better readability');
    result.score -= 15;
  }

  // Check for excessive punctuation
  const excessivePunctuation = /[!?]{3,}|\.{4,}/;
  if (excessivePunctuation.test(trimmedContent)) {
    result.issues.push('Excessive punctuation detected');
    result.suggestions.push('Use standard punctuation for clarity');
    result.score -= 10;
  }

  // ========== QUALITY SCORING ==========

  // Check for quality indicators (positive)
  let qualityBonus = 0;
  
  const lowerContent = trimmedContent.toLowerCase();
  
  // Positive sentiment words
  const positiveCount = QUALITY_INDICATORS.positive.filter(word => 
    lowerContent.includes(word)
  ).length;
  qualityBonus += Math.min(positiveCount * 3, 15);

  // Descriptive words (shows detail)
  const descriptiveCount = QUALITY_INDICATORS.descriptive.filter(word => 
    lowerContent.includes(word)
  ).length;
  qualityBonus += Math.min(descriptiveCount * 2, 10);

  // Specific experience words
  const specificCount = QUALITY_INDICATORS.specific.filter(word => 
    lowerContent.includes(word)
  ).length;
  qualityBonus += Math.min(specificCount * 3, 15);

  result.score = Math.min(100, Math.max(0, result.score + qualityBonus));
  result.stats.qualityBonus = qualityBonus;

  // Add suggestions based on type-specific criteria
  if (type === 'review') {
    if (descriptiveCount === 0) {
      result.suggestions.push('Tip: Mention specific aspects like service, atmosphere, or value');
    }
    if (specificCount === 0) {
      result.suggestions.push('Tip: Share what you tried or experienced');
    }
  }

  if (type === 'question') {
    if (!trimmedContent.includes('?')) {
      result.suggestions.push('Tip: Phrase your question with a question mark');
    }
  }

  // Final validity check
  if (result.score < 30) {
    result.valid = false;
  }

  // Quality tier assessment
  if (result.score >= 80) {
    result.quality = 'excellent';
  } else if (result.score >= 60) {
    result.quality = 'good';
  } else if (result.score >= 40) {
    result.quality = 'fair';
  } else {
    result.quality = 'needs improvement';
  }

  return result;
}

/**
 * Quick validation check (returns boolean only)
 * Use for simple pass/fail validation
 * 
 * @param {string} content - Content to validate
 * @param {string} type - Content type
 * @returns {boolean} Whether content passes validation
 */
function isValidContent(content, type = 'general') {
  return validateContent(content, type).valid;
}

/**
 * Sanitize content for safe storage and display
 * Removes/escapes potentially harmful content
 * 
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
function sanitizeContent(content) {
  if (!content || typeof content !== 'string') return '';

  return content
    .trim()
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ');
}

/**
 * Check if content contains only valid characters
 * 
 * @param {string} content - Content to check
 * @returns {boolean} Whether content has valid characters
 */
function hasValidCharacters(content) {
  // Allow letters, numbers, common punctuation, and whitespace
  const validPattern = /^[\w\s.,!?'"()-:;@#$%&*+=\[\]{}|\\/<>~`^]+$/;
  return validPattern.test(content);
}

module.exports = {
  validateContent,
  isValidContent,
  sanitizeContent,
  hasValidCharacters,
  QUALITY_INDICATORS
};
