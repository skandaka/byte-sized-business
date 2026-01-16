/**
 * QASection Component - Interactive Q&A for Businesses
 * FBLA Rubric: "Intelligent feature such as an interactive Q&A"
 * 
 * This component provides a community-driven Q&A system where users can:
 * - Ask questions about businesses
 * - Answer other users' questions
 * - Upvote helpful answers
 * - See business owner verified responses
 * 
 * Features:
 * - Real-time question/answer submission
 * - Sort by recent, popular, or unanswered
 * - Character count limits with visual feedback
 * - Bot verification for submissions
 * - Semantic content validation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VerificationModal from './VerificationModal';
import { getQnA, createQuestion, createAnswer, upvoteAnswer } from '../utils/api';

/**
 * QASection - Main Q&A component for business detail pages
 * 
 * @param {Object} props - Component props
 * @param {string} props.businessId - The business ID for Q&A
 * @param {string} props.businessName - Business name for display
 */
function QASection({ businessId, businessName }) {
  // State management
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();

  // Character limits for input validation
  const QUESTION_MAX_LENGTH = 500;
  const ANSWER_MAX_LENGTH = 1000;

  /**
   * Fetch Q&A data for the business
   * Retrieves all questions and their answers from the API
   */
  const fetchQnA = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQnA(businessId, sortBy);
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching Q&A:', err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [businessId, sortBy]);

  // Fetch Q&A on mount and when sort changes
  useEffect(() => {
    fetchQnA();
  }, [fetchQnA]);

  /**
   * Handle question submission
   * Triggers verification modal before submitting
   */
  const handleAskQuestion = () => {
    // Validate user is logged in
    if (!user) {
      setError('Please log in to ask a question');
      return;
    }

    // Validate question content
    if (!newQuestion.trim()) {
      setError('Please enter a question');
      return;
    }

    if (newQuestion.length > QUESTION_MAX_LENGTH) {
      setError(`Question must be ${QUESTION_MAX_LENGTH} characters or less`);
      return;
    }

    // Store pending action and show verification
    setPendingAction({ type: 'question', content: newQuestion });
    setShowVerification(true);
  };

  /**
   * Handle answer submission
   * @param {string} questionId - The question being answered
   * @param {string} answerText - The answer content
   */
  const handleSubmitAnswer = (questionId, answerText) => {
    if (!user) {
      setError('Please log in to answer');
      return;
    }

    if (!answerText.trim()) {
      setError('Please enter an answer');
      return;
    }

    if (answerText.length > ANSWER_MAX_LENGTH) {
      setError(`Answer must be ${ANSWER_MAX_LENGTH} characters or less`);
      return;
    }

    setPendingAction({ type: 'answer', questionId, content: answerText });
    setShowVerification(true);
  };

  /**
   * Handle verification success
   * Submits the pending question or answer after bot verification
   * 
   * @param {boolean} verified - Whether verification passed
   */
  const handleVerificationComplete = async (verified) => {
    setShowVerification(false);

    if (!verified || !pendingAction) {
      setPendingAction(null);
      return;
    }

    setError('');
    setSuccess('');

    try {
      if (pendingAction.type === 'question') {
        // Submit new question
        await createQuestion({
          businessId,
          userId: user.id,
          username: user.username,
          question: pendingAction.content
        });

        setNewQuestion('');
        setSuccess('Your question has been posted!');
        fetchQnA();
      } else if (pendingAction.type === 'answer') {
        // Submit new answer
        await createAnswer({
          questionId: pendingAction.questionId,
          userId: user.id,
          username: user.username,
          answer: pendingAction.content,
          isBusinessOwner: false
        });

        setSuccess('Your answer has been posted!');
        fetchQnA();
      }
    } catch (err) {
      console.error('Error submitting:', err);
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
    }

    setPendingAction(null);
  };

  /**
   * Handle answer upvote
   * @param {string} answerId - The answer to upvote
   */
  const handleUpvote = async (answerId) => {
    try {
      await upvoteAnswer(answerId);
      
      // Update local state
      setQuestions(questions.map(q => ({
        ...q,
        answers: q.answers.map(a => 
          a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a
        )
      })));
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  /**
   * Format timestamp for display
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Human-readable date
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="card p-4">
        <h3 className="mb-3">💬 Questions & Answers</h3>
        <div className="text-center p-4">
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p className="mt-2">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      {/* Header with sort options */}
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>💬 Questions & Answers</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input"
          style={{ width: 'auto', padding: '0.5rem 1rem' }}
          aria-label="Sort questions"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Answered</option>
          <option value="unanswered">Unanswered First</option>
        </select>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="mb-3 p-3" style={{ 
          background: 'var(--error-red)', 
          color: 'white', 
          borderRadius: 'var(--radius-md)' 
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-3" style={{ 
          background: 'var(--success-green)', 
          color: 'white', 
          borderRadius: 'var(--radius-md)' 
        }}>
          ✅ {success}
        </div>
      )}

      {/* Ask a question form */}
      <div className="mb-4 p-4" style={{ 
        background: 'var(--bg-secondary)', 
        borderRadius: 'var(--radius-md)' 
      }}>
        <h4 className="mb-2">Have a question about {businessName}?</h4>
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask the community a question..."
          className="input mb-2"
          style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
          maxLength={QUESTION_MAX_LENGTH}
          aria-label="Your question"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ 
            color: newQuestion.length > QUESTION_MAX_LENGTH * 0.9 
              ? 'var(--warning-yellow)' 
              : 'var(--text-tertiary)' 
          }}>
            {newQuestion.length}/{QUESTION_MAX_LENGTH} characters
          </span>
          <button
            onClick={handleAskQuestion}
            className="btn btn-primary"
            disabled={!newQuestion.trim()}
          >
            Ask Question
          </button>
        </div>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="text-center p-4" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '3rem' }}>🤔</span>
          <p className="mt-2">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              isExpanded={expandedQuestion === question.id}
              onToggle={() => setExpandedQuestion(
                expandedQuestion === question.id ? null : question.id
              )}
              onSubmitAnswer={(text) => handleSubmitAnswer(question.id, text)}
              onUpvote={handleUpvote}
              formatDate={formatDate}
              maxAnswerLength={ANSWER_MAX_LENGTH}
              user={user}
            />
          ))}
        </div>
      )}

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerification}
        onClose={() => {
          setShowVerification(false);
          setPendingAction(null);
        }}
        onVerify={handleVerificationComplete}
        title="Verify Your Submission"
      />
    </div>
  );
}

/**
 * QuestionCard - Individual question display component
 * Shows question with expandable answers section
 */
function QuestionCard({ 
  question, 
  isExpanded, 
  onToggle, 
  onSubmitAnswer, 
  onUpvote,
  formatDate,
  maxAnswerLength,
  user
}) {
  const [answerText, setAnswerText] = useState('');

  return (
    <div 
      className="card p-4"
      style={{ 
        border: question.is_answered 
          ? '1px solid var(--success-green)' 
          : '1px solid var(--border-color)' 
      }}
    >
      {/* Question header */}
      <div 
        className="flex justify-between items-start"
        style={{ cursor: 'pointer' }}
        onClick={onToggle}
      >
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Q:</span>
            <p style={{ margin: 0, fontWeight: 500 }}>{question.question}</p>
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            <span>Asked by {question.username}</span>
            <span>•</span>
            <span>{formatDate(question.created_at)}</span>
            <span>•</span>
            <span style={{ 
              color: question.answer_count > 0 ? 'var(--success-green)' : 'var(--text-tertiary)' 
            }}>
              {question.answer_count} {question.answer_count === 1 ? 'answer' : 'answers'}
            </span>
          </div>
        </div>
        <span style={{ 
          fontSize: '1.5rem',
          transition: 'transform 0.2s',
          transform: isExpanded ? 'rotate(180deg)' : 'none'
        }}>
          ▼
        </span>
      </div>

      {/* Expanded answers section */}
      {isExpanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          {/* Existing answers */}
          {question.answers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
              {question.answers.map((answer) => (
                <div 
                  key={answer.id}
                  style={{ 
                    padding: '1rem',
                    background: answer.is_business_owner ? 'var(--success-green-light, #d1fae5)' : 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: answer.is_business_owner ? '4px solid var(--success-green)' : 'none'
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span style={{ fontWeight: 'bold', color: 'var(--success-green)' }}>A:</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 0.5rem 0' }}>{answer.answer}</p>
                      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          <span>
                            {answer.username}
                            {answer.is_business_owner ? (
                              <span style={{
                                marginLeft: '0.5rem',
                                background: 'var(--success-green)',
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                              }}>
                                ✓ OWNER
                              </span>
                            ) : null}
                          </span>
                          <span>•</span>
                          <span>{formatDate(answer.created_at)}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpvote(answer.id);
                          }}
                          className="btn"
                          style={{
                            background: 'var(--bg-tertiary)',
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          👍 {answer.upvotes}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No answers yet. Be the first to help!
            </p>
          )}

          {/* Answer form */}
          {user && (
            <div style={{ 
              padding: '1rem', 
              background: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <h5 className="mb-2">Add Your Answer</h5>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Share your knowledge with the community..."
                className="input mb-2"
                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                maxLength={maxAnswerLength}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ 
                  color: answerText.length > maxAnswerLength * 0.9 
                    ? 'var(--warning-yellow)' 
                    : 'var(--text-tertiary)' 
                }}>
                  {answerText.length}/{maxAnswerLength}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubmitAnswer(answerText);
                    setAnswerText('');
                  }}
                  className="btn btn-primary"
                  disabled={!answerText.trim()}
                >
                  Submit Answer
                </button>
              </div>
            </div>
          )}

          {!user && (
            <p style={{ 
              color: 'var(--text-secondary)', 
              textAlign: 'center',
              padding: '1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <a href="/login" style={{ color: 'var(--primary-blue)' }}>Log in</a> to answer this question
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default QASection;
