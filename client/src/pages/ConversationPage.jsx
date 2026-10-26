import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ConversationPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, openLoginModal } = useAuth();

  const [item, setItem] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Step 1: Load product and start or find existing chat
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initConversation = async () => {
      setLoading(true);
      setError('');
      try {
        // First get item info
        const itemRes = await API.getItemById(productId);
        if (!itemRes.success || !itemRes.item) {
          setError('Listing not found');
          setLoading(false);
          return;
        }

        if (isMounted) setItem(itemRes.item);

        const currentUserId = user.id || user._id;
        const sellerId = itemRes.item.userId?._id || itemRes.item.userId;

        if (sellerId && currentUserId && sellerId.toString() === currentUserId.toString()) {
          setError('You cannot start a conversation with yourself on your own listing.');
          setLoading(false);
          return;
        }

        // Start or retrieve chat without automatically sending a message
        const chatRes = await API.startChat(
          productId,
          currentUserId,
          '',
          token
        );

        if (chatRes.success && chatRes.chat) {
          if (isMounted) {
            setChat(chatRes.chat);
            // Fetch messages for this chat
            const msgRes = await API.getChatMessages(chatRes.chat._id, currentUserId, token);
            if (msgRes.success && msgRes.messages) {
              setMessages(msgRes.messages);
            }
          }
        } else {
          setError(chatRes.message || 'Could not start conversation');
        }
      } catch (err) {
        console.error('Error starting chat:', err);
        setError('Error connecting to conversation service');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initConversation();

    return () => {
      isMounted = false;
    };
  }, [productId, isAuthenticated, user, token]);

  // Step 2: Background polling every 3 seconds for new messages
  useEffect(() => {
    if (!chat?._id || !user) return;

    const interval = setInterval(async () => {
      try {
        const currentUserId = user.id || user._id;
        const msgRes = await API.getChatMessages(chat._id, currentUserId, token);
        if (msgRes.success && msgRes.messages) {
          setMessages((prev) => {
            // Only update if count changed or last message is different
            if (msgRes.messages.length !== prev.length) {
              return msgRes.messages;
            }
            return prev;
          });
        }
      } catch (err) {
        // Silent failure on polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [chat?._id, user, token]);

  const handleSendMessage = async (textToSend) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || !chat?._id) return;

    setSending(true);
    setInputText('');

    try {
      const currentUserId = user.id || user._id;
      const res = await API.sendMessage(
        chat._id,
        currentUserId,
        user.name,
        messageContent,
        token
      );

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
      } else {
        alert(res.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If user is not authenticated, prompt to log in
  if (!isAuthenticated) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <div className="icon">🔒</div>
          <h3>Authentication Required</h3>
          <p>Please log in to start or view conversations with sellers.</p>
          <button
            className="submit-primary-btn"
            style={{ maxWidth: '200px', margin: '0 auto' }}
            onClick={openLoginModal}
          >
            Log in to Chat
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
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Connecting with seller...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <div className="icon">⚠️</div>
          <h3>Conversation Unavailable</h3>
          <p>{error}</p>
          <Link
            to={`/products/${productId}`}
            className="submit-primary-btn"
            style={{ display: 'inline-block', maxWidth: '200px' }}
          >
            Back to Product
          </Link>
        </div>
      </main>
    );
  }

  const currentUserId = (user?.id || user?._id)?.toString();
  // Find other participant
  const otherParticipant = chat?.participants?.find(
    (p) => (p._id || p.id || p)?.toString() !== currentUserId
  );
  const otherName = otherParticipant?.name || item?.sellerName || 'Seller';

  return (
    <main className="main-content">
      {/* Breadcrumb navigation */}
      <div className="breadcrumbs-bar">
        <Link to="/">Home</Link>
        <span>&rsaquo;</span>
        <Link to={`/products/${productId}`}>{item?.title || 'Product'}</Link>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Chat with {otherName}</span>
      </div>

      <div className="chat-page-container">
        {/* Chat Page Header */}
        <div className="chat-page-header">
          <div className="chat-partner-info">
            <div className="chat-partner-avatar">
              {otherName.charAt(0).toUpperCase()}
            </div>
            <div className="chat-partner-text">
              <h3>{otherName}</h3>
              <span className="chat-online-pill">
                <span>●</span> Verified Seller
              </span>
            </div>
          </div>

          {/* Product Summary Strip */}
          {item && (
            <Link
              to={`/products/${item._id}`}
              className="chat-item-summary-strip"
              title="Click to view listing"
            >
              <img
                src={item.image || '/uploads/item-default.svg'}
                alt={item.title}
                className="chat-item-thumbnail"
              />
              <div className="chat-item-text">
                <div className="title">{item.title}</div>
                <div className="price">{formatPrice(item.price)}</div>
              </div>
            </Link>
          )}
        </div>

        {/* Message Thread Area */}
        <div className="chat-messages-scroll-area">
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p>Say hello to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId?.toString() === currentUserId;
              return (
                <div
                  key={msg._id || idx}
                  className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}
                >
                  <div className="chat-bubble">{msg.text}</div>
                  <span className="chat-time-tag">
                    {formatTime(msg.createdAt)} {isMine && '✓'}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="quick-prompts-bar">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
            Quick:
          </span>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => handleQuickPrompt('Hi, is this item still available?')}
          >
            Is this available?
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => handleQuickPrompt('What is your best final price?')}
          >
            Best final price?
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => handleQuickPrompt('Can I come check the item in person today?')}
          >
            Can I inspect today?
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => handleQuickPrompt('Where are you located in the city?')}
          >
            Where are you located?
          </button>
        </div>

        {/* Input Bar */}
        <form
          className="chat-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            placeholder="Type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={sending || !inputText.trim()}
          >
            <span>Send</span>
            <span>➤</span>
          </button>
        </form>
      </div>
    </main>
  );
};
