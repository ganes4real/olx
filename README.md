# OLX Marketplace Clone (MERN Stack without React)

A full-featured clone of **OLX (Online Marketplace Platform)** built using **Node.js, Express, MongoDB (Mongoose)** on the backend and clean, basic **Vanilla HTML5, CSS3, and JavaScript** on the frontend (no React, no heavy zoom or blur effects).

---

## 🌟 Key Features

1. **OLX Brand Identity & Layout**:
   - Signature OLX Teal (`#002f34`), Cyan (`#00a49f`), and Yellow (`#ffce32`) theme.
   - Iconic multi-color bordered **`+ SELL`** pill button.
   - Geometric OLX SVG logo and sticky top navigation bar.
   - Location selector (All India, Mumbai, Delhi, Bengaluru, Pune, Chennai, etc.).
   - Search bar with instant query execution.

2. **Marketplace Listings**:
   - Seeded with realistic listings (Cars, Mobile Phones, Motorcycles, Apartments, Electronics, Furniture, etc.).
   - Cards display Item image, Price in Indian Rupees (`₹`), Title, Location, and relative posted date.
   - Yellow **"FEATURED"** badges for highlighted ads.
   - Interactive heart icon (🤍 / ❤️) for saving favorites to your wishlist.

3. **Sub-Navigation & Filtering**:
   - Quick category pills (Cars, Motorcycles, Mobile Phones, Houses & Apartments, Scooters, etc.).
   - "ALL CATEGORIES" dropdown grid.
   - Sorting by: *Date Published* (newest), *Price: Low to High*, and *Price: High to Low*.
   - Filter tags indicator with one-click "Clear All" or remove tag.
   - View tabs: **All Ads**, **❤️ Favorites**, and **My Listings**.

4. **Interactive Modals**:
   - **Item Details Modal**: Large picture view, complete description, category, ad ID, formatted date, safety tips for buyers, and seller profile with "Show Phone Number" and "Chat with Seller".
   - **Post Your Ad (`+ SELL`) Modal**: Comprehensive form supporting category selection, title, description, price, location, seller details, and image upload from computer or image web URL.
   - **Authentication Modal**: Tabbed Login and Register interface with local session storage.

5. **Clean Code & No Special Effect Overload**:
   - Built with basic, readable code as requested.
   - No heavy transform zoom-ins, no backdrop blur filters, and no complex animations.

---

## 📁 Project Structure

```text
olx-clone/
├── models/
│   ├── Item.js          # Mongoose Schema for classified listings
│   └── User.js          # Mongoose Schema for users & saved favorites
├── routes/
│   ├── items.js         # REST endpoints for listings (GET, POST, DELETE, Search)
│   └── auth.js          # Auth endpoints (Register, Login, Favorites)
├── public/
│   ├── css/
│   │   └── style.css    # Clean Vanilla CSS matching OLX palette & layout
│   ├── js/
│   │   ├── api.js       # Fetch client wrapper
│   │   └── app.js       # Application state & DOM interaction
│   └── index.html       # Semantic HTML layout
├── uploads/             # Directory for uploaded ad images
├── server.js            # Express server & MongoDB connection
├── seed.js              # Database seeder with realistic listings
└── package.json         # Dependencies & scripts
```

---

## 🚀 How to Run

1. **Start MongoDB**: Ensure MongoDB service is running (e.g. `net start MongoDB`).
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Seed Database** (Populates sample OLX listings):
   ```bash
   npm run seed
   ```
4. **Start Server**:
   ```bash
   npm start
   ```
5. **Open in Browser**:
   Navigate to [http://localhost:5000](http://localhost:5000).
