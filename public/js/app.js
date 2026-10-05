// ===================================================
// OLX Clone - Core Frontend Application (Vanilla JS)
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    items: [],
    filteredItems: [],
    activeCategory: 'All',
    activeLocation: 'All India',
    searchQuery: '',
    sortBy: 'newest',
    activeTab: 'all', // 'all', 'categories', 'favorites', 'myAds'
    limit: 20,
    currentUser: JSON.parse(localStorage.getItem('olx_user') || 'null'),
    favoriteIds: new Set(),
    locations: [],
    activeDetailItem: null,
    activeSellerProfileUser: null,
    activeSellerStatusFilter: 'all',
    activeChatId: null,
    chatPollingTimer: null
  };

  // DOM Elements - Main Layout
  const itemsGridContainer = document.getElementById('itemsGridContainer');
  const itemsGrid = document.getElementById('itemsGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  const sectionTitle = document.getElementById('sectionTitle');
  const loadMoreContainer = document.getElementById('loadMoreContainer');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const favCount = document.getElementById('favCount');
  const toast = document.getElementById('toast');
  const heroBanner = document.getElementById('heroBanner');

  // Search & Filter Elements
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const sortBox = document.getElementById('sortBox');
  const sortSelect = document.getElementById('sortSelect');
  const quickLinks = document.getElementById('quickLinks');
  const allCategoriesBtn = document.getElementById('allCategoriesBtn');
  const categoriesDropdown = document.getElementById('categoriesDropdown');

  // Navbar Location Combobox
  const navLocationWrapper = document.getElementById('navLocationWrapper');
  const locationInput = document.getElementById('locationInput');
  const locationDropdown = document.getElementById('locationDropdown');
  const locationSuggestionsList = document.getElementById('locationSuggestionsList');
  const clearLocationFilterBtn = document.getElementById('clearLocationFilterBtn');

  // Filter Pills Elements
  const filterPillsContainer = document.getElementById('filterPillsContainer');
  const activeSearchTag = document.getElementById('activeSearchTag');
  const activeSearchVal = document.getElementById('activeSearchVal');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const activeCategoryTag = document.getElementById('activeCategoryTag');
  const activeCategoryVal = document.getElementById('activeCategoryVal');
  const clearCategoryBtn = document.getElementById('clearCategoryBtn');
  const activeLocationTag = document.getElementById('activeLocationTag');
  const activeLocationVal = document.getElementById('activeLocationVal');
  const clearLocationBtn = document.getElementById('clearLocationBtn');
  const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');

  // View Tabs
  const tabAll = document.getElementById('tabAll');
  const tabCategories = document.getElementById('tabCategories');
  const tabFavorites = document.getElementById('tabFavorites');
  const tabMyAds = document.getElementById('tabMyAds');

  // Categories Explorer View
  const categoriesTabContainer = document.getElementById('categoriesTabContainer');
  const categoryCardsGrid = document.getElementById('categoryCardsGrid');




  // Detail Modal Elements
  const detailsModal = document.getElementById('detailsModal');
  const closeDetailsModal = document.getElementById('closeDetailsModal');
  const detailImage = document.getElementById('detailImage');
  const detailStatusBadge = document.getElementById('detailStatusBadge');
  const detailPrice = document.getElementById('detailPrice');
  const detailTitle = document.getElementById('detailTitle');
  const detailDescription = document.getElementById('detailDescription');
  const detailCategory = document.getElementById('detailCategory');
  const detailLocation = document.getElementById('detailLocation');
  const detailDate = document.getElementById('detailDate');
  const detailId = document.getElementById('detailId');
  const detailSubLocation = document.getElementById('detailSubLocation');
  const detailSubDate = document.getElementById('detailSubDate');
  const detailSellerProfileClick = document.getElementById('detailSellerProfileClick');
  const detailSellerAvatar = document.getElementById('detailSellerAvatar');
  const detailSellerName = document.getElementById('detailSellerName');
  const detailSellerMember = document.getElementById('detailSellerMember');
  const showPhoneBtn = document.getElementById('showPhoneBtn');
  const phoneText = document.getElementById('phoneText');
  const chatSellerBtn = document.getElementById('chatSellerBtn');
  const detailFavBtn = document.getElementById('detailFavBtn');
  const detailFavIcon = document.getElementById('detailFavIcon');
  const openReportModalBtn = document.getElementById('openReportModalBtn');
  const ownerActions = document.getElementById('ownerActions');
  const itemStatusSelect = document.getElementById('itemStatusSelect');
  const deleteAdBtn = document.getElementById('deleteAdBtn');

  // Seller Profile Modal
  const sellerModal = document.getElementById('sellerModal');
  const closeSellerModal = document.getElementById('closeSellerModal');
  const sellerProfileAvatar = document.getElementById('sellerProfileAvatar');
  const sellerProfileName = document.getElementById('sellerProfileName');
  const sellerProfileMember = document.getElementById('sellerProfileMember');
  const sellerProfilePhone = document.getElementById('sellerProfilePhone');
  const sellerTotalAds = document.getElementById('sellerTotalAds');
  const sellerActiveAds = document.getElementById('sellerActiveAds');
  const sellerSoldAds = document.getElementById('sellerSoldAds');
  const sellerProductsGrid = document.getElementById('sellerProductsGrid');
  const sellerEmptyProducts = document.getElementById('sellerEmptyProducts');
  const sellerTabAll = document.getElementById('sellerTabAll');
  const sellerTabListed = document.getElementById('sellerTabListed');
  const sellerTabSold = document.getElementById('sellerTabSold');

  // Report Modal
  const reportModal = document.getElementById('reportModal');
  const closeReportModal = document.getElementById('closeReportModal');
  const reportItemTitle = document.getElementById('reportItemTitle');
  const reportForm = document.getElementById('reportForm');
  const reportReason = document.getElementById('reportReason');
  const reportDescription = document.getElementById('reportDescription');
  const reporterEmail = document.getElementById('reporterEmail');
  const cancelReportBtn = document.getElementById('cancelReportBtn');

  // Chat & Conversation Elements
  const chatModal = document.getElementById('chatModal');
  const closeChatModal = document.getElementById('closeChatModal');
  const chatParticipantName = document.getElementById('chatParticipantName');
  const chatItemImg = document.getElementById('chatItemImg');
  const chatItemTitle = document.getElementById('chatItemTitle');
  const chatItemPrice = document.getElementById('chatItemPrice');
  const chatMessagesArea = document.getElementById('chatMessagesArea');
  const chatInputForm = document.getElementById('chatInputForm');
  const chatInputText = document.getElementById('chatInputText');
  const navChatBtn = document.getElementById('navChatBtn');
  const chatBadge = document.getElementById('chatBadge');
  const inboxModal = document.getElementById('inboxModal');
  const closeInboxModal = document.getElementById('closeInboxModal');
  const inboxList = document.getElementById('inboxList');

  // Sell Item Modal & Image Dropzone
  const sellModal = document.getElementById('sellModal');
  const sellBtn = document.getElementById('sellBtn');
  const heroSellBtn = document.getElementById('heroSellBtn');
  const closeSellModal = document.getElementById('closeSellModal');
  const sellForm = document.getElementById('sellForm');
  const sellError = document.getElementById('sellError');
  const sellLocationWrapper = document.getElementById('sellLocationWrapper');
  const sellLocationInput = document.getElementById('sellLocationInput');
  const sellLocationValue = document.getElementById('sellLocationValue');
  const sellLocationDropdown = document.getElementById('sellLocationDropdown');
  const sellLocationSuggestions = document.getElementById('sellLocationSuggestions');
  const sellImageFileInput = document.getElementById('sellImageFileInput');
  const sellImageBase64 = document.getElementById('sellImageBase64');
  const imageDropzone = document.getElementById('imageDropzone');
  const dropzoneContent = document.getElementById('dropzoneContent');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const removeImageBtn = document.getElementById('removeImageBtn');

  // Auth Modals & Navbar
  const authModal = document.getElementById('authModal');
  const authContainer = document.getElementById('authContainer');
  const loginBtn = document.getElementById('loginBtn');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const authTabLogin = document.getElementById('authTabLogin');
  const authTabRegister = document.getElementById('authTabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');
  const demoAdminBtn = document.getElementById('demoAdminBtn');
  const demoSellerBtn = document.getElementById('demoSellerBtn');
  const demoBuyerBtn = document.getElementById('demoBuyerBtn');

  // ===================================================
  // Utility Helpers
  // ===================================================

  function formatCurrency(amount) {
    return '₹ ' + Number(amount).toLocaleString('en-IN');
  }

  function formatDate(dateString) {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours < 1) return 'Just now';
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  }

  function showToast(message, duration = 3200) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  // ===================================================
  // Auth & Session Management
  // ===================================================

  function updateAuthUI() {
    if (state.currentUser) {
      authContainer.innerHTML = `
        <div class="user-badge-wrapper">
          <span class="user-name-tag">👋 ${state.currentUser.name}</span>
          ${state.currentUser.role === 'admin' ? '<span class="admin-chip">ADMIN</span>' : ''}
          <button id="logoutBtn" class="logout-link">Logout</button>
        </div>
      `;
      document.getElementById('logoutBtn').addEventListener('click', handleLogout);
      syncUserFavorites();
      updateChatBadge();
    } else {
      authContainer.innerHTML = `<button id="loginBtn" class="login-btn">Login</button>`;
      document.getElementById('loginBtn').addEventListener('click', () => openModal(authModal));
      state.favoriteIds.clear();
      updateFavCount();
      chatBadge.classList.add('hidden');
    }
  }

  async function syncUserFavorites() {
    if (!state.currentUser) return;
    try {
      const res = await API.getFavoriteIds(state.currentUser.id);
      if (res.success && Array.isArray(res.favoriteIds)) {
        state.favoriteIds = new Set(res.favoriteIds);
        updateFavCount();
        renderItems();
      }
    } catch (e) {
      console.warn('Failed syncing favorites:', e);
    }
  }

  async function updateChatBadge() {
    if (!state.currentUser) return;
    try {
      const res = await API.getUserChats(state.currentUser.id);
      if (res.success && res.chats && res.chats.length > 0) {
        chatBadge.textContent = res.chats.length;
        chatBadge.classList.remove('hidden');
      } else {
        chatBadge.classList.add('hidden');
      }
    } catch (e) {
      // Ignore
    }
  }

  function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem('olx_user');
    updateAuthUI();
    showToast('Logged out successfully');
    if (state.activeTab === 'myAds') {
      switchTab('all');
    } else {
      loadItems();
    }
  }

  // Quick Demo Buttons
  if (demoAdminBtn) {
    demoAdminBtn.addEventListener('click', async () => {
      document.getElementById('loginEmail').value = 'test101';
      document.getElementById('loginPassword').value = 'pass101';
      await executeLogin('test101', 'pass101');
    });
  }

  demoSellerBtn.addEventListener('click', async () => {
    document.getElementById('loginEmail').value = 'rohit@example.com';
    document.getElementById('loginPassword').value = 'rohit123';
    await executeLogin('rohit@example.com', 'rohit123');
  });

  demoBuyerBtn.addEventListener('click', async () => {
    document.getElementById('loginEmail').value = 'buyer@example.com';
    document.getElementById('loginPassword').value = 'buyer123';
    await executeLogin('buyer@example.com', 'buyer123');
  });

  async function executeLogin(identifier, password) {
    try {
      loginError.classList.add('hidden');
      const res = await API.login(identifier, password);
      if (res.success) {
        state.currentUser = res.user;
        localStorage.setItem('olx_user', JSON.stringify(res.user));
        updateAuthUI();
        closeModal(authModal);
        if (res.user.role === 'admin') {
          showToast(`Welcome, Admin ${res.user.name}! 🛡️`);
        } else {
          showToast(`Welcome back, ${res.user.name}!`);
        }
        loadItems();
      } else {
        loginError.textContent = res.message || 'Invalid credentials. Please try again.';
        loginError.classList.remove('hidden');
      }
    } catch (err) {
      loginError.textContent = 'Server connection error during login';
      loginError.classList.remove('hidden');
    }
  }

  // ===================================================
  // Curated Locations Combobox & Search
  // ===================================================

  async function loadLocationsList() {
    try {
      const res = await API.getLocations();
      if (res.success && Array.isArray(res.locations)) {
        state.locations = res.locations;
      }
    } catch (err) {
      console.warn('Error loading locations:', err);
    }
  }

  function renderLocationSuggestions(filterText = '') {
    const q = filterText.toLowerCase().trim();
    let matches = state.locations;
    if (q && q !== 'all india') {
      matches = state.locations.filter(loc => loc.toLowerCase().includes(q));
    }

    let html = `
      <div class="suggestion-item" data-value="All India">
        <span class="item-pin">🌐</span>
        <span><strong>All India</strong> (Everywhere)</span>
      </div>
    `;

    if (matches.length === 0) {
      html += `<div style="padding:12px; font-size:13px; color:#577376;">No verified cities matching "${filterText}". Please select from standard locations.</div>`;
    } else {
      matches.slice(0, 20).forEach(loc => {
        html += `
          <div class="suggestion-item" data-value="${loc}">
            <span class="item-pin">📍</span>
            <span>${loc}</span>
          </div>
        `;
      });
    }

    locationSuggestionsList.innerHTML = html;

    locationSuggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const selected = item.getAttribute('data-value');
        locationInput.value = selected;
        state.activeLocation = selected;
        locationDropdown.classList.add('hidden');
        if (selected !== 'All India') {
          clearLocationFilterBtn.classList.remove('hidden');
        } else {
          clearLocationFilterBtn.classList.add('hidden');
        }
        updateFilterPills();
        loadItems();
      });
    });
  }

  // Toggle Navbar Location Dropdown
  locationInput.addEventListener('focus', () => {
    renderLocationSuggestions(locationInput.value);
    locationDropdown.classList.remove('hidden');
  });

  locationInput.addEventListener('input', (e) => {
    renderLocationSuggestions(e.target.value);
    locationDropdown.classList.remove('hidden');
    if (e.target.value.trim() !== '') {
      clearLocationFilterBtn.classList.remove('hidden');
    } else {
      clearLocationFilterBtn.classList.add('hidden');
    }
  });

  clearLocationFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    locationInput.value = 'All India';
    state.activeLocation = 'All India';
    clearLocationFilterBtn.classList.add('hidden');
    updateFilterPills();
    loadItems();
  });

  // Sell Form Searchable Location Combobox
  function renderSellLocationSuggestions(filterText = '') {
    const q = filterText.toLowerCase().trim();
    let matches = state.locations;
    if (q) {
      matches = state.locations.filter(loc => loc.toLowerCase().includes(q));
    }

    let html = '';
    if (matches.length === 0) {
      html = `<div style="padding:10px; font-size:13px; color:#c62828;">No matching location. Must pick from verified Indian cities.</div>`;
    } else {
      matches.slice(0, 15).forEach(loc => {
        html += `
          <div class="suggestion-item" data-value="${loc}">
            <span class="item-pin">📍</span>
            <span>${loc}</span>
          </div>
        `;
      });
    }

    sellLocationSuggestions.innerHTML = html;

    sellLocationSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const val = item.getAttribute('data-value');
        sellLocationInput.value = val;
        sellLocationValue.value = val;
        sellLocationDropdown.classList.add('hidden');
      });
    });
  }

  sellLocationInput.addEventListener('focus', () => {
    renderSellLocationSuggestions(sellLocationInput.value);
    sellLocationDropdown.classList.remove('hidden');
  });

  sellLocationInput.addEventListener('input', (e) => {
    sellLocationValue.value = ''; // Require exact selection
    renderSellLocationSuggestions(e.target.value);
    sellLocationDropdown.classList.remove('hidden');
  });

  // Global click outside to close dropdowns
  document.addEventListener('click', (e) => {
    if (!navLocationWrapper.contains(e.target)) {
      locationDropdown.classList.add('hidden');
    }
    if (!sellLocationWrapper.contains(e.target)) {
      sellLocationDropdown.classList.add('hidden');
    }
  });

  // ===================================================
  // Base64 Image Upload Handling in Sell Form
  // ===================================================

  function handleFileSelect(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size exceeds 8MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      sellImageBase64.value = base64Data;
      imagePreview.src = base64Data;
      dropzoneContent.classList.add('hidden');
      imagePreviewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  sellImageFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  });

  imageDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageDropzone.style.borderColor = 'var(--olx-cyan)';
    imageDropzone.style.background = '#eef7f7';
  });

  imageDropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    imageDropzone.style.borderColor = '#b5c3c5';
    imageDropzone.style.background = '#f7f9fa';
  });

  imageDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    imageDropzone.style.borderColor = '#b5c3c5';
    imageDropzone.style.background = '#f7f9fa';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sellImageBase64.value = '';
    sellImageFileInput.value = '';
    imagePreview.src = '';
    imagePreviewContainer.classList.add('hidden');
    dropzoneContent.classList.remove('hidden');
  });

  // ===================================================
  // Data Fetching & Rendering
  // ===================================================

  async function loadItems() {
    try {
      itemsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #577376;">Loading verified listings...</div>';
      
      let params = {
        search: state.searchQuery,
        category: state.activeCategory,
        location: state.activeLocation === 'All India' ? '' : state.activeLocation,
        sort: state.sortBy
      };

      if (state.activeTab === 'myAds' && state.currentUser) {
        params.userId = state.currentUser.id;
      }

      const res = await API.getItems(params);
      
      if (res.success) {
        state.items = res.items;

        // If Favorites tab is active, filter to user favorites
        if (state.activeTab === 'favorites') {
          state.filteredItems = state.items.filter(item => state.favoriteIds.has(item._id));
        } else {
          state.filteredItems = state.items;
        }

        renderItems();
      } else {
        itemsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">Failed to load listings</div>';
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      itemsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">Error connecting to marketplace server</div>';
    }
  }

  function renderItems() {
    if (state.filteredItems.length === 0) {
      itemsGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      loadMoreContainer.classList.add('hidden');
      resultsCount.textContent = '0 listings found';
      return;
    }

    emptyState.classList.add('hidden');
    loadMoreContainer.classList.remove('hidden');
    resultsCount.textContent = `Showing ${state.filteredItems.length} listings`;

    itemsGrid.innerHTML = state.filteredItems.map(item => {
      const isFav = state.favoriteIds.has(item._id);
      const isSold = item.status === 'sold';
      const isReserved = item.status === 'reserved';

      let statusBadge = '';
      if (isSold) {
        statusBadge = '<span class="status-badge sold">SOLD</span>';
      } else if (isReserved) {
        statusBadge = '<span class="status-badge reserved">RESERVED</span>';
      } else if (item.featured) {
        statusBadge = '<span class="status-badge featured">FEATURED</span>';
      }

      return `
        <div class="item-card" data-id="${item._id}">
          <div class="item-image-wrapper">
            <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy">
            ${statusBadge}
            <button class="fav-btn-card" data-id="${item._id}" title="${isFav ? 'Remove favorite' : 'Add favorite'}">
              <span>${isFav ? '❤️' : '🤍'}</span>
            </button>
          </div>
          <div class="item-info">
            <div class="item-price">${formatCurrency(item.price)}</div>
            <div class="item-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
            <div class="item-meta">
              <span class="item-loc">📍 ${escapeHtml(item.location)}</span>
              <span class="item-date">${formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events on item cards
    itemsGrid.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.fav-btn-card')) return;
        const id = card.getAttribute('data-id');
        openItemDetails(id);
      });
    });

    // Attach click events for favorite buttons
    itemsGrid.querySelectorAll('.fav-btn-card').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await toggleFavorite(id);
      });
    });
  }

  async function toggleFavorite(itemId) {
    if (!state.currentUser) {
      showToast('Please login to save favorite ads');
      openModal(authModal);
      return;
    }

    try {
      const res = await API.toggleFavorite(itemId, state.currentUser.id);
      if (res.success) {
        if (res.isFavorite) {
          state.favoriteIds.add(itemId);
          showToast('Added to Favorites ❤️');
        } else {
          state.favoriteIds.delete(itemId);
          showToast('Removed from Favorites');
        }
        updateFavCount();
        
        if (state.activeTab === 'favorites') {
          state.filteredItems = state.items.filter(item => state.favoriteIds.has(item._id));
        }
        renderItems();
        
        if (state.activeDetailItem && state.activeDetailItem._id === itemId) {
          detailFavIcon.textContent = res.isFavorite ? '❤️' : '🤍';
        }
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  }

  function updateFavCount() {
    favCount.textContent = state.favoriteIds.size;
  }

  // ===================================================
  // Item Details Modal & Seller Profile Interaction
  // ===================================================

  async function openItemDetails(id) {
    try {
      const res = await API.getItemById(id);
      if (!res.success || !res.item) {
        showToast('Item not found');
        return;
      }

      const item = res.item;
      state.activeDetailItem = item;

      detailImage.src = item.image;
      detailPrice.textContent = formatCurrency(item.price);
      detailTitle.textContent = item.title;
      detailDescription.textContent = item.description;
      detailCategory.textContent = item.category;
      detailLocation.textContent = item.location;
      detailDate.textContent = formatDate(item.createdAt);
      detailId.textContent = item._id;
      detailSubLocation.textContent = item.location;
      detailSubDate.textContent = formatDate(item.createdAt);

      // Status pill
      detailStatusBadge.className = `detail-status-pill ${item.status || 'listed'}`;
      detailStatusBadge.textContent = (item.status || 'listed').toUpperCase();

      // Seller information
      const seller = item.userId;
      const sellerId = seller ? seller._id || seller : null;
      detailSellerName.textContent = item.sellerName || (seller && seller.name) || 'OLX Member';
      detailSellerMember.textContent = item.sellerMemberSince || 'Jan 2024';
      phoneText.textContent = 'Show Phone Number';

      // Store seller ID for profile navigation
      detailSellerProfileClick.setAttribute('data-seller-id', sellerId || '');

      // Favorite button
      const isFav = state.favoriteIds.has(item._id);
      detailFavIcon.textContent = isFav ? '❤️' : '🤍';

      // Owner or Admin controls
      const isOwner = state.currentUser && sellerId && state.currentUser.id.toString() === sellerId.toString();
      const isAdmin = state.currentUser && state.currentUser.role === 'admin';

      if (isOwner || isAdmin) {
        ownerActions.classList.remove('hidden');
        itemStatusSelect.value = item.status || 'listed';
      } else {
        ownerActions.classList.add('hidden');
      }

      openModal(detailsModal);
    } catch (err) {
      console.error('Error opening item details:', err);
      showToast('Error opening item details');
    }
  }

  // Click Seller Card -> Open Seller Profile with all items released
  detailSellerProfileClick.addEventListener('click', async () => {
    const sellerId = detailSellerProfileClick.getAttribute('data-seller-id');
    if (!sellerId) {
      showToast('Seller profile unavailable for this ad');
      return;
    }
    openSellerProfileModal(sellerId);
  });

  async function openSellerProfileModal(userId, filterStatus = 'all') {
    try {
      state.activeSellerProfileUser = userId;
      state.activeSellerStatusFilter = filterStatus;

      // Fetch user profile and products
      const [profileRes, itemsRes] = await Promise.all([
        API.getUserProfile(userId),
        API.getUserItems(userId, filterStatus)
      ]);

      if (!profileRes.success || !profileRes.user) {
        showToast('Seller information could not be retrieved');
        return;
      }

      const u = profileRes.user;
      sellerProfileName.textContent = u.name;
      sellerProfileMember.textContent = `Member since ${formatDate(u.createdAt)}`;
      sellerProfilePhone.textContent = `📞 ${u.phone || '+91 98765 00000'}`;

      sellerTotalAds.textContent = u.stats.total;
      sellerActiveAds.textContent = u.stats.active;
      sellerSoldAds.textContent = u.stats.sold;

      const items = itemsRes.items || [];
      if (items.length === 0) {
        sellerProductsGrid.innerHTML = '';
        sellerEmptyProducts.classList.remove('hidden');
      } else {
        sellerEmptyProducts.classList.add('hidden');
        sellerProductsGrid.innerHTML = items.map(item => `
          <div class="item-card seller-sub-card" data-id="${item._id}">
            <div class="item-image-wrapper">
              <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy">
              ${item.status === 'sold' ? '<span class="status-badge sold">SOLD</span>' : ''}
              ${item.status === 'reserved' ? '<span class="status-badge reserved">RESERVED</span>' : ''}
            </div>
            <div class="item-info">
              <div class="item-price">${formatCurrency(item.price)}</div>
              <div class="item-title">${escapeHtml(item.title)}</div>
              <div class="item-meta">
                <span>📍 ${escapeHtml(item.location)}</span>
                <span>${formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        `).join('');

        sellerProductsGrid.querySelectorAll('.seller-sub-card').forEach(card => {
          card.addEventListener('click', () => {
            const itemId = card.getAttribute('data-id');
            closeModal(sellerModal);
            openItemDetails(itemId);
          });
        });
      }

      openModal(sellerModal);
    } catch (err) {
      console.error('Error opening seller profile:', err);
      showToast('Error opening seller profile');
    }
  }

  // Seller modal tabs
  sellerTabAll.addEventListener('click', () => {
    sellerTabAll.classList.add('active');
    sellerTabListed.classList.remove('active');
    sellerTabSold.classList.remove('active');
    openSellerProfileModal(state.activeSellerProfileUser, 'all');
  });

  sellerTabListed.addEventListener('click', () => {
    sellerTabListed.classList.add('active');
    sellerTabAll.classList.remove('active');
    sellerTabSold.classList.remove('active');
    openSellerProfileModal(state.activeSellerProfileUser, 'listed');
  });

  sellerTabSold.addEventListener('click', () => {
    sellerTabSold.classList.add('active');
    sellerTabAll.classList.remove('active');
    sellerTabListed.classList.remove('active');
    openSellerProfileModal(state.activeSellerProfileUser, 'sold');
  });

  // Show Phone Number
  showPhoneBtn.addEventListener('click', () => {
    if (!state.currentUser) {
      showToast('Please login to view seller phone number');
      openModal(authModal);
      return;
    }
    if (state.activeDetailItem) {
      phoneText.textContent = state.activeDetailItem.sellerPhone || '+91 98201 12345';
    }
  });

  // Owner/Admin status change
  itemStatusSelect.addEventListener('change', async (e) => {
    if (!state.activeDetailItem) return;
    const newStatus = e.target.value;
    try {
      const res = await API.updateItemStatus(state.activeDetailItem._id, newStatus);
      if (res.success) {
        state.activeDetailItem.status = newStatus;
        detailStatusBadge.className = `detail-status-pill ${newStatus}`;
        detailStatusBadge.textContent = newStatus.toUpperCase();
        showToast(`Listing marked as ${newStatus}`);
        loadItems();
      }
    } catch (err) {
      showToast('Failed updating listing status');
    }
  });

  // Delete Ad (from item modal)
  deleteAdBtn.addEventListener('click', async () => {
    if (!state.activeDetailItem) return;
    if (!confirm(`Are you sure you want to permanently delete "${state.activeDetailItem.title}"?`)) return;

    try {
      const res = await API.deleteItem(state.activeDetailItem._id);
      if (res.success) {
        showToast('Listing deleted successfully');
        closeModal(detailsModal);
        loadItems();
      } else {
        showToast(res.message || 'Error deleting listing');
      }
    } catch (err) {
      showToast('Failed to delete listing');
    }
  });

  // Favorite toggle from details modal
  detailFavBtn.addEventListener('click', async () => {
    if (state.activeDetailItem) {
      await toggleFavorite(state.activeDetailItem._id);
    }
  });

  // ===================================================
  // Scam & Fraud Reporting Functionality
  // ===================================================

  openReportModalBtn.addEventListener('click', () => {
    if (!state.activeDetailItem) return;
    reportItemTitle.textContent = state.activeDetailItem.title;
    reportReason.value = '';
    reportDescription.value = '';
    reporterEmail.value = state.currentUser ? state.currentUser.email : '';
    openModal(reportModal);
  });

  cancelReportBtn.addEventListener('click', () => {
    closeModal(reportModal);
  });

  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.activeDetailItem) return;

    const reason = reportReason.value;
    const description = reportDescription.value;
    const email = reporterEmail.value;

    if (!reason) {
      showToast('Please select a reason for reporting');
      return;
    }

    try {
      const res = await API.createReport({
        itemId: state.activeDetailItem._id,
        reason,
        description,
        reporterId: state.currentUser ? state.currentUser.id : null,
        reporterName: state.currentUser ? state.currentUser.name : 'Visitor',
        reporterEmail: email
      });

      if (res.success) {
        closeModal(reportModal);
        showToast('Report submitted for safety review. Thank you! 🛡️');
      } else {
        showToast(res.message || 'Error submitting report');
      }
    } catch (err) {
      console.error('Report error:', err);
      showToast('Server error while submitting report');
    }
  });

  // ===================================================
  // Chat & Conversation Functionality
  // ===================================================

  chatSellerBtn.addEventListener('click', async () => {
    if (!state.currentUser) {
      showToast('Please login to chat with the seller');
      openModal(authModal);
      return;
    }

    if (!state.activeDetailItem) return;

    const seller = state.activeDetailItem.userId;
    const sellerId = seller ? (seller._id || seller).toString() : null;

    if (sellerId === state.currentUser.id.toString()) {
      showToast('You cannot start a conversation with yourself on your own ad!');
      return;
    }

    try {
      const res = await API.startChat(state.activeDetailItem._id, state.currentUser.id);
      if (res.success && res.chat) {
        openChatModal(res.chat._id);
      } else {
        showToast(res.message || 'Unable to open chat');
      }
    } catch (err) {
      console.error('Chat start error:', err);
      showToast('Error connecting to chat system');
    }
  });

  async function openChatModal(chatId) {
    state.activeChatId = chatId;
    openModal(chatModal);
    await loadChatMessages();

    // Start live polling every 3.5 seconds
    if (state.chatPollingTimer) clearInterval(state.chatPollingTimer);
    state.chatPollingTimer = setInterval(loadChatMessages, 3500);
  }

  async function loadChatMessages() {
    if (!state.activeChatId) return;

    try {
      const res = await API.getChatMessages(state.activeChatId, state.currentUser ? state.currentUser.id : '');
      if (res.success) {
        const chat = res.chat;
        const messages = res.messages || [];

        // Set header details
        const otherParticipant = chat.participants.find(p => p._id.toString() !== (state.currentUser ? state.currentUser.id.toString() : ''));
        chatParticipantName.textContent = otherParticipant ? otherParticipant.name : 'Seller';

        if (chat.itemId) {
          chatItemImg.src = chat.itemId.image;
          chatItemTitle.textContent = chat.itemId.title;
          chatItemPrice.textContent = formatCurrency(chat.itemId.price);
        }

        if (messages.length === 0) {
          chatMessagesArea.innerHTML = '<div style="text-align: center; color: #577376; padding: 40px;">No messages yet. Send a hello to inquire about this listing!</div>';
        } else {
          chatMessagesArea.innerHTML = messages.map(msg => {
            const isOutgoing = state.currentUser && msg.senderId.toString() === state.currentUser.id.toString();
            return `
              <div class="chat-bubble ${isOutgoing ? 'outgoing' : 'incoming'}">
                ${!isOutgoing ? `<div class="bubble-sender">${escapeHtml(msg.senderName)}</div>` : ''}
                <div class="bubble-text">${escapeHtml(msg.text)}</div>
                <div class="bubble-time">${formatDate(msg.createdAt)}</div>
              </div>
            `;
          }).join('');

          // Auto-scroll to bottom
          chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
        }
      }
    } catch (err) {
      console.warn('Error loading messages:', err);
    }
  }

  chatInputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInputText.value.trim();
    if (!text || !state.activeChatId || !state.currentUser) return;

    try {
      chatInputText.value = '';
      const res = await API.sendMessage(state.activeChatId, state.currentUser.id, state.currentUser.name, text);
      if (res.success) {
        await loadChatMessages();
      }
    } catch (err) {
      showToast('Failed to send message');
    }
  });

  // Open Inbox / Conversations List
  navChatBtn.addEventListener('click', async () => {
    if (!state.currentUser) {
      showToast('Please login to view conversations');
      openModal(authModal);
      return;
    }
    openInboxModal();
  });

  async function openInboxModal() {
    try {
      inboxList.innerHTML = '<div style="text-align:center; padding:30px; color:#577376;">Loading conversations...</div>';
      openModal(inboxModal);

      const res = await API.getUserChats(state.currentUser.id);
      if (res.success && res.chats && res.chats.length > 0) {
        inboxList.innerHTML = res.chats.map(chat => {
          const other = chat.participants.find(p => p._id.toString() !== state.currentUser.id.toString()) || { name: 'User' };
          const item = chat.itemId || { title: 'Marketplace Ad' };

          return `
            <div class="inbox-item" data-chat-id="${chat._id}">
              <div class="inbox-avatar">👤</div>
              <div class="inbox-info">
                <div class="inbox-top-row">
                  <span class="inbox-user">${escapeHtml(other.name)}</span>
                  <span class="inbox-time">${formatDate(chat.lastMessageAt || chat.updatedAt)}</span>
                </div>
                <div class="inbox-item-name">📦 ${escapeHtml(item.title)}</div>
                <div class="inbox-msg-preview">${escapeHtml(chat.lastMessage || 'Open conversation')}</div>
              </div>
            </div>
          `;
        }).join('');

        inboxList.querySelectorAll('.inbox-item').forEach(row => {
          row.addEventListener('click', () => {
            const chatId = row.getAttribute('data-chat-id');
            closeModal(inboxModal);
            openChatModal(chatId);
          });
        });
      } else {
        inboxList.innerHTML = '<div style="text-align:center; padding:40px; color:#577376;">No active conversations yet. Click "Chat with seller" on any ad!</div>';
      }
    } catch (err) {
      inboxList.innerHTML = '<div style="text-align:center; padding:30px; color:red;">Error fetching conversations</div>';
    }
  }

  // ===================================================
  // Categories Tab Explorer View
  // ===================================================

  const CATEGORY_ICONS = {
    'Cars': '🚗',
    'Motorcycles': '🏍️',
    'Mobile Phones': '📱',
    'Houses & Apartments': '🏠',
    'Scooters': '🛵',
    'Commercial Vehicles': '🚚',
    'Electronics & Appliances': '💻',
    'Furniture': '🛋️',
    'Fashion': '👗',
    'Other': '📦'
  };

  async function loadCategoriesView() {
    try {
      categoryCardsGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px;">Loading categories...</div>';
      const res = await API.getCategories();
      if (res.success && Array.isArray(res.categories)) {
        categoryCardsGrid.innerHTML = res.categories.map(cat => `
          <div class="category-card" data-category="${cat.name}">
            <div class="cat-card-icon">${CATEGORY_ICONS[cat.name] || '🏷️'}</div>
            <div class="cat-card-content">
              <h4>${cat.name}</h4>
              <span>${cat.count} listings available ➜</span>
            </div>
          </div>
        `).join('');

        categoryCardsGrid.querySelectorAll('.category-card').forEach(card => {
          card.addEventListener('click', () => {
            const selectedCat = card.getAttribute('data-category');
            state.activeCategory = selectedCat;
            updateCategoryPills(selectedCat);
            switchTab('all');
            updateFilterPills();
            loadItems();
          });
        });
      }
    } catch (e) {
      categoryCardsGrid.innerHTML = '<div style="color:red; text-align:center;">Failed loading categories</div>';
    }
  }

  // ===================================================
  // Admin Panel Functionality (Delete items, manage reports, users)
  // ===================================================


  // ===================================================
  // Navigation Tabs Switching (All, Categories, Favorites, My Ads)
  // ===================================================

  function switchTab(tabName) {
    state.activeTab = tabName;

    // Reset active buttons
    tabAll.classList.remove('active');
    tabCategories.classList.remove('active');
    tabFavorites.classList.remove('active');
    tabMyAds.classList.remove('active');

    // Hide all view containers
    itemsGridContainer.classList.add('hidden');
    categoriesTabContainer.classList.add('hidden');

    if (tabName === 'all') {
      tabAll.classList.add('active');
      itemsGridContainer.classList.remove('hidden');
      sectionTitle.textContent = state.activeCategory === 'All' ? 'Fresh recommendations' : `${state.activeCategory} Listings`;
      sortBox.classList.remove('hidden');
      loadItems();
    } else if (tabName === 'categories') {
      tabCategories.classList.add('active');
      categoriesTabContainer.classList.remove('hidden');
      sectionTitle.textContent = 'All Categories';
      sortBox.classList.add('hidden');
      loadCategoriesView();
    } else if (tabName === 'favorites') {
      tabFavorites.classList.add('active');
      itemsGridContainer.classList.remove('hidden');
      sectionTitle.textContent = 'Your Saved Favorites';
      sortBox.classList.remove('hidden');
      if (!state.currentUser) {
        showToast('Please login to see your saved favorites');
        openModal(authModal);
      } else {
        loadItems();
      }
    } else if (tabName === 'myAds') {
      tabMyAds.classList.add('active');
      itemsGridContainer.classList.remove('hidden');
      sectionTitle.textContent = 'My Marketplace Listings';
      sortBox.classList.remove('hidden');
      if (!state.currentUser) {
        showToast('Please login to manage your listings');
        openModal(authModal);
      } else {
        loadItems();
      }
    }
  }

  tabAll.addEventListener('click', () => switchTab('all'));
  tabCategories.addEventListener('click', () => switchTab('categories'));
  tabFavorites.addEventListener('click', () => switchTab('favorites'));
  tabMyAds.addEventListener('click', () => switchTab('myAds'));


  // ===================================================
  // Filter Pills & Search
  // ===================================================

  function updateFilterPills() {
    let hasFilters = false;

    if (state.searchQuery) {
      activeSearchVal.textContent = state.searchQuery;
      activeSearchTag.classList.remove('hidden');
      hasFilters = true;
    } else {
      activeSearchTag.classList.add('hidden');
    }

    if (state.activeCategory && state.activeCategory !== 'All') {
      activeCategoryVal.textContent = state.activeCategory;
      activeCategoryTag.classList.remove('hidden');
      hasFilters = true;
    } else {
      activeCategoryTag.classList.add('hidden');
    }

    if (state.activeLocation && state.activeLocation !== 'All India') {
      activeLocationVal.textContent = state.activeLocation;
      activeLocationTag.classList.remove('hidden');
      hasFilters = true;
    } else {
      activeLocationTag.classList.add('hidden');
    }

    if (hasFilters) {
      filterPillsContainer.classList.remove('hidden');
    } else {
      filterPillsContainer.classList.add('hidden');
    }
  }

  clearSearchBtn.addEventListener('click', () => {
    state.searchQuery = '';
    searchInput.value = '';
    updateFilterPills();
    loadItems();
  });

  clearCategoryBtn.addEventListener('click', () => {
    state.activeCategory = 'All';
    updateCategoryPills('All');
    updateFilterPills();
    loadItems();
  });

  clearLocationBtn.addEventListener('click', () => {
    state.activeLocation = 'All India';
    locationInput.value = 'All India';
    clearLocationFilterBtn.classList.add('hidden');
    updateFilterPills();
    loadItems();
  });

  clearAllFiltersBtn.addEventListener('click', () => {
    resetAllFilters();
  });

  resetFiltersBtn.addEventListener('click', () => {
    resetAllFilters();
  });

  function resetAllFilters() {
    state.searchQuery = '';
    state.activeCategory = 'All';
    state.activeLocation = 'All India';
    state.sortBy = 'newest';
    searchInput.value = '';
    locationInput.value = 'All India';
    clearLocationFilterBtn.classList.add('hidden');
    sortSelect.value = 'newest';
    updateCategoryPills('All');
    updateFilterPills();
    loadItems();
  }

  function updateCategoryPills(activeCat) {
    document.querySelectorAll('.cat-pill').forEach(pill => {
      if (pill.getAttribute('data-category') === activeCat) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Quick Category Links Click
  quickLinks.addEventListener('click', (e) => {
    const pill = e.target.closest('.cat-pill');
    if (!pill) return;
    const cat = pill.getAttribute('data-category');
    state.activeCategory = cat;
    updateCategoryPills(cat);
    switchTab('all');
    updateFilterPills();
    loadItems();
  });

  // Mega dropdown links click
  categoriesDropdown.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-category]');
    if (!link) return;
    e.preventDefault();
    const cat = link.getAttribute('data-category');
    state.activeCategory = cat;
    updateCategoryPills(cat);
    categoriesDropdown.classList.add('hidden');
    switchTab('all');
    updateFilterPills();
    loadItems();
  });

  allCategoriesBtn.addEventListener('click', () => {
    categoriesDropdown.classList.toggle('hidden');
  });

  // Search input & button
  searchBtn.addEventListener('click', () => {
    state.searchQuery = searchInput.value.trim();
    switchTab('all');
    updateFilterPills();
    loadItems();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      state.searchQuery = searchInput.value.trim();
      switchTab('all');
      updateFilterPills();
      loadItems();
    }
  });

  // Sort change
  sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    loadItems();
  });

  // Footer locations click
  document.querySelectorAll('.footer-loc').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const loc = link.getAttribute('data-location');
      state.activeLocation = loc;
      locationInput.value = loc;
      clearLocationFilterBtn.classList.remove('hidden');
      switchTab('all');
      updateFilterPills();
      loadItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ===================================================
  // Sell Item Form Submission (In-DB Base64 Image)
  // ===================================================

  sellBtn.addEventListener('click', () => {
    if (!state.currentUser) {
      showToast('Please login to post your ad');
      openModal(authModal);
      return;
    }
    openSellModal();
  });

  heroSellBtn.addEventListener('click', () => {
    if (!state.currentUser) {
      showToast('Please login to post your ad');
      openModal(authModal);
      return;
    }
    openSellModal();
  });

  function openSellModal() {
    sellForm.reset();
    sellError.classList.add('hidden');
    sellImageBase64.value = '';
    imagePreview.src = '';
    imagePreviewContainer.classList.add('hidden');
    dropzoneContent.classList.remove('hidden');

    if (state.currentUser) {
      document.getElementById('sellName').value = state.currentUser.name || '';
      document.getElementById('sellPhone').value = state.currentUser.phone || '+91 98765 43210';
    }

    openModal(sellModal);
  }

  sellForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    sellError.classList.add('hidden');

    const title = document.getElementById('sellTitle').value.trim();
    const category = document.getElementById('sellCategory').value;
    const description = document.getElementById('sellDesc').value.trim();
    const price = document.getElementById('sellPrice').value;
    const location = sellLocationInput.value.trim();
    const sellerName = document.getElementById('sellName').value.trim();
    const sellerPhone = document.getElementById('sellPhone').value.trim();
    const imageBase64 = sellImageBase64.value;

    if (!location || location === 'All India') {
      sellError.textContent = 'Please select a verified city from the location dropdown';
      sellError.classList.remove('hidden');
      return;
    }

    if (!imageBase64) {
      sellError.textContent = 'Please choose a photo for your item';
      sellError.classList.remove('hidden');
      return;
    }

    const payload = {
      title,
      category,
      description,
      price: Number(price),
      location,
      sellerName,
      sellerPhone,
      imageBase64,
      userId: state.currentUser ? state.currentUser.id : null
    };

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        closeModal(sellModal);
        showToast('Your ad has been posted successfully! 🎉');
        switchTab('all');
      } else {
        sellError.textContent = data.message || 'Error creating listing';
        sellError.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Error posting ad:', err);
      sellError.textContent = 'Server error uploading listing';
      sellError.classList.remove('hidden');
    }
  });

  // ===================================================
  // Authentication Form Handling
  // ===================================================

  authTabLogin.addEventListener('click', () => {
    authTabLogin.classList.add('active');
    authTabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  });

  authTabRegister.addEventListener('click', () => {
    authTabRegister.classList.add('active');
    authTabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    await executeLogin(email, password);
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.classList.add('hidden');

    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const phone    = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm  = document.getElementById('regConfirmPassword').value;

    // --- Client-side regex validations ---
    const nameRegex     = /^[a-zA-Z\s]{2,50}$/;
    const emailRegex    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex    = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!nameRegex.test(name)) {
      registerError.textContent = 'Name must be 2–50 characters and contain only letters and spaces.';
      registerError.classList.remove('hidden'); return;
    }
    if (!emailRegex.test(email)) {
      registerError.textContent = 'Please enter a valid email address.';
      registerError.classList.remove('hidden'); return;
    }
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      registerError.textContent = 'Enter a valid 10-digit Indian mobile number (starting with 6–9), optionally with +91.';
      registerError.classList.remove('hidden'); return;
    }
    if (!passwordRegex.test(password)) {
      registerError.textContent = 'Password must be at least 6 characters and include at least one letter and one number.';
      registerError.classList.remove('hidden'); return;
    }
    if (password !== confirm) {
      registerError.textContent = 'Passwords do not match.';
      registerError.classList.remove('hidden'); return;
    }

    try {
      // Role is always 'user' — admin access is not grantable via registration
      const res = await API.register(name, email, password, phone, 'user');
      if (res.success) {
        state.currentUser = res.user;
        localStorage.setItem('olx_user', JSON.stringify(res.user));
        updateAuthUI();
        closeModal(authModal);
        showToast(`Account created! Welcome, ${res.user.name} 🎉`);
        loadItems();
      } else {
        registerError.textContent = res.message || 'Registration failed';
        registerError.classList.remove('hidden');
      }
    } catch (err) {
      registerError.textContent = 'Error connecting to server during registration';
      registerError.classList.remove('hidden');
    }
  });

  // ===================================================
  // Modal Utilities
  // ===================================================

  function openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    if (modal === chatModal && state.chatPollingTimer) {
      clearInterval(state.chatPollingTimer);
      state.chatPollingTimer = null;
    }
  }

  closeDetailsModal.addEventListener('click', () => closeModal(detailsModal));
  closeSellModal.addEventListener('click', () => closeModal(sellModal));
  closeAuthModal.addEventListener('click', () => closeModal(authModal));
  closeSellerModal.addEventListener('click', () => closeModal(sellerModal));
  closeReportModal.addEventListener('click', () => closeModal(reportModal));
  closeChatModal.addEventListener('click', () => closeModal(chatModal));
  closeInboxModal.addEventListener('click', () => closeModal(inboxModal));

  // Close modals on overlay backdrop click
  [detailsModal, sellModal, authModal, sellerModal, reportModal, chatModal, inboxModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Escape key closes open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [detailsModal, sellModal, authModal, sellerModal, reportModal, chatModal, inboxModal].forEach(modal => {
        if (!modal.classList.contains('hidden')) {
          closeModal(modal);
        }
      });
      categoriesDropdown.classList.add('hidden');
    }
  });

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ===================================================
  // App Initialization
  // ===================================================

  updateAuthUI();
  loadLocationsList();
  loadItems();
});
