import React from 'react';

const CATEGORIES = [
  'All',
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

export const CategoriesBar = ({ activeCategory, onSelectCategory }) => {
  return (
    <nav className="sub-nav">
      <div className="sub-nav-container">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-pill-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </nav>
  );
};
