/**
 * Business Claim Page
 * Allows business owners to claim their business and manage it
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBusinessById } from '../utils/api';
import SafeImage from '../components/SafeImage';

function BusinessClaimPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimStep, setClaimStep] = useState(1);
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phone: '',
    role: 'owner',
    verificationMethod: 'email',
    documents: null,
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const data = await getBusinessById(id);
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Store claim request in localStorage (would be API in production)
    const claims = JSON.parse(localStorage.getItem('businessClaims') || '[]');
    claims.push({
      id: `claim_${Date.now()}`,
      businessId: id,
      businessName: business?.name,
      userId: user?.id,
      ...formData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('businessClaims', JSON.stringify(claims));
    
    setSubmitted(true);
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>Please Log In</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            You need to be logged in to claim a business.
          </p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading business details...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mt-4">
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          background: 'var(--bg-secondary)',
          borderRadius: '16px',
          border: '2px solid #4caf50'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#4caf50' }}>Claim Request Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '1rem auto' }}>
            We've received your claim for <strong>{business?.name}</strong>. 
            Our team will verify your information and get back to you within 2-3 business days.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button onClick={() => navigate(`/business/${id}`)} className="btn btn-primary">
              Back to Business
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Browse More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <button 
        onClick={() => navigate(`/business/${id}`)}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--primary-blue)',
          cursor: 'pointer',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        ← Back to {business?.name}
      </button>

      <h1 style={{ marginBottom: '0.5rem' }}>Claim Your Business</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Verify ownership to respond to reviews and manage your listing.
      </p>

      {/* Business Preview */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        background: 'var(--bg-secondary)',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <SafeImage
          src={business?.image_url}
          alt={business?.name}
          category={business?.category}
          style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover' }}
        />
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>{business?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{business?.category}</p>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            {business?.address}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', marginBottom: '2rem', gap: '0.5rem' }}>
        {[1, 2, 3].map(step => (
          <div 
            key={step}
            style={{
              flex: 1,
              height: '4px',
              background: step <= claimStep ? 'var(--primary-blue)' : 'var(--bg-tertiary)',
              borderRadius: '2px',
              transition: 'background 0.3s'
            }}
          />
        ))}
      </div>

      {/* Claim Form */}
      <form onSubmit={handleSubmit}>
        {claimStep === 1 && (
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '12px',
          }}>
            <h3 style={{ marginTop: 0 }}>Step 1: Your Information</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
                placeholder="John Smith"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
                placeholder="owner@business.com"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
                placeholder="(555) 123-4567"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Your Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="employee">Authorized Employee</option>
              </select>
            </div>

            <button 
              type="button"
              onClick={() => setClaimStep(2)}
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={!formData.ownerName || !formData.email}
            >
              Continue
            </button>
          </div>
        )}

        {claimStep === 2 && (
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '12px',
          }}>
            <h3 style={{ marginTop: 0 }}>Step 2: Verification Method</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Choose how you'd like to verify your ownership:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { id: 'email', icon: '📧', title: 'Email Verification', desc: 'We\'ll send a code to your business email' },
                { id: 'phone', icon: '📞', title: 'Phone Verification', desc: 'We\'ll call your business phone number' },
                { id: 'document', icon: '📄', title: 'Document Upload', desc: 'Upload business license or utility bill' },
              ].map(method => (
                <label
                  key={method.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    border: formData.verificationMethod === method.id 
                      ? '2px solid var(--primary-blue)' 
                      : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: formData.verificationMethod === method.id 
                      ? 'rgba(37, 99, 235, 0.1)' 
                      : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="verificationMethod"
                    value={method.id}
                    checked={formData.verificationMethod === method.id}
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{method.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{method.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button"
                onClick={() => setClaimStep(1)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button 
                type="button"
                onClick={() => setClaimStep(3)}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {claimStep === 3 && (
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '12px',
          }}>
            <h3 style={{ marginTop: 0 }}>Step 3: Review & Submit</h3>
            
            <div style={{ 
              background: 'var(--bg-primary)', 
              padding: '1.5rem', 
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Claim Summary</h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Business: </span>
                  <strong>{business?.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Name: </span>
                  <strong>{formData.ownerName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Email: </span>
                  <strong>{formData.email}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Role: </span>
                  <strong style={{ textTransform: 'capitalize' }}>{formData.role}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Verification: </span>
                  <strong style={{ textTransform: 'capitalize' }}>{formData.verificationMethod}</strong>
                </div>
              </div>
            </div>

            <div style={{ 
              padding: '1rem',
              background: 'rgba(37, 99, 235, 0.1)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>What happens next?</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '0.5rem' }}>
                <li>We'll verify your information within 2-3 business days</li>
                <li>You'll receive an email with verification instructions</li>
                <li>Once verified, you can respond to reviews and update your listing</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button"
                onClick={() => setClaimStep(2)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Submit Claim
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default BusinessClaimPage;
