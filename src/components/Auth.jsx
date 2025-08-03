import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseAvailable } from '../lib/supabase'
import ForgotPassword from './ForgotPassword'
import './Auth.css'

const Auth = ({ onAuthChange, isLogin: initialIsLogin = true }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('player')
  const [isLogin, setIsLogin] = useState(initialIsLogin)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    setIsLogin(initialIsLogin)
  }, [initialIsLogin])

  const handleAuth = async (e) => {
    e.preventDefault()
    
    if (!isSupabaseAvailable()) {
      alert('Supabase is not configured. Please use Demo mode or configure your environment variables.')
      return
    }
    
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // Check if user is active
        if (data.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('is_active')
            .eq('id', data.user.id)
            .single()
          
          if (userError) throw userError
          
          if (!userData.is_active) {
            await supabase.auth.signOut()
            throw new Error('Your account has been deactivated. Please contact an administrator.')
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role
            }
          }
        })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    onAuthChange({ user: { id: 'demo', email: 'demo@example.com' }, session: null })
  }

  const handleForgotPassword = () => {
    setShowForgotPassword(true)
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
  }

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
        
        {!isSupabaseAvailable() && (
          <div className="demo-notice">
            <p>⚠️ Supabase not configured</p>
            <p>Use Demo mode to play without database features</p>
          </div>
        )}
        
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!isSupabaseAvailable()}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!isSupabaseAvailable()}
          />
          
          {!isLogin && (
            <div className="role-selection">
              <label>Select Role:</label>
              <div className="role-options">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="player"
                    checked={role === 'player'}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={!isSupabaseAvailable()}
                  />
                  <span>Player</span>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={!isSupabaseAvailable()}
                  />
                  <span>Admin</span>
                </label>
              </div>
            </div>
          )}
          
          <button type="submit" disabled={loading || !isSupabaseAvailable()}>
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        {isLogin && isSupabaseAvailable() && (
          <button 
            className="forgot-password-button" 
            onClick={handleForgotPassword}
            disabled={loading}
          >
            Forgot Password?
          </button>
        )}
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            className="toggle-auth" 
            onClick={() => navigate(isLogin ? '/signup' : '/signin')}
            disabled={!isSupabaseAvailable()}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth 
