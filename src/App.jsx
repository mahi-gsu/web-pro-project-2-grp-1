import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import Auth from './components/Auth'
import Puzzle from './components/Puzzle'
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import Admin from './components/Admin'
import Leaderboard from './components/Leaderboard'
import ResetPassword from './components/ResetPassword'
import { supabase, isSupabaseAvailable } from './lib/supabase'
import { SoundProvider } from './contexts/SoundContext'

// Wrapper component to handle navigation
function AppContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isSupabaseAvailable()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })
      return () => subscription.unsubscribe()
    } else {
      setUser({ id: 'demo', email: 'demo@example.com' }) // Demo mode user
      setLoading(false)
    }
  }, [])

  const handleSignOut = async () => {
    if (isSupabaseAvailable()) {
      await supabase.auth.signOut()
    }
    setUser(null)
    navigate('/')
  }

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleLeaderboardClick = () => {
    navigate('/leaderboard')
  }

  const handleAdminClick = () => {
    navigate('/admin')
  }

  const handleSignOutClick = () => {
    handleSignOut()
  }

  const handlePuzzleSelect = (puzzleId) => {
    if (puzzleId.startsWith('bg_')) {
      const imageId = puzzleId.replace('bg_', '')
      navigate(`/bg/${imageId}`)
    } else {
      navigate(`/${puzzleId}`)
    }
  }

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SoundProvider user={user}>
      <div className="App">
        {user && (
          <Navbar
            onHomeClick={handleHomeClick}
            onLeaderboardClick={handleLeaderboardClick}
            onAdminClick={handleAdminClick}
            onSignOutClick={handleSignOutClick}
            user={user}
          />
        )}
        <div className="main-content">
          <Routes>
            {/* Reset password route should be accessible regardless of user state */}
            <Route path="/reset-password" element={<ResetPassword onBackToLogin={() => navigate('/signin')} />} />
            
            {!user ? (
              <>
                <Route path="/signin" element={<Auth isLogin={true} />} />
                <Route path="/signup" element={<Auth isLogin={false} />} />
                <Route path="*" element={<Navigate to="/signin" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<HomePage onPuzzleSelect={handlePuzzleSelect} user={user} />} />
                <Route path="/numbers" element={<Puzzle user={user} puzzleType="numbers" />} />
              <Route path="/penguin" element={<Puzzle user={user} puzzleType="penguin" />} />
              <Route path="/cow" element={<Puzzle user={user} puzzleType="cow" />} />
              <Route path="/duck" element={<Puzzle user={user} puzzleType="duck" />} />
              <Route path="/bg/:imageId" element={<Puzzle user={user} puzzleType="bg" />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin user={user} onBack={() => navigate('/')} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
    </SoundProvider>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App 