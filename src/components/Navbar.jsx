import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseAvailable } from '../lib/supabase'
import './Navbar.css'
import SoundToggle from './SoundToggle'

const Navbar = ({ onHomeClick, onLeaderboardClick, onAdminClick, onSignOutClick, user }) => {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
  }, [user])

  const checkAdminStatus = async () => {
    if (!isSupabaseAvailable() || !user) {
      setIsAdmin(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setIsAdmin(data?.role === 'admin')
    } catch (err) {
      console.error('Error checking admin status:', err)
      setIsAdmin(false)
    }
  }
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={onHomeClick}>
        fifteen puzzle
      </div>
      <div className="navbar-nav">
        <div className="nav-link" onClick={onLeaderboardClick}>
          leaderboard
        </div>
        {isAdmin && (
          <div className="nav-link admin-link" onClick={onAdminClick}>
            admin
          </div>
        )}
        <SoundToggle user={user} className="nav-sound-toggle" />
        <div className="nav-link" onClick={onSignOutClick}>
          sign out
        </div>
      </div>
    </nav>
  )
}

export default Navbar 