// Centralized API Service for OLX React Application
const BASE_URL = ''; // Relative URLs will be proxied by Vite in dev and served directly in prod

export const API = {
  // Helper to get auth headers with JWT token
  getHeaders(token, isJson = true) {
    const headers = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Auth Endpoints
  async login(identifier, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return await res.json();
  },

  async register(data) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async getMe(token) {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: this.getHeaders(token)
    });
    return await res.json();
  },

  async getUserProfile(id) {
    const res = await fetch(`${BASE_URL}/api/auth/users/${id}`);
    return await res.json();
  },

  async getUserItems(id, status = 'all') {
    const res = await fetch(`${BASE_URL}/api/auth/users/${id}/items?status=${status}`);
    return await res.json();
  },

  // Items Endpoints
  async getItems({ search = '', category = '', location = '', sort = 'newest', status = '', userId = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All' && category !== 'ALL CATEGORIES') params.append('category', category);
    if (location && location !== 'All' && location !== 'All India' && location !== 'India') params.append('location', location);
    if (sort) params.append('sort', sort);
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId);

    const res = await fetch(`${BASE_URL}/api/items?${params.toString()}`);
    return await res.json();
  },

  async getItemById(id) {
    const res = await fetch(`${BASE_URL}/api/items/${id}`);
    return await res.json();
  },

  async createItem(formData, token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers,
      body: formData
    });
    return await res.json();
  },

  async updateItemStatus(id, status, token) {
    const res = await fetch(`${BASE_URL}/api/items/${id}/status`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async deleteItem(id, token) {
    const res = await fetch(`${BASE_URL}/api/items/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token)
    });
    return await res.json();
  },

  async getCategories() {
    const res = await fetch(`${BASE_URL}/api/items/meta/categories`);
    return await res.json();
  },

  async getLocations(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${BASE_URL}/api/locations${params}`);
    return await res.json();
  },

  // Favorites Endpoints
  async toggleFavorite(itemId, token, fallbackUserId = '') {
    const res = await fetch(`${BASE_URL}/api/favorites/toggle/${itemId}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userId: fallbackUserId })
    });
    return await res.json();
  },

  async getUserFavorites(userId, token) {
    const res = await fetch(`${BASE_URL}/api/favorites/user/${userId}`, {
      headers: this.getHeaders(token)
    });
    return await res.json();
  },

  async getFavoriteIds(userId, token) {
    const res = await fetch(`${BASE_URL}/api/favorites/ids/${userId}`, {
      headers: this.getHeaders(token)
    });
    return await res.json();
  },

  // Chats / Conversations Endpoints
  async startChat(itemId, buyerId, initialMessage = '', token) {
    const res = await fetch(`${BASE_URL}/api/chats/start`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ itemId, buyerId, initialMessage })
    });
    return await res.json();
  },

  async getUserChats(userId, token) {
    const res = await fetch(`${BASE_URL}/api/chats/user/${userId}`, {
      headers: this.getHeaders(token)
    });
    return await res.json();
  },

  async getChatMessages(chatId, userId, token) {
    const res = await fetch(`${BASE_URL}/api/chats/${chatId}/messages?userId=${userId || ''}`, {
      headers: this.getHeaders(token)
    });
    return await res.json();
  },

  async sendMessage(chatId, senderId, senderName, text, token) {
    const res = await fetch(`${BASE_URL}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ senderId, senderName, text })
    });
    return await res.json();
  },

  // Reports
  async createReport(reportData, token) {
    const res = await fetch(`${BASE_URL}/api/reports`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(reportData)
    });
    return await res.json();
  }
};
