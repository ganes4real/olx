import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const InboxPage = () => {
  const { user, token, isAuthenticated, openLoginModal } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      setLoading(true);
      try {
        const userId = user.id || user._id;
        const res = await API.getUserChats(userId, token);
        if (res.success && res.chats) {
          setChats(res.chats);
        } else {
          setChats([]);
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Could not load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [isAuthenticated, user, token]);

  if (!isAuthenticated) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <div className="icon">💬</div>
          <h3>Login Required</h3>
          <p>Please log in to view your active chats and messages.</p>
          <button
            className="submit-primary-btn"
            style={{ maxWidth: '200px', margin: '0 auto' }}
            onClick={openLoginModal}
          >
            Log in
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="main-content">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading conversations...</p>
        </div>
      </main>
    );
  }

  const currentUserId = (user?.id || user?._id)?.toString();

  return (
    <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="section-header-bar">
        <div className="section-title-wrap">
          <h2>💬 Your Messages & Conversations</h2>
          <div className="sub">Direct conversations with buyers and sellers</div>
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No active conversations</h3>
          <p>When you message a seller or buyers inquire about your ads, your conversations will show up here.</p>
          <Link
            to="/"
            className="submit-primary-btn"
            style={{ display: 'inline-block', maxWidth: '200px' }}
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chats.map((c) => {
            const other = c.participants?.find((p) => (p._id || p.id || p)?.toString() !== currentUserId);
            const otherName = other?.name || 'User';
            const item = c.itemId;
            const targetProductId = item?._id || item;

            return (
              <Link
                key={c._id}
                to={`/products/${targetProductId}/chat`}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.borderColor = 'var(--accent-mint)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--primary-teal)',
                      color: 'var(--accent-yellow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 700
                    }}
                  >
                    {otherName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {otherName}
                    </div>
                    {item && typeof item === 'object' && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--accent-mint)', fontWeight: 600 }}>
                        Ad: {item.title} &bull; ₹{item.price}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-muted)',
                        marginTop: '2px',
                        maxWidth: '400px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {c.lastMessage || 'No messages yet'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                    {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString() : ''}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-mint)' }}>
                    Open Chat &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
};
