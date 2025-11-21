/**
 * Register Page
 * User signup form (Advanced Feature #9)
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '450px', margin: '2rem auto' }}>
      <div className="card p-4">
        <h2 className="text-center mb-3">Create Account</h2>
        <p className="text-center mb-3" style={{ color: 'var(--text-secondary)' }}>
          Join to save favorites, write reviews, and claim deals
        </p>

        {error && (
          <div
            style={{
              padding: '1rem',
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
          <div className="mb-2">
            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Username
            </label>
            <input
              id="username"
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              minLength={3}
            />
          </div>

          <div className="mb-2">
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Must be 8+ characters with 1 uppercase and 1 number
            </p>
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-3 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: 500 }}>
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
