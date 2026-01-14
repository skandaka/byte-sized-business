/**
 * Password Strength Meter Component
 * Real-time visual feedback for password requirements
 */

import React from 'react';

function PasswordStrengthMeter({ password }) {
  const requirements = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'Contains uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Contains number', test: /[0-9]/.test(password) },
  ];

  const passedRequirements = requirements.filter((req) => req.test).length;
  const strength =
    passedRequirements === 0
      ? 'none'
      : passedRequirements <= 2
      ? 'weak'
      : passedRequirements === 3
      ? 'medium'
      : 'strong';

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'strong':
        return '#10b981';
      default:
        return 'var(--border-color)';
    }
  };

  const getStrengthLabel = () => {
    switch (strength) {
      case 'weak':
        return '🔴 Weak';
      case 'medium':
        return '🟡 Medium';
      case 'strong':
        return '🟢 Strong';
      default:
        return '';
    }
  };

  if (!password) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Strength Indicator Bar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '0.5rem',
        }}
      >
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            style={{
              height: '4px',
              flex: 1,
              borderRadius: '2px',
              background:
                index <= passedRequirements
                  ? getStrengthColor()
                  : 'var(--border-color)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Strength Label */}
      {strength !== 'none' && (
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: getStrengthColor(),
            marginBottom: '0.5rem',
          }}
        >
          {getStrengthLabel()}
        </div>
      )}

      {/* Requirements Checklist */}
      <div style={{ fontSize: '0.875rem' }}>
        {requirements.map((req, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem',
              color: req.test ? 'var(--success-green)' : 'var(--text-tertiary)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{req.test ? '✅' : '⬜'}</span>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordStrengthMeter;
