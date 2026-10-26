import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../services/api';
import { ItemCard } from '../components/ItemCard';

export const SellerProfilePage = () => {
  const { sellerId } = useParams();

  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [statusTab, setStatusTab] = useState('all'); // 'all', 'listed', 'sold'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      setError('');
      try {
        const [profRes, itemsRes] = await Promise.all([
          API.getUserProfile(sellerId),
          API.getUserItems(sellerId, statusTab)
        ]);

        if (profRes.success && profRes.user) {
          setProfile(profRes.user);
        } else {
          setError(profRes.message || 'Seller profile not found');
        }

        if (itemsRes.success && itemsRes.items) {
          setItems(itemsRes.items);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Error fetching seller details:', err);
        setError('Error loading seller information');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId, statusTab]);

  if (loading) {
    return (
      <main className="main-content">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>👤</div>
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading seller profile & inventory...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <div className="icon">⚠️</div>
          <h3>Seller Profile Not Found</h3>
          <p>{error || 'The seller you are looking for does not exist or has been disabled.'}</p>
          <Link to="/" className="submit-primary-btn" style={{ display: 'inline-block', maxWidth: '200px' }}>
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const memberYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : '2024';

  return (
    <main className="main-content seller-page-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs-bar">
        <Link to="/">Home</Link>
        <span>&rsaquo;</span>
        <span>Sellers</span>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{profile.name}</span>
      </div>

      {/* Seller Hero Profile Card */}
      <div className="seller-hero-profile-card">
        <div className="seller-main-info">
          <div className="seller-huge-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="seller-text-details">
            <h2>
              <span>{profile.name}</span>
              <span style={{ color: 'var(--accent-mint)', fontSize: '1.2rem' }} title="Verified User">
                ✓
              </span>
            </h2>
            <div className="sub">
              Verified Marketplace Member since {memberYear} &bull; Role: {profile.role || 'Member'}
            </div>

            <div className="seller-contact-badges">
              {profile.phone && (
                <span className="contact-pill">
                  <span>📞</span> {profile.phone}
                </span>
              )}
              {profile.email && (
                <span className="contact-pill">
                  <span>✉️</span> {profile.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Counter */}
        <div className="seller-stats-counter">
          <div className="stat-box">
            <span className="count">{profile.stats?.total || 0}</span>
            <span className="lbl">Total Ads</span>
          </div>
          <div className="stat-box">
            <span className="count" style={{ color: 'var(--accent-mint)' }}>
              {profile.stats?.active || 0}
            </span>
            <span className="lbl">Active Listed</span>
          </div>
          <div className="stat-box">
            <span className="count" style={{ color: 'var(--text-light)' }}>
              {profile.stats?.sold || 0}
            </span>
            <span className="lbl">Sold</span>
          </div>
        </div>
      </div>

      {/* Product Listings Section Header & Filter Tabs */}
      <div className="section-header-bar">
        <div className="section-title-wrap">
          <h2>Products Released by {profile.name}</h2>
          <div className="sub">Browse all verified classifieds posted by this seller</div>
        </div>

        <div className="filter-tabs-row">
          <button
            className={`filter-tab ${statusTab === 'all' ? 'active' : ''}`}
            onClick={() => setStatusTab('all')}
          >
            All Products Released ({profile.stats?.total || 0})
          </button>
          <button
            className={`filter-tab ${statusTab === 'listed' ? 'active' : ''}`}
            onClick={() => setStatusTab('listed')}
          >
            Available ({profile.stats?.active || 0})
          </button>
          <button
            className={`filter-tab ${statusTab === 'sold' ? 'active' : ''}`}
            onClick={() => setStatusTab('sold')}
          >
            Sold ({profile.stats?.sold || 0})
          </button>
        </div>
      </div>

      {/* Seller Products Grid */}
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>No products in this section</h3>
          <p>
            {statusTab === 'sold'
              ? 'This seller has not marked any items as sold yet.'
              : 'This seller has no active listings currently.'}
          </p>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
};
