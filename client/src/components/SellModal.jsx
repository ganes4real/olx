import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../services/api';

const CATEGORIES = [
  'Cars',
  'Motorcycles',
  'Mobile Phones',
  'Houses & Apartments',
  'Scooters',
  'Commercial Vehicles',
  'Electronics & Appliances',
  'Furniture',
  'Fashion',
  'Other'
];

export const SellModal = ({ onItemPosted }) => {
  const { user, token, sellModalOpen, setSellModalOpen } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locations, setLocations] = useState([]);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [sellerName, setSellerName] = useState(user?.name || '');
  const [sellerPhone, setSellerPhone] = useState(user?.phone || '');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const locationRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      if (!sellerName) setSellerName(user.name || '');
      if (!sellerPhone) setSellerPhone(user.phone || '');
    }
  }, [user]);

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

  // Handle outside click for location dropdown
  useEffect(() => {
    const handleOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (!sellModalOpen) return null;

  const handleClose = () => {
    setError('');
    setSellModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!locationInput) {
      setError('Please select a verified location from the list.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', price);
      formData.append('category', category);
      formData.append('location', locationInput.trim());
      formData.append('sellerName', sellerName.trim());
      formData.append('sellerPhone', sellerPhone.trim());
      formData.append('userId', user?.id || user?._id || '');

      if (imageFile) {
        formData.append('imageFile', imageFile);
      } else if (imageBase64) {
        formData.append('imageBase64', imageBase64);
      }

      const res = await API.createItem(formData, token);
      setSubmitting(false);

      if (res.success && res.item) {
        setSellModalOpen(false);
        if (onItemPosted) onItemPosted(res.item);
        navigate(`/products/${res.item._id}`);
      } else {
        setError(res.message || 'Failed to post listing.');
      }
    } catch (err) {
      setSubmitting(false);
      setError('An error occurred while posting your ad.');
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>
          &times;
        </button>

        <div className="modal-header-section">
          <h3>POST YOUR AD</h3>
          <p>Reach millions of buyers across India</p>
        </div>

        <div className="modal-body">
          {error && <div className="form-error-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Ad Title *</label>
              <input
                type="text"
                placeholder="Brand, model, key specs (e.g. iPhone 15 Pro 128GB Blue)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="form-field">
              <label>Description *</label>
              <textarea
                rows={3}
                placeholder="Include condition, reason for selling, accessories included, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="1"
                required
              />
            </div>

            {/* Verified Location Selector */}
            <div className="form-field" ref={locationRef} style={{ position: 'relative' }}>
              <label>Location (Verified City/State) *</label>
              <input
                type="text"
                placeholder="Type to search city, state..."
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setLocationDropdownOpen(true);
                }}
                onFocus={() => setLocationDropdownOpen(true)}
                required
              />
              {locationDropdownOpen && (
                <div className="dropdown-popover">
                  <div className="dropdown-header-title">CHOOSE FROM VERIFIED CITIES</div>
                  {locations
                    .filter((l) =>
                      l.toLowerCase().includes(locationInput.toLowerCase())
                    )
                    .slice(0, 20)
                    .map((loc, idx) => (
                      <div
                        key={idx}
                        className="dropdown-item"
                        onClick={() => {
                          setLocationInput(loc);
                          setLocationDropdownOpen(false);
                        }}
                      >
                        <span>📍</span> {loc}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Image Upload Dropzone */}
            <div className="form-field">
              <label>Listing Photo</label>
              {!imagePreview ? (
                <div
                  className="image-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <div className="dropzone-inner">
                    <span className="icon">📷</span>
                    <p style={{ fontWeight: 600 }}>Click or drop photo here</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      Supports PNG, JPG, WebP
                    </span>
                  </div>
                </div>
              ) : (
                <div className="image-preview-box">
                  <img src={imagePreview} alt="Ad Preview" />
                  <button
                    type="button"
                    className="remove-preview-btn"
                    onClick={handleRemoveImage}
                    title="Remove Image"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>

            <div className="form-field-row">
              <div className="form-field">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="Seller name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Contact Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-primary-btn"
              disabled={submitting}
              style={{ marginTop: '12px' }}
            >
              {submitting ? 'Posting Ad...' : 'Post Ad Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
