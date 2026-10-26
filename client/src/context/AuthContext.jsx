import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('olx_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('olx_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'register'
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  // Validate token with backend /api/auth/me on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const currentToken = localStorage.getItem('olx_token');
      if (!currentToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.getMe(currentToken);
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('olx_user', JSON.stringify(res.user));
          // Load favorites for this user
          loadFavorites(res.user.id || res.user._id, currentToken);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Auth token verification failed:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Load favorite IDs
  const loadFavorites = async (userId, userToken) => {
    if (!userId) return;
    try {
      const res = await API.getFavoriteIds(userId, userToken);
      if (res.success && res.favoriteIds) {
        setFavoriteIds(new Set(res.favoriteIds));
      }
    } catch (err) {
      console.warn('Error loading favorites:', err);
    }
  };

  // Toggle favorite helper
  const toggleFavorite = async (itemId) => {
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return false;
    }

    try {
      const userId = user.id || user._id;
      const res = await API.toggleFavorite(itemId, token, userId);
      if (res.success) {
        setFavoriteIds(new Set(res.favoriteIds || []));
        return res.isFavorite;
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
    return false;
  };

  // Login method
  const login = async (identifier, password) => {
    const res = await API.login(identifier, password);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('olx_token', res.token);
      localStorage.setItem('olx_user', JSON.stringify(res.user));
      setAuthModalOpen(false);
      loadFavorites(res.user.id || res.user._id, res.token);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  // Register method
  const register = async (userData) => {
    const res = await API.register(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('olx_token', res.token);
      localStorage.setItem('olx_user', JSON.stringify(res.user));
      setAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  // Logout method
  const logout = () => {
    setUser(null);
    setToken(null);
    setFavoriteIds(new Set());
    localStorage.removeItem('olx_token');
    localStorage.removeItem('olx_user');
  };

  const openLoginModal = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab('register');
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openLoginModal,
        openRegisterModal,
        sellModalOpen,
        setSellModalOpen,
        favoriteIds,
        favoritesCount: favoriteIds.size,
        toggleFavorite,
        isFavorited: (itemId) => favoriteIds.has(itemId?.toString()),
        unreadCount,
        setUnreadCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
