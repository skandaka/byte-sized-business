/**
 * Deal Card Component
 * Displays deal with countdown timer (Required Feature #5)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { claimDeal } from '../utils/api';
import VerificationModal from './VerificationModal';

function DealCard({ deal }) {
  const { user } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Calculate time remaining
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expiration = new Date(deal.expiration_date);
      const diff = expiration - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deal.expiration_date]);

  const handleClaimClick = () => {
    if (!user) {
      alert('Please log in to claim deals');
      return;
    }
    setShowVerification(true);
  };

  const handleVerificationSuccess = async () => {
    try {
      const result = await claimDeal(deal.id, user.id, 'verified_' + Date.now());
      setClaimed(true);
      alert(`Deal claimed! Your code: ${result.deal.discount_code}`);
    } catch (error) {
      console.error('Error claiming deal:', error);
      alert('Failed to claim deal');
    }
  };

  const isExpired = timeRemaining === 'Expired';
  const isExpiringSoon = deal.daysRemaining <= 7 && !isExpired;

  return (
    <>
      <div
        className="card p-3"
        style={{
          opacity: isExpired ? 0.6 : 1,
          border: isExpiringSoon ? '2px solid var(--warning-yellow)' : undefined,
        }}
      >
        {/* Deal Header */}
        <div className="flex justify-between items-start mb-2">
          <h4>{deal.title}</h4>
          {isExpiringSoon && !isExpired && (
            <span
              style={{
                background: 'var(--warning-yellow)',
                color: 'var(--gray-900)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              ⏰ EXPIRING SOON
            </span>
          )}
          {isExpired && (
            <span
              style={{
                background: 'var(--gray-400)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              EXPIRED
            </span>
          )}
        </div>

        {/* Business Name */}
        {deal.business_name && (
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            📍 {deal.business_name}
          </p>
        )}

        {/* Description */}
        <p className="mb-3">{deal.description}</p>

        {/* Countdown Timer */}
        <div
          className="mb-3"
          style={{
            background: 'var(--bg-tertiary)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}
        >
          <div className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            {isExpired ? 'Expired' : 'Expires in:'}
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: isExpiringSoon ? 'var(--warning-yellow)' : 'var(--text-primary)',
            }}
          >
            {timeRemaining}
          </div>
        </div>

        {/* Terms */}
        {deal.terms && (
          <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
            <strong>Terms:</strong> {deal.terms}
          </p>
        )}

        {/* Claim Button */}
        <button
          onClick={handleClaimClick}
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={isExpired || claimed}
        >
          {claimed ? '✓ Claimed' : isExpired ? 'Expired' : 'Claim Deal'}
        </button>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerificationSuccess}
      />
    </>
  );
}

export default DealCard;
