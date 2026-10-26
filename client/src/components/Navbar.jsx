import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../services/api';

export const Navbar = ({ onSearchChange, onLocationChange, selectedLocation }) => {
  const { user, isAuthenticated, logout, openLoginModal, setSellModalOpen, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState([]);
  const [locationInput, setLocationInput] = useState(selectedLocation || 'All India');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const locationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Sync selected location prop
  useEffect(() => {
    if (selectedLocation) {
      setLocationInput(selectedLocation);
    }
  }, [selectedLocation]);

  // Load locations on mount
  useEffect(() => {
    const fetchLocs = async () => {
      try {
        const res = await API.getLocations();
        if (res.success && res.locations) {
          setLocations(res.locations);
        }
      } catch (err) {
        console.warn('Could not load locations:', err);
      }
    };
    fetchLocs();
  }, []);

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchTerm);
    }
    if (location.pathname !== '/') {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSelectLocation = (loc) => {
    setLocationInput(loc);
    setLocationDropdownOpen(false);
    if (onLocationChange) {
      onLocationChange(loc === 'All India' ? '' : loc);
    }
  };

  const handleClearLocation = (e) => {
    e.stopPropagation();
    setLocationInput('All India');
    if (onLocationChange) onLocationChange('');
  };

  const handleSellClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      setSellModalOpen(true);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="logo-wrap" title="OLX Marketplace">
          <svg className="olx-svg-logo" viewBox="0 0 100 60" width="60" height="36" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="30" rx="16" ry="22" fill="#002f34" />
            <ellipse cx="20" cy="30" rx="7" ry="12" fill="#fff" />
            <rect x="42" y="10" width="8" height="42" rx="4" fill="#002f34" />
            <path d="M 64 16 L 86 44 M 86 16 L 64 44" stroke="#002f34" strokeWidth="8" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Location Combobox */}
        <div className="nav-location-box" ref={locationRef}>
          <div
            className="location-input-wrap"
            onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
          >
            <span>📍</span>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setLocationDropdownOpen(true);
              }}
              placeholder="Search city, state..."
            />
            {locationInput && locationInput !== 'All India' && (
              <button
                type="button"
                className="loc-clear-btn"
                onClick={handleClearLocation}
                title="Clear location"
              >
                &times;
              </button>
            )}
            <span className="loc-chevron">▾</span>
          </div>

          {locationDropdownOpen && (
            <div className="dropdown-popover">
              <div className="dropdown-header-title">POPULAR LOCATIONS IN INDIA</div>
              <div
                className="dropdown-item"
                onClick={() => handleSelectLocation('All India')}
              >
                <span>🇮🇳</span> All India (Everywhere)
              </div>
              {locations
                .filter((l) =>
                  locationInput === 'All India'
                    ? true
                    : l.toLowerCase().includes(locationInput.toLowerCase())
                )
                .slice(0, 25)
                .map((loc, idx) => (
                  <div
                    key={idx}
                    className="dropdown-item"
                    onClick={() => handleSelectLocation(loc)}
                  >
                    <span>📍</span> {loc}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Search Input Box */}
        <form className="nav-search-box" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Find Cars, Mobile Phones, Flats, Jobs and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-submit-btn" title="Search Marketplace">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>

        {/* Nav Actions */}
        <div className="nav-actions">
          {/* Chats Link */}
          <Link
            to="/chats"
            className="nav-link-btn"
            title="Your Conversations"
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault();
                openLoginModal();
              }
            }}
          >
            <span>💬</span>
            <span>Chats</span>
            {unreadCount > 0 && <span className="badge-counter">{unreadCount}</span>}
          </Link>

          {/* User Auth state */}
          {!isAuthenticated ? (
            <button className="login-trigger-btn" onClick={openLoginModal}>
              Login
            </button>
          ) : (
            <div className="user-nav-dropdown" ref={userMenuRef}>
              <button
                className="user-pill-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="user-avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user?.name?.split(' ')[0] || 'User'}</span>
                <span>▾</span>
              </button>

              {userDropdownOpen && (
                <div className="user-menu-popover">
                  <div className="user-menu-header">
                    <div className="name">{user?.name}</div>
                    <div className="email">{user?.email}</div>
                  </div>
                  <Link
                    to={`/seller/${user?.id || user?._id}`}
                    className="user-menu-link"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <span>👤</span> My Profile & Ads
                  </Link>
                  <Link
                    to="/chats"
                    className="user-menu-link"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <span>💬</span> My Messages
                  </Link>
                  <button
                    className="user-menu-link logout"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SELL Button */}
          <button className="sell-badge-btn" onClick={handleSellClick}>
            <span>+</span>
            <span>SELL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
