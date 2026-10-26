import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ItemCard } from '../components/ItemCard';
import { CategoriesBar } from '../components/CategoriesBar';

export const HomePage = ({ searchParam = '', locationParam = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, setSellModalOpen, favoritesCount } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active filters
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'categories', 'favorites', 'myAds'
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [categoryCounts, setCategoryCounts] = useState([]);

  // Fetch Category Counts
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.getCategories();
        if (res.success && res.categories) {
          setCategoryCounts(res.categories);
        }
      } catch (e) {
        console.warn('Error fetching categories:', e);
      }
    };
    fetchCats();
  }, []);

  // Fetch Items based on current filters
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'favorites') {
        if (!user) {
          setItems([]);
          setLoading(false);
          return;
        }
        const res = await API.getUserFavorites(user.id || user._id, token);
        if (res.success && res.items) {
          setItems(res.items);
        } else {
          setItems([]);
        }
        setLoading(false);
        return;
      }

      if (activeTab === 'myAds') {
        if (!user) {
          setItems([]);
          setLoading(false);
          return;
        }
        const res = await API.getUserItems(user.id || user._id, 'all');
        if (res.success && res.items) {
          setItems(res.items);
        } else {
          setItems([]);
        }
        setLoading(false);
        return;
      }

      // Default 'all' tab query
      const query = {
        search: searchParam || searchParams.get('search') || '',
        category: selectedCategory,
        location: locationParam || searchParams.get('location') || '',
        sort: selectedSort
      };

      const res = await API.getItems(query);
      if (res.success && res.items) {
        setItems(res.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Could not connect to marketplace server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, selectedSort, searchParam, locationParam, searchParams, user, token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchParams({});
    setActiveTab('all');
  };

  const currentSearch = searchParam || searchParams.get('search') || '';
  const currentLocation = locationParam || searchParams.get('location') || '';

  return (
    <>
      <CategoriesBar
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      <main className="main-content">
        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-text">
            <h1>India's Trusted Marketplace</h1>
            <p>
              Buy & sell cars, phones, real estate & more safely with verified seller profiles, image uploads, and live chat.
            </p>
          </div>
          <div>
            <button className="hero-sell-action" onClick={() => setSellModalOpen(true)}>
              <span>+</span>
              <span>Start Selling Free</span>
            </button>
          </div>
        </section>

        {/* Section Header & View Controls */}
        <div className="section-header-bar">
          <div className="section-title-wrap">
            <h2>
              {activeTab === 'favorites'
                ? 'Your Favorite Listings'
                : activeTab === 'myAds'
                ? 'Your Active Ads'
                : selectedCategory !== 'All'
                ? `${selectedCategory} for sale`
                : 'Fresh recommendations'}
            </h2>
            <div className="sub">
              {loading ? 'Searching listings...' : `Showing ${items.length} listings`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* View Tabs */}
            <div className="filter-tabs-row">
              <button
                className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Ads
              </button>
              <button
                className={`filter-tab ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                🗂️ Categories
              </button>
              <button
                className={`filter-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                ❤️ Favorites ({favoritesCount})
              </button>
              {user && (
                <button
                  className={`filter-tab ${activeTab === 'myAds' ? 'active' : ''}`}
                  onClick={() => setActiveTab('myAds')}
                >
                  My Listings
                </button>
              )}
            </div>

            {/* Sort Select */}
            {activeTab !== 'categories' && (
              <div className="sort-select-wrap">
                <label>SORT BY:</label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                >
                  <option value="newest">Date Published</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {(currentSearch || (selectedCategory && selectedCategory !== 'All') || currentLocation) && (
          <div className="active-filters-chips">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filters:</span>
            {currentSearch && (
              <span className="filter-chip">
                Search: "{currentSearch}"
                <button className="chip-remove" onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), search: '' })}>
                  &times;
                </button>
              </span>
            )}
            {selectedCategory && selectedCategory !== 'All' && (
              <span className="filter-chip">
                Category: {selectedCategory}
                <button className="chip-remove" onClick={() => setSelectedCategory('All')}>
                  &times;
                </button>
              </span>
            )}
            {currentLocation && (
              <span className="filter-chip">
                Location: {currentLocation}
                <button className="chip-remove" onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), location: '' })}>
                  &times;
                </button>
              </span>
            )}
            <button className="clear-all-chips" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        )}

        {/* Categories Tab Explorer View */}
        {activeTab === 'categories' ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              Explore All Marketplace Categories
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Choose a category to browse available listings
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {categoryCounts.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setActiveTab('all');
                  }}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0f2f1';
                    e.currentTarget.style.borderColor = 'var(--accent-mint)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-subtle)';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-teal)' }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {cat.count} listings available
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Listings Grid */
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔄</div>
                <p>Loading recommendations...</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <div className="icon">⚠️</div>
                <h3>{error}</h3>
                <button className="submit-primary-btn" style={{ maxWidth: '200px', margin: '16px auto' }} onClick={fetchItems}>
                  Retry
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔍</div>
                <h3>No listings found</h3>
                <p>
                  {activeTab === 'favorites'
                    ? "You haven't saved any listings to your favorites yet. Click the heart icon on any card to save it!"
                    : activeTab === 'myAds'
                    ? "You haven't posted any ads yet. Click '+ SELL' at the top to list your first item!"
                    : "We couldn't find any ads matching your current criteria. Try different keywords or clear filters."}
                </p>
                <button
                  className="submit-primary-btn"
                  style={{ maxWidth: '220px', margin: '0 auto' }}
                  onClick={clearAllFilters}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};
