import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseAvailable } from '../lib/supabase'
import './Admin.css'

const Admin = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [backgroundImages, setBackgroundImages] = useState([])
  const [gameStats, setGameStats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if user is admin
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

  const loadUsers = async () => {
    if (!isSupabaseAvailable()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('registration_date', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError('Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadBackgroundImages = async () => {
    if (!isSupabaseAvailable()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('background_images')
        .select('*')
        .order('image_id', { ascending: false })

      if (error) throw error
      setBackgroundImages(data || [])
    } catch (err) {
      setError('Failed to load background images')
      console.error('Error loading background images:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadGameStats = async () => {
    if (!isSupabaseAvailable()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select(`
          *,
          users(username, email),
          background_images(image_name)
        `)
        .order('game_date', { ascending: false })

      if (error) throw error
      setGameStats(data || [])
    } catch (err) {
      setError('Failed to load game statistics')
      console.error('Error loading game stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    if (!isSupabaseAvailable()) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      await loadUsers()
    } catch (err) {
      setError('Failed to update user role')
      console.error('Error updating user role:', err)
    }
  }

  const toggleUserStatus = async (userId, isActive) => {
    if (!isSupabaseAvailable()) return

    const action = isActive ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !isActive })
        .eq('id', userId)

      if (error) throw error
      await loadUsers()
    } catch (err) {
      setError(`Failed to ${action} user`)
      console.error(`Error ${action}ing user:`, err)
    }
  }

  const toggleBackgroundImage = async (imageId, isActive) => {
    if (!isSupabaseAvailable()) return

    try {
      const { error } = await supabase
        .from('background_images')
        .update({ is_active: !isActive })
        .eq('image_id', imageId)

      if (error) throw error
      await loadBackgroundImages()
    } catch (err) {
      setError('Failed to update background image')
      console.error('Error updating background image:', err)
    }
  }

  const deleteBackgroundImage = async (imageId) => {
    if (!isSupabaseAvailable()) return

    if (!confirm('Are you sure you want to delete this background image?')) return

    try {
      const { error } = await supabase
        .from('background_images')
        .delete()
        .eq('image_id', imageId)

      if (error) throw error
      await loadBackgroundImages()
    } catch (err) {
      setError('Failed to delete background image')
      console.error('Error deleting background image:', err)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setError(null)
    
    switch (tab) {
      case 'users':
        loadUsers()
        break
      case 'backgrounds':
        loadBackgroundImages()
        break
      case 'stats':
        loadGameStats()
        break
      default:
        break
    }
  }

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <div className="admin-access-denied">
          <h2>Access Denied</h2>
          <p>You don't have admin privileges to access this page.</p>
          <button onClick={onBack} className="back-btn">Back to Game</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={onBack} className="back-btn">Back to Game</button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          User Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'backgrounds' ? 'active' : ''}`}
          onClick={() => handleTabChange('backgrounds')}
        >
          Background Images
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => handleTabChange('stats')}
        >
          Game Statistics
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="admin-content">
        {loading && <div className="loading">Loading...</div>}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>User Management</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className={!user.is_active ? 'inactive-user' : ''}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <select 
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          disabled={!user.is_active}
                        >
                          <option value="player">Player</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.registration_date).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn"
                            onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'player' : 'admin')}
                            disabled={!user.is_active}
                          >
                            Toggle Role
                          </button>
                          <button 
                            className={`action-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'backgrounds' && (
          <div className="backgrounds-section">
            <h2>Background Image Management</h2>
            <div className="backgrounds-table">
              <table>
                <thead>
                  <tr>
                    <th>Image Name</th>
                    <th>Image Link</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backgroundImages.map(image => (
                    <tr key={image.image_id} className={!image.is_active ? 'inactive-image' : ''}>
                      <td>{image.image_name}</td>
                      <td>
                        <a 
                          href={image.image_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="image-link"
                        >
                          {image.image_url}
                        </a>
                      </td>
                      <td>
                        <span className={`status-badge ${image.is_active ? 'active' : 'inactive'}`}>
                          {image.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className={`action-btn ${image.is_active ? 'deactivate' : 'activate'}`}
                            onClick={() => toggleBackgroundImage(image.image_id, image.is_active)}
                          >
                            {image.is_active ? 'Disapprove' : 'Approve'}
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => deleteBackgroundImage(image.image_id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-section">
            <h2>Game Statistics</h2>
            <div className="stats-summary">
              <div className="stat-card">
                <h3>Total Games</h3>
                <p>{gameStats.length}</p>
              </div>
              <div className="stat-card">
                <h3>Average Time</h3>
                <p>{gameStats.length > 0 
                  ? Math.round(gameStats.reduce((sum, stat) => sum + stat.time_taken_seconds, 0) / gameStats.length)
                  : 0}s
                </p>
              </div>
              <div className="stat-card">
                <h3>Average Moves</h3>
                <p>{gameStats.length > 0 
                  ? Math.round(gameStats.reduce((sum, stat) => sum + stat.moves_count, 0) / gameStats.length)
                  : 0}
                </p>
              </div>
            </div>
            <div className="stats-table">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Puzzle Size</th>
                    <th>Time (s)</th>
                    <th>Moves</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {gameStats.map(stat => (
                    <tr key={stat.stat_id}>
                      <td>{stat.users?.username || 'Unknown'}</td>
                      <td>{stat.puzzle_size}</td>
                      <td>{stat.time_taken_seconds}</td>
                      <td>{stat.moves_count}</td>
                      <td>{stat.win_status ? 'Win' : 'Incomplete'}</td>
                      <td>{new Date(stat.game_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin 