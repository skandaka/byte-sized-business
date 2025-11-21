/**
 * Verification Modal Component
 * Simple math CAPTCHA for bot prevention (Required Feature #6)
 */

import React, { useState, useEffect } from 'react';

function VerificationModal({ isOpen, onClose, onVerify }) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState('');

  // Generate new math problem when modal opens
  useEffect(() => {
    if (isOpen) {
      setNum1(Math.floor(Math.random() * 10) + 1);
      setNum2(Math.floor(Math.random() * 10) + 1);
      setUserAnswer('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctAnswer = num1 + num2;
    const answer = parseInt(userAnswer);

    if (answer === correctAnswer) {
      // Verification successful
      onVerify(true);
      onClose();
    } else {
      // Wrong answer
      setError('Incorrect answer. Please try again.');
      // Generate new problem
      setNum1(Math.floor(Math.random() * 10) + 1);
      setNum2(Math.floor(Math.random() * 10) + 1);
      setUserAnswer('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-labelledby="verification-title"
      aria-modal="true"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '400px' }}
      >
        <h3 id="verification-title" className="mb-3">
          Verify You're Human
        </h3>

        <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
          Please solve this simple math problem to continue:
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error-red)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--error-red)',
              marginBottom: '1rem',
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {num1} + {num2} = ?
            </div>

            <input
              type="number"
              className="input"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer"
              required
              autoFocus
              style={{ textAlign: 'center', fontSize: '1.5rem', maxWidth: '150px', margin: '0 auto' }}
              aria-label="Answer to math problem"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Verify
            </button>
          </div>
        </form>

        <p className="text-sm mt-3 text-center" style={{ color: 'var(--text-tertiary)' }}>
          This helps us prevent automated spam and abuse.
        </p>
      </div>
    </div>
  );
}

export default VerificationModal;
