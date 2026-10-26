// api.js - Centralized API helpers for OLX Clone
const API = {
  // Items API
  async getItems({ search = '', category = '', location = '', sort = 'newest', status = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All' && category !== 'ALL CATEGORIES') params.append('category', category);
    if (location && location !== 'All' && location !== 'India') params.append('location', location);
    if (sort) params.append('sort', sort);
    if (status) params.append('status', status);

    const res = await fetch(`/api/items?${params.toString()}`);
    return await res.json();
  },

  async getItemById(id) {
    const res = await fetch(`/api/items/${id}`);
    return await res.json();
  },

  async createItem(formData) {
    const res = await fetch('/api/items', {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  async updateItemStatus(id, status) {
    const res = await fetch(`/api/items/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async deleteItem(id) {
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async getCategories() {
    const res = await fetch('/api/items/meta/categories');
    return await res.json();
  },

  // Locations API
  async getLocations(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/locations${params}`);
    return await res.json();
  },

  // User Profile & User Items
  async getUserProfile(id) {
    const res = await fetch(`/api/auth/users/${id}`);
    return await res.json();
  },

  async getUserItems(id, status = 'all') {
    const res = await fetch(`/api/auth/users/${id}/items?status=${status}`);
    return await res.json();
  },

  // Auth API — identifier can be userId (e.g. test101), email, or username
  async login(identifier, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return await res.json();
  },

  async register(name, email, password, phone, role = 'user') {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role })
    });
    return await res.json();
  },

  // Favorites API (Dedicated Collection)
  async toggleFavorite(itemId, userId) {
    const res = await fetch(`/api/favorites/toggle/${itemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return await res.json();
  },

  async getUserFavorites(userId) {
    const res = await fetch(`/api/favorites/user/${userId}`);
    return await res.json();
  },

  async getFavoriteIds(userId) {
    const res = await fetch(`/api/favorites/ids/${userId}`);
    return await res.json();
  },

  // Reports API (Scams / Abuse)
  async createReport(reportData) {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    return await res.json();
  },

  async getReports(status = 'all') {
    const res = await fetch(`/api/reports?status=${status}`);
    return await res.json();
  },

  async updateReportStatus(id, status, adminNotes = '') {
    const res = await fetch(`/api/reports/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes })
    });
    return await res.json();
  },

  async deleteReport(id) {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // Conversations & Chats API
  async startChat(itemId, buyerId, initialMessage = '') {
    const res = await fetch('/api/chats/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, buyerId, initialMessage })
    });
    return await res.json();
  },

  async getUserChats(userId) {
    const res = await fetch(`/api/chats/user/${userId}`);
    return await res.json();
  },

  async getChatMessages(chatId, userId) {
    const res = await fetch(`/api/chats/${chatId}/messages?userId=${userId || ''}`);
    return await res.json();
  },

  async sendMessage(chatId, senderId, senderName, text) {
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, senderName, text })
    });
    return await res.json();
  },

  // Admin Panel API
  async getAdminStats() {
    const res = await fetch('/api/admin/stats');
    return await res.json();
  },

  async getAdminItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/admin/items?${query}`);
    return await res.json();
  },

  async adminDeleteItem(id) {
    const res = await fetch(`/api/admin/items/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async adminUpdateItemStatus(id, status) {
    const res = await fetch(`/api/admin/items/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async getAdminUsers() {
    const res = await fetch('/api/admin/users');
    return await res.json();
  },

  async adminToggleUserRole(id, role) {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return await res.json();
  },

  async adminDeleteUser(id) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  }
};
