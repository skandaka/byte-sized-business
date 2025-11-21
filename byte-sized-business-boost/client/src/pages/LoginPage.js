/**
 * Login Page Component
 * User authentication form
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
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
        <h2 className="text-center mb-3">Welcome Back!</h2>
        <p className="text-center mb-3" style={{ color: 'var(--text-secondary)' }}>
          Login to access your favorites, write reviews, and claim deals
        </p>

        {error && (
          <div
            style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error-red)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--error-red)',
              marginBottom: '1rem'
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="user@demo.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
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
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-3 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: 500 }}>
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-3" style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <p className="text-sm" style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
            Demo Accounts:
          </p>
          <p className="text-sm" style={{ marginBottom: '0.25rem' }}>
            <strong>User:</strong> user@demo.com / Demo123!
          </p>
          <p className="text-sm">
            <strong>Admin:</strong> admin@demo.com / Admin123!
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
