/**
 * Empty State Component
 * Displays friendly, actionable empty states throughout the app
 */

import React from 'react';
import { Link } from 'react-router-dom';

function EmptyState({
  icon = '🤷',
  title,
  message,
  actionText,
  actionLink,
  actionOnClick
}) {
  return (
    <div
      className="card p-4 text-center"
      style={{
        maxWidth: '600px',
        margin: '2rem auto',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{icon}</div>
      <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
      <p
        className="mb-3"
        style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          lineHeight: '1.6',
        }}
      >
        {message}
      </p>
      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-primary" style={{ fontSize: '1rem' }}>
            {actionText} →
          </Link>
        ) : (
          <button onClick={actionOnClick} className="btn btn-primary" style={{ fontSize: '1rem' }}>
            {actionText} →
          </button>
        )
      )}
    </div>
  );
}

export default EmptyState;
