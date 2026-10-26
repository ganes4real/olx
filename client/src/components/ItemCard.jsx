import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ItemCard = ({ item }) => {
  const { isFavorited, toggleFavorite } = useAuth();
  const favorited = isFavorited(item._id);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item._id);
  };

  return (
    <div className="item-card">
      <Link to={`/products/${item._id}`}>
        <div className="card-img-wrapper">
          <img
            src={item.image || '/uploads/item-default.svg'}
            alt={item.title}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23002f34"/><text x="50%" y="50%" fill="%23ffce32" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">OLX Marketplace</text></svg>';
            }}
          />

          {item.status && item.status !== 'listed' && (
            <span className={`status-badge ${item.status}`}>
              {item.status}
            </span>
          )}

          <button
            type="button"
            className={`card-fav-btn ${favorited ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favorited ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="card-body">
          <div className="card-price">{formatPrice(item.price)}</div>
          <h4 className="card-title" title={item.title}>
            {item.title}
          </h4>

          <div className="card-footer">
            <span className="location" title={item.location}>
              📍 {item.location}
            </span>
            <span className="date">{formatDate(item.createdAt)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
