/**
 * HelpPage Component - User Guide & Tutorial System
 * FBLA Rubric: "Clear instructions are provided"
 * 
 * This page provides comprehensive help documentation for users,
 * including feature guides, FAQs, and step-by-step tutorials.
 * 
 * Features:
 * - Searchable help topics
 * - Accordion-style FAQ sections
 * - Feature walkthroughs
 * - Quick start guide
 * - Contact/support information
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState('getting-started');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  /**
   * Help sections with detailed content
   * Each section contains a title, icon, and detailed content
   */
  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      content: [
        {
          title: 'What is Byte-Sized Business Boost?',
          description: 'Byte-Sized Business Boost is a platform designed to help you discover and support small, local businesses in your community. Unlike traditional search engines that often favor corporate chains, our platform uses a unique Local Business Authenticity Index (LBAI) algorithm to ensure you find genuine local gems.'
        },
        {
          title: 'Creating an Account',
          description: 'To get the most out of the platform, create a free account. Click "Register" in the navigation bar, enter your username, email, and a secure password (minimum 8 characters with at least one uppercase letter and one number). Once registered, you can save favorites, write reviews, claim deals, and ask questions.'
        },
        {
          title: 'Finding Businesses',
          description: 'Use the search bar on the homepage to search by business name or keyword. You can also browse by category (Food, Retail, Services, Entertainment, Health) using the filter buttons. Set your location to find businesses near you, and use the sort options to order results by rating, reviews, or alphabetically.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Features Guide',
      icon: '✨',
      content: [
        {
          title: 'Search & Browse',
          description: 'Use the search bar to find businesses by name. Apply category filters to narrow results. Sort by highest-rated, most-reviewed, or alphabetically. Set your location to see businesses near you with accurate distances.'
        },
        {
          title: 'Reviews & Ratings',
          description: 'Share your experiences by writing reviews. Click on any business to view its detail page, then scroll to the Reviews tab. Select a star rating (1-5) and write your review (up to 500 characters). Complete the quick verification (solve a simple math problem) to prevent spam, then submit!'
        },
        {
          title: 'Favorites',
          description: 'Save businesses you love by clicking the heart icon on any business card or detail page. Access all your favorites from the "Favorites" page in the navigation. Export your favorites as a CSV file from your Profile page.'
        },
        {
          title: 'Deals & Coupons',
          description: 'Browse exclusive deals on the Deals page. Each deal shows the discount, expiration countdown, and how many users have claimed it. Click "Claim Deal" and complete verification to reveal the discount code. Look for "Expiring Soon" badges to not miss limited-time offers!'
        },
        {
          title: 'Q&A Section',
          description: 'Have questions about a business? Visit the Q&A tab on any business detail page. You can ask questions, answer others\' questions, and upvote helpful answers. Business owners can provide verified responses marked with a special badge.'
        },
        {
          title: 'Random Discovery',
          description: 'Can\'t decide where to go? Use the Random Discovery feature to get surprise recommendations. Click "Discover" in the navigation to spin the wheel and find your next local adventure!'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: '👤',
      content: [
        {
          title: 'Managing Your Profile',
          description: 'Access your profile by clicking your username in the navigation bar. View your statistics including reviews written, favorites saved, and average rating given. You can also export your data from here.'
        },
        {
          title: 'Password Requirements',
          description: 'For security, passwords must be at least 8 characters long, contain at least one uppercase letter, and include at least one number. A strength meter shows how secure your password is during registration.'
        },
        {
          title: 'Exporting Your Data',
          description: 'From your Profile page, you can export your favorites as a CSV file (spreadsheet compatible) or your reviews as a PDF document. This helps you keep records of your activity and recommendations.'
        }
      ]
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: '💡',
      content: [
        {
          title: 'Writing Great Reviews',
          description: 'Be specific about what you liked or didn\'t like. Mention specific dishes, products, or services. Include details about the atmosphere, staff, and value for money. Helpful reviews get upvoted by the community!'
        },
        {
          title: 'Supporting Local Businesses',
          description: 'Follow businesses to stay updated. Claim deals to get exclusive discounts. Share your favorite businesses with friends. Leave positive reviews for great experiences - it helps small businesses get discovered!'
        },
        {
          title: 'Using Location Features',
          description: 'Enable location services for the most accurate results. Use the radius slider to adjust how far you\'re willing to travel. The map view shows all businesses in your area at a glance.'
        }
      ]
    }
  ];

  /**
   * Frequently Asked Questions
   * Common questions with detailed answers
   */
  const faqs = [
    {
      question: 'How does the LBAI algorithm work?',
      answer: 'The Local Business Authenticity Index (LBAI) is our proprietary 3-component scoring system that identifies genuine local businesses. It analyzes chain detection (50% weight), business size indicators (30%), and locality signals (20%). Businesses with an LBAI score of 75 or higher are verified as local, ensuring you only see authentic small businesses.'
    },
    {
      question: 'Why do I need to solve a math problem before submitting?',
      answer: 'The verification step (CAPTCHA) helps prevent spam and bot submissions. It ensures that only real users are writing reviews, asking questions, and claiming deals. This keeps the platform trustworthy and maintains quality content for everyone.'
    },
    {
      question: 'How are deals generated?',
      answer: 'Deals come from multiple sources: business owners can create exclusive offers, our system intelligently generates relevant deals based on business type and category, and we integrate with popular delivery and coupon services. All deals display their source and expiration clearly.'
    },
    {
      question: 'Can I remove or edit my review?',
      answer: 'Currently, you can delete your own reviews by clicking the delete button on any review you\'ve written. To edit a review, delete the existing one and submit a new review with your updated thoughts.'
    },
    {
      question: 'How do I claim or verify my business?',
      answer: 'If you own a business listed on our platform, click the "Own this business? Claim it" link on the business detail page. Fill out the verification form with your business documentation. Once verified, you can respond to reviews, post announcements, and provide official answers to Q&A questions.'
    },
    {
      question: 'Why can\'t I see certain businesses?',
      answer: 'Our LBAI algorithm filters out corporate chains and large franchises to focus on genuine local businesses. If you\'re searching in an area with few local businesses, try expanding your search radius or exploring different categories.'
    },
    {
      question: 'How do I report inappropriate content?',
      answer: 'Our system includes automatic content validation that filters spam and inappropriate language. If you notice content that slipped through, please contact us through the support section below. We take community safety seriously.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We use industry-standard security practices including bcrypt password hashing, JWT authentication tokens, and input sanitization. We never store plain-text passwords, and your data is protected by our secure SQLite database.'
    }
  ];

  /**
   * Filter FAQ items based on search query
   */
  const filteredFAQs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Filter sections based on search query
   */
  const filteredSections = helpSections.filter(
    section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.some(
        item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="container mt-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div 
        className="card p-5 mb-4 text-center"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary-blue), #1d4ed8)',
          color: 'white'
        }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚 Help Center</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
          Everything you need to know about Byte-Sized Business Boost
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics..."
            className="input"
            style={{ 
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              border: 'none',
              borderRadius: 'var(--radius-lg)'
            }}
            aria-label="Search help topics"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-4 mb-4">
        <Link to="/" className="card p-3 text-center" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>🏠</span>
          <p className="mt-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Browse Businesses</p>
        </Link>
        <Link to="/deals" className="card p-3 text-center" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>🎁</span>
          <p className="mt-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>View Deals</p>
        </Link>
        <Link to="/favorites" className="card p-3 text-center" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>❤️</span>
          <p className="mt-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>My Favorites</p>
        </Link>
        <Link to="/discover" className="card p-3 text-center" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>🎲</span>
          <p className="mt-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Random Discovery</p>
        </Link>
      </div>

      {/* Help Sections */}
      <div className="mb-4">
        <h2 className="mb-3">📖 User Guide</h2>
        {filteredSections.map(section => (
          <div key={section.id} className="card mb-3" style={{ overflow: 'hidden' }}>
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              style={{
                width: '100%',
                padding: '1.25rem',
                background: expandedSection === section.id ? 'var(--primary-blue)' : 'transparent',
                color: expandedSection === section.id ? 'white' : 'var(--text-primary)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.1rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <span>
                {section.icon} {section.title}
              </span>
              <span style={{ 
                transform: expandedSection === section.id ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }}>
                ▼
              </span>
            </button>

            {expandedSection === section.id && (
              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)' }}>
                {section.content.map((item, index) => (
                  <div 
                    key={index}
                    style={{ 
                      marginBottom: index < section.content.length - 1 ? '1.25rem' : 0,
                      paddingBottom: index < section.content.length - 1 ? '1.25rem' : 0,
                      borderBottom: index < section.content.length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-blue)' }}>
                      {item.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mb-4">
        <h2 className="mb-3">❓ Frequently Asked Questions</h2>
        {filteredFAQs.length === 0 ? (
          <div className="card p-4 text-center">
            <p style={{ color: 'var(--text-secondary)' }}>
              No matching FAQs found. Try a different search term.
            </p>
          </div>
        ) : (
          filteredFAQs.map((faq, index) => (
            <div key={index} className="card mb-2" style={{ overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                  fontWeight: 500,
                  color: 'var(--text-primary)'
                }}
              >
                <span>{faq.question}</span>
                <span style={{ 
                  transform: expandedFAQ === index ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                  marginLeft: '1rem'
                }}>
                  ▼
                </span>
              </button>

              {expandedFAQ === index && (
                <div style={{ 
                  padding: '0 1rem 1rem 1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="card p-4 mb-4">
        <h3 className="mb-3">⌨️ Keyboard Shortcuts</h3>
        <div className="grid sm:grid-cols-2" style={{ gap: '0.75rem' }}>
          {[
            { keys: '/', action: 'Focus search bar' },
            { keys: 'Esc', action: 'Close modal/dropdown' },
            { keys: 'Tab', action: 'Navigate between elements' },
            { keys: 'Enter', action: 'Activate button/link' },
          ].map((shortcut, index) => (
            <div 
              key={index}
              className="flex items-center gap-2"
            >
              <kbd style={{
                background: 'var(--bg-tertiary)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                border: '1px solid var(--border-color)'
              }}>
                {shortcut.keys}
              </kbd>
              <span style={{ color: 'var(--text-secondary)' }}>{shortcut.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact/Support Section */}
      <div className="card p-4 mb-4" style={{ 
        background: 'var(--bg-secondary)',
        textAlign: 'center'
      }}>
        <h3 className="mb-2">Still Need Help?</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Can't find what you're looking for? We're here to help!
        </p>
        <div className="flex justify-center gap-2" style={{ flexWrap: 'wrap' }}>
          <a 
            href="mailto:support@bytesizedbusiness.com"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            ✉️ Email Support
          </a>
          <Link 
            to="/analytics"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            📊 View Platform Stats
          </Link>
        </div>
      </div>

      {/* Version Info */}
      <div className="text-center mb-4" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
        <p>Byte-Sized Business Boost v1.0.0</p>
        <p>FBLA Coding & Programming 2025-2026</p>
      </div>
    </div>
  );
}

export default HelpPage;
