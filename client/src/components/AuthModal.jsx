import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, authModalTab, setAuthModalTab, login, register } = useAuth();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setError('');
    setAuthModalOpen(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(loginIdentifier, loginPassword);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Login failed. Please check credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const result = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>
          &times;
        </button>

        <div className="modal-header-section">
          <h3>Welcome to OLX</h3>
          <p>The trusted marketplace to buy and sell</p>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab-btn ${authModalTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthModalTab('login');
              setError('');
            }}
          >
            Login
          </button>
          <button
            className={`modal-tab-btn ${authModalTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthModalTab('register');
              setError('');
            }}
          >
            Register
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="form-error-alert">{error}</div>}

          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-field">
                <label>User ID or Email</label>
                <input
                  type="text"
                  placeholder="e.g. test101 or someone@example.com"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-primary-btn"
                disabled={submitting}
              >
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Amit Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
                <div className="hint">Only letters and spaces (2–50 chars)</div>
              </div>

              <div className="form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Mobile Number (Indian 10-digit) *</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Password *</label>
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Re-enter"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="submit-primary-btn"
                disabled={submitting}
              >
                {submitting ? 'Creating account...' : 'Create Account & Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
