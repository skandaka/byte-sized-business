/**
 * TutorialModal Component - Onboarding Tour for New Users
 * FBLA Rubric: "Clear instructions are provided"
 * 
 * This component provides an interactive walkthrough for new users,
 * introducing key features and guiding them through the platform.
 * 
 * Features:
 * - Step-by-step guided tour
 * - Visual feature highlights
 * - Progress indicators
 * - Skip/complete options
 * - Remembers completion status
 */

import React, { useState, useEffect } from 'react';

/**
 * Tutorial steps configuration
 * Each step includes title, description, icon, and tips
 */
const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Byte-Sized Business Boost! 🎉',
    description: 'Your gateway to discovering and supporting local businesses in your community. Let\'s take a quick tour to help you get started!',
    icon: '🏪',
    tips: [
      'This platform focuses exclusively on local, family-owned businesses',
      'Our LBAI algorithm filters out corporate chains automatically',
      'You can skip this tutorial anytime and access Help from the menu'
    ]
  },
  {
    id: 'search',
    title: 'Search & Discover 🔍',
    description: 'Find the perfect local spot using our powerful search and filter tools.',
    icon: '🔍',
    tips: [
      'Use the search bar to find businesses by name or keyword',
      'Filter by category: Food, Retail, Services, Entertainment, Health',
      'Sort results by rating, reviews, or alphabetically',
      'Set your location for accurate distance calculations'
    ],
    image: 'search-demo'
  },
  {
    id: 'reviews',
    title: 'Reviews & Ratings ⭐',
    description: 'Share your experiences and help others discover great local businesses.',
    icon: '⭐',
    tips: [
      'Click any business to view its detail page',
      'Navigate to the Reviews tab to read or write reviews',
      'Rate from 1-5 stars and share your thoughts',
      'Mark helpful reviews to surface the best content',
      'Complete a quick verification to prevent spam'
    ]
  },
  {
    id: 'favorites',
    title: 'Save Your Favorites ❤️',
    description: 'Keep track of businesses you love for easy access later.',
    icon: '❤️',
    tips: [
      'Click the heart icon on any business to save it',
      'Access all favorites from the Favorites page',
      'Export your favorites as CSV from your Profile',
      'Favorites sync across devices when logged in'
    ]
  },
  {
    id: 'deals',
    title: 'Exclusive Deals 🎁',
    description: 'Get special discounts and offers from local businesses.',
    icon: '🎁',
    tips: [
      'Browse deals on the dedicated Deals page',
      'Watch countdown timers for expiring offers',
      'Claim deals to reveal discount codes',
      'Check "People claimed" to see popular offers',
      'Look for "Expiring Soon" badges!'
    ]
  },
  {
    id: 'qna',
    title: 'Ask Questions 💬',
    description: 'Get answers from the community and business owners.',
    icon: '💬',
    tips: [
      'Visit the Q&A tab on any business page',
      'Ask questions about products, services, or hours',
      'Answer questions to help fellow users',
      'Upvote helpful answers',
      'Look for verified owner responses!'
    ]
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'You\'re ready to start exploring local businesses!',
    icon: '🎊',
    tips: [
      'Create an account to unlock all features',
      'Visit Help anytime for more information',
      'Support local businesses in your community!',
      'Have fun discovering hidden gems! 🌟'
    ]
  }
];

/**
 * TutorialModal - Main tutorial component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Handler for closing modal
 * @param {Function} props.onComplete - Handler for completing tutorial
 */
function TutorialModal({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Reset to first step when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  /**
   * Navigate to next step with animation
   */
  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setAnimating(false);
    }, 200);
  };

  /**
   * Navigate to previous step
   */
  const handlePrev = () => {
    if (isFirstStep) return;
    
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setAnimating(false);
    }, 200);
  };

  /**
   * Skip tutorial
   */
  const handleSkip = () => {
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleSkip}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div 
        className="card"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'modalScale 0.3s ease-out',
          opacity: animating ? 0.5 : 1,
          transform: animating ? 'scale(0.95)' : 'scale(1)',
          transition: 'opacity 0.2s, transform 0.2s'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div style={{ 
          height: '4px', 
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              height: '100%',
              width: `${progress}%`,
              background: 'var(--primary-blue)',
              transition: 'width 0.3s ease-out'
            }} 
          />
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Step indicator */}
          <div className="flex justify-between items-center mb-4">
            <span 
              style={{ 
                background: 'var(--bg-tertiary)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}
            >
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <button
              onClick={handleSkip}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: '0.5rem',
                fontSize: '1.25rem'
              }}
              aria-label="Close tutorial"
            >
              ✕
            </button>
          </div>

          {/* Icon */}
          <div 
            style={{ 
              fontSize: '4rem', 
              textAlign: 'center',
              marginBottom: '1rem'
            }}
          >
            {step.icon}
          </div>

          {/* Title */}
          <h2 
            id="tutorial-title"
            style={{ 
              textAlign: 'center',
              marginBottom: '0.75rem',
              color: 'var(--primary-blue)'
            }}
          >
            {step.title}
          </h2>

          {/* Description */}
          <p 
            style={{ 
              textAlign: 'center',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            {step.description}
          </p>

          {/* Tips List */}
          <div 
            style={{ 
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              💡 Key Points:
            </h4>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1.25rem',
              color: 'var(--text-secondary)'
            }}>
              {step.tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '0.5rem', lineHeight: 1.5 }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Step Dots */}
          <div className="flex justify-center gap-1 mb-4">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                style={{
                  width: index === currentStep ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '999px',
                  background: index === currentStep ? 'var(--primary-blue)' : 'var(--bg-tertiary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-2">
            <button
              onClick={handlePrev}
              className="btn"
              style={{
                visibility: isFirstStep ? 'hidden' : 'visible',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
            >
              ← Previous
            </button>

            <button
              onClick={handleSkip}
              className="btn"
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)'
              }}
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              {isLastStep ? 'Get Started! 🚀' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage tutorial state
 * Stores completion status in localStorage
 */
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('tutorial_completed');
    if (!hasSeenTutorial) {
      // Show tutorial after a short delay for first-time users
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem('tutorial_completed', 'true');
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem('tutorial_completed');
    setShowTutorial(true);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const openTutorial = () => {
    setShowTutorial(true);
  };

  return {
    showTutorial,
    completeTutorial,
    resetTutorial,
    closeTutorial,
    openTutorial
  };
}

export default TutorialModal;
