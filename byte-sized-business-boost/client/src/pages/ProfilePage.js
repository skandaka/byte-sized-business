/**
 * Profile Page
 * User profile with statistics and export functionality (Advanced Feature #11)
 * FBLA Rubric: "Customizable reports" - PDF and CSV export capabilities
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserReviews, getUserAnalytics, exportFavorites, getFavorites } from '../utils/api';
import { jsPDF } from 'jspdf';

function ProfilePage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [reviewsData, analyticsData, favoritesData] = await Promise.all([
        getUserReviews(user.id),
        getUserAnalytics(user.id),
        getFavorites(user.id),
      ]);
      setReviews(reviewsData);
      setAnalytics(analyticsData);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export favorites as CSV file
   * Downloads a spreadsheet-compatible file
   */
  const handleExportFavorites = async () => {
    try {
      const blob = await exportFavorites(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-favorites.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      alert('Favorites exported successfully!');
    } catch (error) {
      console.error('Error exporting favorites:', error);
      alert('Failed to export favorites');
    }
  };

  /**
   * Export reviews as PDF file
   * FBLA Rubric: "Customizable reports"
   * 
   * Creates a professional PDF document with:
   * - User profile information
   * - Statistics summary
   * - Complete review history
   * - Favorites list
   */
  const handleExportPDF = async () => {
    setExporting(true);
    
    try {
      // Create new PDF document
      const doc = new jsPDF();
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Helper function to add new page if needed
      const checkPageBreak = (neededSpace = 30) => {
        if (yPosition + neededSpace > 270) {
          doc.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // ===== HEADER =====
      doc.setFillColor(37, 99, 235); // Primary blue
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Byte-Sized Business Boost', pageWidth / 2, 18, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('User Activity Report', pageWidth / 2, 28, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 36, { align: 'center' });

      yPosition = 55;
      doc.setTextColor(0, 0, 0);

      // ===== USER INFO SECTION =====
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Profile Information', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Username: ${user.username}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Email: ${user.email}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Account Type: ${user.is_admin ? 'Administrator' : 'Member'}`, margin, yPosition);
      yPosition += 15;

      // ===== STATISTICS SECTION =====
      if (analytics) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Activity Statistics', margin, yPosition);
        yPosition += 10;

        // Draw stats boxes
        doc.setFillColor(240, 240, 240);
        const boxWidth = (contentWidth - 20) / 3;
        
        // Reviews box
        doc.roundedRect(margin, yPosition, boxWidth, 25, 3, 3, 'F');
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(String(analytics.reviewCount || 0), margin + boxWidth/2, yPosition + 12, { align: 'center' });
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Reviews Written', margin + boxWidth/2, yPosition + 20, { align: 'center' });

        // Favorites box
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin + boxWidth + 10, yPosition, boxWidth, 25, 3, 3, 'F');
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(String(analytics.favoriteCount || 0), margin + boxWidth + 10 + boxWidth/2, yPosition + 12, { align: 'center' });
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Favorites Saved', margin + boxWidth + 10 + boxWidth/2, yPosition + 20, { align: 'center' });

        // Average rating box
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin + (boxWidth + 10) * 2, yPosition, boxWidth, 25, 3, 3, 'F');
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(245, 158, 11);
        const avgRating = analytics.averageRatingGiven ? analytics.averageRatingGiven.toFixed(1) : '0.0';
        doc.text(avgRating, margin + (boxWidth + 10) * 2 + boxWidth/2, yPosition + 12, { align: 'center' });
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Avg Rating Given', margin + (boxWidth + 10) * 2 + boxWidth/2, yPosition + 20, { align: 'center' });

        yPosition += 40;
      }

      // ===== REVIEWS SECTION =====
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Review History', margin, yPosition);
      yPosition += 10;

      if (reviews.length === 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text('No reviews written yet.', margin, yPosition);
        yPosition += 15;
      } else {
        reviews.forEach((review, index) => {
          checkPageBreak(40);

          // Review card background
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');

          // Business name and rating
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(review.business_name || 'Unknown Business', margin + 5, yPosition + 8);

          // Star rating
          const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
          doc.setTextColor(245, 158, 11);
          doc.text(stars, pageWidth - margin - 40, yPosition + 8);

          // Category and date
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`${review.category || 'General'} • ${new Date(review.created_at).toLocaleDateString()}`, margin + 5, yPosition + 16);

          // Comment (truncated if needed)
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          const comment = review.comment.length > 100 ? review.comment.substring(0, 100) + '...' : review.comment;
          const splitComment = doc.splitTextToSize(comment, contentWidth - 10);
          doc.text(splitComment, margin + 5, yPosition + 24);

          yPosition += 40;
        });
      }

      // ===== FAVORITES SECTION =====
      checkPageBreak(50);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Favorite Businesses', margin, yPosition);
      yPosition += 10;

      if (favorites.length === 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text('No favorites saved yet.', margin, yPosition);
        yPosition += 15;
      } else {
        favorites.slice(0, 10).forEach((fav, index) => {
          checkPageBreak(15);

          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.text(`${index + 1}. ${fav.name}`, margin, yPosition);
          
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`${fav.category} • ${fav.address || 'Address not available'}`, margin + 20, yPosition + 5);
          
          yPosition += 12;
        });

        if (favorites.length > 10) {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`... and ${favorites.length - 10} more favorites`, margin, yPosition);
          yPosition += 10;
        }
      }

      // ===== FOOTER =====
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} • Byte-Sized Business Boost • FBLA 2025-2026`,
          pageWidth / 2,
          285,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`${user.username}-activity-report.pdf`);
      alert('PDF report exported successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">My Profile</h1>

      {/* User Info Card */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--primary-blue)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>{user.username}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{user.email}</p>
            <span
              style={{
                background: user.is_admin ? 'var(--warning-yellow)' : 'var(--success-green)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {user.is_admin ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {analytics && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
              {analytics.reviewCount}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Reviews Written</div>
          </div>
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success-green)' }}>
              {analytics.favoriteCount}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Favorite Businesses</div>
          </div>
          <div className="card p-3 text-center">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning-yellow)' }}>
              {analytics.averageRatingGiven ? analytics.averageRatingGiven.toFixed(1) : '0.0'}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Avg Rating Given</div>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="card p-4 mb-4">
        <h3 className="mb-3">Export Your Data</h3>
        <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
          Download your favorites and review history for your records
        </p>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button onClick={handleExportFavorites} className="btn btn-primary">
            📥 Export Favorites (CSV)
          </button>
          <button 
            onClick={handleExportPDF} 
            className="btn btn-secondary"
            disabled={exporting}
          >
            {exporting ? '⏳ Generating...' : '📄 Export Report (PDF)'}
          </button>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="card p-4">
        <h3 className="mb-3">Recent Reviews</h3>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>You haven't written any reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <strong>{review.business_name}</strong>
                    <span
                      className="text-sm"
                      style={{
                        marginLeft: '0.5rem',
                        background: 'var(--bg-tertiary)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {review.category}
                    </span>
                  </div>
                  <span style={{ color: 'var(--warning-yellow)', fontSize: '1.25rem' }}>
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>
                <p>{review.comment}</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
