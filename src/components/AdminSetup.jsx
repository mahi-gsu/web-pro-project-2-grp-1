import React, { useState } from 'react'
import { supabase, isSupabaseAvailable } from '../lib/supabase'
import './AdminSetup.css'

const AdminSetup = ({ onComplete }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    if (!isSupabaseAvailable()) {
      setError('Database not available')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // First, check if the user exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', email.trim())
        .single()

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      if (existingUser) {
        // Update existing user to admin
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', existingUser.id)

        if (updateError) throw updateError
      } else {
        setError('User not found. Please make sure the user has registered first.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setEmail('')
      
      if (onComplete) {
        setTimeout(() => {
          onComplete()
        }, 2000)
      }
    } catch (err) {
      setError('Failed to set admin role')
      console.error('Error setting admin role:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-setup">
      <div className="setup-container">
        <h2>Setup First Admin User</h2>
        <p>Enter the email address of the user you want to make an admin:</p>
        
        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="adminEmail">Email Address:</label>
            <input
              type="email"
              id="adminEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              Admin role assigned successfully! Redirecting...
            </div>
          )}

          <button 
            type="submit" 
            className="setup-btn"
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Make Admin'}
          </button>
        </form>

        <div className="setup-info">
          <h4>Important Notes:</h4>
          <ul>
            <li>The user must have already registered in the system</li>
            <li>Only one admin is needed to manage the system</li>
            <li>Admins can manage other users and content</li>
            <li>This action cannot be undone from this interface</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminSetup 