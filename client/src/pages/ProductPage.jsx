import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, openLoginModal, isFavorited, toggleFavorite } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const favorited = isFavorited(productId);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.getItemById(productId);
        if (res.success && res.item) {
          setItem(res.item);
        } else {
          setError(res.message || 'Listing not found.');
        }
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Error loading listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [productId]);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleChatClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const sellerId = item.userId?._id || item.userId;
    const currentUserId = user?.id || user?._id;

    if (sellerId && currentUserId && sellerId.toString() === currentUserId.toString()) {
      alert('This is your own listing! You cannot chat with yourself.');
      return;
    }

    // Navigate to dedicated conversation route
    navigate(`/products/${productId}/chat`);
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await API.updateItemStatus(item._id, newStatus, token);
      if (res.success) {
        setItem({ ...item, status: newStatus });
      } else {
        alert(res.message || 'Failed to update status');
      }
    } catch (e) {
      alert('Error updating status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      const res = await API.deleteItem(item._id, token);
      if (res.success) {
        alert('Listing deleted successfully');
        navigate('/');
      } else {
        alert(res.message || 'Failed to delete listing');
      }
    } catch (e) {
      alert('Error deleting listing');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) return;

    try {
      const res = await API.createReport(
        {
          itemId: item._id,
          reason: reportReason,
          description: reportDetails,
          reporterEmail: user?.email || ''
        },
        token
      );
      if (res.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReportSuccess(false);
        }, 2000);
      }
    } catch (e) {
      alert('Error submitting report');
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⏳</div>
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading product details...</p>
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <div className="icon">⚠️</div>
          <h3>Listing Not Found</h3>
          <p>{error || 'The requested ad may have been removed or does not exist.'}</p>
          <Link to="/" className="submit-primary-btn" style={{ display: 'inline-block', maxWidth: '200px' }}>
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const sellerObj = typeof item.userId === 'object' && item.userId !== null ? item.userId : null;
  const sellerId = sellerObj?._id || item.userId;
  const sellerDisplayName = sellerObj?.name || item.sellerName || 'Verified Seller';
  const sellerDisplayPhone = sellerObj?.phone || item.sellerPhone || '+91 98000 00000';
  const isOwner = user && (user.id === sellerId?.toString() || user._id === sellerId?.toString() || user.role === 'admin');

  return (
    <main className="main-content">
      {/* Breadcrumbs */}
      <div className="breadcrumbs-bar">
        <Link to="/">Home</Link>
        <span>&rsaquo;</span>
        <Link to={`/?category=${encodeURIComponent(item.category)}`}>{item.category}</Link>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.title}</span>
      </div>

      <div className="product-page-layout">
        {/* Left Column: Image & Details */}
        <div className="product-left-col">
          <div className="product-image-card">
            <div className="product-main-img-wrap">
              <img
                src={item.image || '/uploads/item-default.svg'}
                alt={item.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23002f34"/><text x="50%" y="50%" fill="%23ffce32" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">OLX Marketplace</text></svg>';
                }}
              />
            </div>
            {item.status && item.status !== 'listed' && (
              <span className={`status-badge ${item.status}`} style={{ top: '20px', left: '20px', fontSize: '0.9rem' }}>
                {item.status.toUpperCase()}
              </span>
            )}
          </div>

          <div className="product-info-card">
            <h3>Overview & Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="label">Category</span>
                <span className="value">{item.category}</span>
              </div>
              <div className="spec-item">
                <span className="label">Location</span>
                <span className="value">📍 {item.location}</span>
              </div>
              <div className="spec-item">
                <span className="label">Date Posted</span>
                <span className="value">{formatDate(item.createdAt)}</span>
              </div>
              <div className="spec-item">
                <span className="label">Ad Reference ID</span>
                <span className="value">#{item._id?.slice(-8).toUpperCase()}</span>
              </div>
            </div>

            <h3 style={{ marginTop: '32px' }}>Description</h3>
            <p className="product-description-text">{item.description}</p>
          </div>
        </div>

        {/* Right Column: Price, Seller & Actions */}
        <div className="product-right-col">
          {/* Price Card */}
          <div className="price-summary-card">
            <div className="price-top-row">
              <div className="product-detail-price">{formatPrice(item.price)}</div>
              <button
                className={`product-detail-fav-btn ${favorited ? 'active' : ''}`}
                onClick={() => toggleFavorite(item._id)}
                title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorited ? '❤️' : '🤍'}
              </button>
            </div>

            <h1 className="product-detail-title">{item.title}</h1>

            <div className="product-meta-row">
              <span>📍 {item.location}</span>
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>

          {/* Seller Card (Links to Seller Information Page) */}
          <div className="seller-summary-card">
            <h4>Seller Information</h4>

            <div
              className="seller-click-card"
              onClick={() => navigate(`/seller/${sellerId}`)}
              title="Click to view seller profile & all their ads"
            >
              <div className="seller-big-avatar">
                {sellerDisplayName.charAt(0).toUpperCase()}
              </div>
              <div className="seller-info-text">
                <div className="name-row">
                  <span>{sellerDisplayName}</span>
                  <span className="verified-badge" title="Verified Member">✓</span>
                </div>
                <div className="member-since">
                  Member since {sellerObj?.createdAt ? new Date(sellerObj.createdAt).getFullYear() : '2024'}
                </div>
                <div className="view-seller-profile-link">
                  View seller profile & all listings &rarr;
                </div>
              </div>
            </div>

            <div className="seller-actions-wrap">
              <button className="chat-seller-action-btn" onClick={handleChatClick}>
                <span>💬</span>
                <span>Chat with Seller</span>
              </button>

              <button
                className="phone-seller-btn"
                onClick={() => setShowPhone(!showPhone)}
              >
                <span>📞</span>
                <span>{showPhone ? sellerDisplayPhone : 'Show Phone Number'}</span>
              </button>
            </div>
          </div>

          {/* Owner / Admin Controls */}
          {isOwner && (
            <div className="owner-controls-card">
              <h4>👑 Ad Management Controls (Owner/Admin)</h4>
              <div className="status-change-row">
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</label>
                <select
                  value={item.status || 'listed'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdating}
                >
                  <option value="listed">Listed (Active)</option>
                  <option value="sold">Mark as Sold</option>
                  <option value="reserved">Mark as Reserved</option>
                </select>
              </div>
              <button className="delete-listing-btn" onClick={handleDeleteItem}>
                🗑️ Delete Listing
              </button>
            </div>
          )}

          {/* Safety Tips */}
          <div className="safety-tips-card">
            <h4>Safety Tips for Buyers</h4>
            <ul>
              <li>Meet seller at a safe public location</li>
              <li>Inspect the product thoroughly in person</li>
              <li>Never wire advance payments or scan QR codes</li>
              <li>Pay only after taking possession of the item</li>
            </ul>
          </div>

          {/* Report Ad Link */}
          <button
            className="report-listing-btn"
            onClick={() => setReportModalOpen(true)}
          >
            ⚠️ Report this listing
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setReportModalOpen(false)}>
              &times;
            </button>
            <div className="modal-header-section">
              <h3>Report this Ad</h3>
              <p>Help keep OLX India safe and secure</p>
            </div>
            <div className="modal-body">
              {reportSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--success)' }}>
                  <h3>✅ Report Submitted</h3>
                  <p>Our trust and safety team will inspect this listing.</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit}>
                  <div className="form-field">
                    <label>Reason *</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="Scam or Fraud">Scam or Fraud (Asked advance payment)</option>
                      <option value="Counterfeit Product">Counterfeit or Fake Product</option>
                      <option value="Inappropriate Content">Inappropriate Content</option>
                      <option value="Duplicate Ad">Duplicate or Spam Listing</option>
                      <option value="Other">Other Violation</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Additional Details</label>
                    <textarea
                      rows={3}
                      placeholder="Explain what seems suspicious..."
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="submit-primary-btn">
                    Submit Report
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
