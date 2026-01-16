/**
 * Validation Routes - Content Quality Validation API
 * FBLA Rubric: "Validation on both syntactical and semantic levels"
 * 
 * This module provides content validation endpoints for:
 * - Pre-submission content checks
 * - Quality scoring feedback
 * - Improvement suggestions
 */

const express = require('express');
const router = express.Router();
const { validateContent, sanitizeContent } = require('../services/contentValidation');

/**
 * POST /api/validate
 * Validates content and returns detailed feedback
 * 
 * Request body:
 * @param {string} content - The text content to validate
 * @param {string} type - Content type: 'review', 'question', 'answer', 'general'
 * 
 * @returns {Object} Validation result with score, issues, and suggestions
 */
router.post('/', (req, res) => {
  const { content, type = 'general' } = req.body;

  if (content === undefined) {
    return res.status(400).json({
      valid: false,
      error: 'Content is required',
      score: 0,
      issues: ['No content provided'],
      suggestions: ['Please enter some text to validate']
    });
  }

  try {
    const result = validateContent(content, type);
    
    // Include sanitized version for preview
    result.sanitized = sanitizeContent(content);
    
    res.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Validation service error',
      score: 0,
      issues: ['Unable to validate content'],
      suggestions: ['Please try again']
    });
  }
});

/**
 * POST /api/validate/review
 * Specialized validation for reviews
 * Includes review-specific checks and suggestions
 */
router.post('/review', (req, res) => {
  const { content, rating } = req.body;

  if (!content) {
    return res.status(400).json({
      valid: false,
      error: 'Review content is required',
      issues: ['No review content provided']
    });
  }

  const result = validateContent(content, 'review');

  // Additional review-specific validation
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      result.valid = false;
      result.issues.push('Rating must be between 1 and 5 stars');
    }

    // Check for rating-content consistency (basic sentiment check)
    const positiveWords = ['great', 'amazing', 'excellent', 'love', 'best', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'horrible', 'poor', 'disappointed'];
    
    const lowerContent = content.toLowerCase();
    const hasPositive = positiveWords.some(w => lowerContent.includes(w));
    const hasNegative = negativeWords.some(w => lowerContent.includes(w));

    if (rating >= 4 && hasNegative && !hasPositive) {
      result.suggestions.push('Note: Your review text seems negative but rating is high. Consider adjusting for consistency.');
    }
    if (rating <= 2 && hasPositive && !hasNegative) {
      result.suggestions.push('Note: Your review text seems positive but rating is low. Consider adjusting for consistency.');
    }
  }

  res.json(result);
});

/**
 * POST /api/validate/question
 * Specialized validation for Q&A questions
 */
router.post('/question', (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      valid: false,
      error: 'Question content is required',
      issues: ['No question provided']
    });
  }

  const result = validateContent(content, 'question');

  // Question-specific checks
  if (!content.includes('?')) {
    result.suggestions.unshift('Consider phrasing your question with a question mark (?)');
  }

  // Check for question words
  const questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'is', 'are', 'do', 'does', 'can', 'could', 'would'];
  const lowerContent = content.toLowerCase();
  const hasQuestionWord = questionWords.some(w => lowerContent.startsWith(w) || lowerContent.includes(' ' + w + ' '));
  
  if (!hasQuestionWord && !content.includes('?')) {
    result.suggestions.push('Make sure your question is clearly phrased so others can help answer it');
  }

  res.json(result);
});

module.exports = router;
