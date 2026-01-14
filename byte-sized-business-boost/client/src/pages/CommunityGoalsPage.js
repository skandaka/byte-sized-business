/**
 * Community Goals Page
 * Monthly challenges, leaderboard, badges and achievements
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';

// Monthly challenges
const MONTHLY_CHALLENGES = [
  {
    id: 'visit-5-restaurants',
    title: '🍽️ Foodie Explorer',
    description: 'Visit 5 different local restaurants this month',
    category: 'Food',
    target: 5,
    points: 100,
    badge: '🏆',
  },
  {
    id: 'try-3-cafes',
    title: '☕ Coffee Connoisseur',
    description: 'Try 3 different local cafes',
    category: 'Food',
    target: 3,
    points: 75,
    badge: '☕',
  },
  {
    id: 'support-local-retail',
    title: '🛍️ Shop Local Champion',
    description: 'Make purchases at 4 local retail stores',
    category: 'Retail',
    target: 4,
    points: 100,
    badge: '🛍️',
  },
  {
    id: 'wellness-warrior',
    title: '💪 Wellness Warrior',
    description: 'Visit 3 health or fitness businesses',
    category: 'Health',
    target: 3,
    points: 75,
    badge: '💪',
  },
  {
    id: 'entertainment-explorer',
    title: '🎭 Entertainment Explorer',
    description: 'Attend 2 local entertainment venues',
    category: 'Entertainment',
    target: 2,
    points: 50,
    badge: '🎭',
  },
  {
    id: 'review-master',
    title: '⭐ Review Master',
    description: 'Write 5 reviews for local businesses',
    category: 'All',
    target: 5,
    points: 125,
    badge: '⭐',
  },
  {
    id: 'deal-hunter',
    title: '💰 Deal Hunter',
    description: 'Claim 3 deals from local businesses',
    category: 'All',
    target: 3,
    points: 75,
    badge: '💰',
  },
  {
    id: 'neighborhood-hero',
    title: '🦸 Neighborhood Hero',
    description: 'Visit 10 different local businesses',
    category: 'All',
    target: 10,
    points: 200,
    badge: '🦸',
  },
];

// Simulated leaderboard
const MOCK_LEADERBOARD = [
  { rank: 1, username: 'LocalExplorer', points: 2450, badges: 12, avatar: '👤' },
  { rank: 2, username: 'ShopLocalFan', points: 2180, badges: 10, avatar: '👤' },
  { rank: 3, username: 'FoodieJane', points: 1950, badges: 9, avatar: '👤' },
  { rank: 4, username: 'CommunityChamp', points: 1720, badges: 8, avatar: '👤' },
  { rank: 5, username: 'NeighborhoodNinja', points: 1580, badges: 7, avatar: '👤' },
];

function CommunityGoalsPage() {
  const { user } = useAuth();
  const { location } = useBusiness();
  const [activeTab, setActiveTab] = useState('challenges');
  const [userProgress, setUserProgress] = useState({});
  const [userPoints, setUserPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    loadUserProgress();
  }, [user]);

  const loadUserProgress = () => {
    // Load from localStorage (or API in production)
    const saved = localStorage.getItem('communityProgress');
    if (saved) {
      const data = JSON.parse(saved);
      setUserProgress(data.progress || {});
      setUserPoints(data.points || 0);
      setEarnedBadges(data.badges || []);
    }
  };

  const saveUserProgress = (progress, points, badges) => {
    localStorage.setItem('communityProgress', JSON.stringify({ progress, points, badges }));
    setUserProgress(progress);
    setUserPoints(points);
    setEarnedBadges(badges);
  };

  const incrementProgress = (challengeId) => {
    const challenge = MONTHLY_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return;

    const currentProgress = userProgress[challengeId] || 0;
    const newProgress = Math.min(currentProgress + 1, challenge.target);
    
    const newUserProgress = { ...userProgress, [challengeId]: newProgress };
    let newPoints = userPoints;
    let newBadges = [...earnedBadges];

    // Check if challenge completed
    if (newProgress >= challenge.target && currentProgress < challenge.target) {
      newPoints += challenge.points;
      if (!newBadges.includes(challenge.badge)) {
        newBadges.push(challenge.badge);
      }
    }

    saveUserProgress(newUserProgress, newPoints, newBadges);
  };

  const getProgressPercent = (challengeId, target) => {
    const progress = userProgress[challengeId] || 0;
    return Math.round((progress / target) * 100);
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>🎯 Community Goals</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Complete challenges, earn badges, and support local businesses!
          </p>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          border: '2px solid var(--primary-blue)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {userPoints}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Points</div>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Your Badges</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {earnedBadges.map((badge, idx) => (
              <span key={idx} style={{ fontSize: '2rem' }}>{badge}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('challenges')}
          className="btn"
          style={{
            background: activeTab === 'challenges' ? 'var(--primary-blue)' : 'var(--bg-tertiary)',
            color: activeTab === 'challenges' ? 'white' : 'var(--text-primary)',
          }}
        >
          🎯 Challenges
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className="btn"
          style={{
            background: activeTab === 'leaderboard' ? 'var(--primary-blue)' : 'var(--bg-tertiary)',
            color: activeTab === 'leaderboard' ? 'white' : 'var(--text-primary)',
          }}
        >
          🏆 Leaderboard
        </button>
      </div>

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {MONTHLY_CHALLENGES.map((challenge) => {
            const progress = userProgress[challenge.id] || 0;
            const isCompleted = progress >= challenge.target;
            const percent = getProgressPercent(challenge.id, challenge.target);

            return (
              <div 
                key={challenge.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: isCompleted ? '2px solid #4caf50' : '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{challenge.badge}</span>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{challenge.title}</h3>
                      {isCompleted && <span style={{ color: '#4caf50', fontSize: '1.25rem' }}>✓</span>}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                      {challenge.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div style={{ 
                      background: 'var(--bg-tertiary)', 
                      borderRadius: '999px', 
                      height: '8px',
                      marginTop: '1rem',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: isCompleted ? '#4caf50' : 'var(--primary-blue)',
                        height: '100%',
                        width: `${percent}%`,
                        transition: 'width 0.3s ease',
                        borderRadius: '999px',
                      }} />
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <span>{progress} / {challenge.target}</span>
                      <span>{challenge.points} pts</span>
                    </div>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => incrementProgress(challenge.id)}
                      className="btn btn-primary"
                      style={{ marginLeft: '1rem' }}
                    >
                      Log Progress
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Rank</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>User</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)' }}>Points</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)' }}>Badges</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADERBOARD.map((entry) => (
                <tr 
                  key={entry.rank}
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    background: entry.rank <= 3 ? 'rgba(37, 99, 235, 0.1)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    {entry.rank === 1 && '🥇'}
                    {entry.rank === 2 && '🥈'}
                    {entry.rank === 3 && '🥉'}
                    {entry.rank > 3 && `#${entry.rank}`}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{entry.avatar}</span>
                      {entry.username}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                    {entry.points.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {entry.badges}
                  </td>
                </tr>
              ))}
              
              {/* Current user row */}
              {user && (
                <tr style={{ 
                  background: 'var(--primary-blue)',
                  color: 'white'
                }}>
                  <td style={{ padding: '1rem' }}>You</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>👤</span>
                      {user.username}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                    {userPoints.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {earnedBadges.length}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Location Info */}
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        📍 Challenges count towards businesses in {location?.name || 'Chicago, IL'}
      </div>
    </div>
  );
}

export default CommunityGoalsPage;
