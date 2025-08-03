import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import './ResetPassword.css';

const ResetPassword = ({ onBackToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    console.log('ResetPassword: URL hash:', window.location.hash);
    console.log('ResetPassword: URL search:', window.location.search);
    checkSession();
  }, []);

  const checkSession = async () => {
    if (!isSupabaseAvailable()) {
      setMessage('Authentication service is not available');
      setMessageType('error');
      return;
    }

    try {
      // Check for access token in URL hash (Supabase password reset flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);
      
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
      const type = hashParams.get('type') || searchParams.get('type');
      
      console.log('ResetPassword: accessToken found:', !!accessToken);
      console.log('ResetPassword: refreshToken found:', !!refreshToken);
      console.log('ResetPassword: type:', type);
      
      // If this is a password recovery flow
      if (type === 'recovery' && accessToken && refreshToken) {
        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          setIsValidSession(true);
          return;
        }
      }
      
      // Check existing session (user might already be authenticated from the reset link)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session) {
        // If user has a session, allow password reset (they might be coming from reset link)
        setIsValidSession(true);
      } else {
        setMessage('Invalid or expired reset link. Please request a new one.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Session check error:', error);
      setMessage('Failed to verify reset session');
      setMessageType('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      return;
    }

    if (!isValidSession) {
      setMessage('Invalid reset session. Please request a new reset link.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setMessage('Password updated successfully! You can now log in with your new password.');
      setMessageType('success');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      setMessage(error.message || 'Failed to update password');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    onBackToLogin();
  };

  if (!isValidSession && messageType === 'error' && !loading) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2 className="reset-password-title">Reset Password</h2>
          
          <div className={`message ${messageType}`}>
            {message}
          </div>

          <div className="back-to-login">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="back-button"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-password-title">Reset Password</h2>
        
        <p className="reset-password-description">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter new password"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="Confirm new password"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="back-to-login">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="back-button"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 