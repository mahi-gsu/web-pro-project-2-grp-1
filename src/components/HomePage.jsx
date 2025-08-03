import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseAvailable } from '../lib/supabase'
import UploadModal from './UploadModal'
import './HomePage.css'

const HomePage = ({ onPuzzleSelect, user }) => {
  const [puzzleOptions, setPuzzleOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [error, setError] = useState('')

  // Fetch approved background images as puzzle options
  const fetchPuzzleOptions = async () => {
    if (!isSupabaseAvailable()) {
      // Fallback to static options if Supabase not available
      setPuzzleOptions([
        {
          id: 'numbers',
          name: 'Number 15 Puzzle',
          description: 'Classic numbered tiles puzzle',
          icon: '/src/assets/number-puzzle.png'
        }
      ])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('background_images')
        .select('*')
        .eq('is_active', true)
        .order('image_id', { ascending: false })

      if (error) throw error

      // Convert background images to puzzle options
      const dynamicPuzzles = data.map(image => ({
        id: `bg_${image.image_id}`,
        name: image.image_name,
        description: `Custom puzzle: ${image.image_name}`,
        icon: image.image_url,
        isCustom: true
      }))

      // Add static puzzles
      const staticPuzzles = [
        {
          id: 'numbers',
          name: 'Number 15 Puzzle',
          description: 'Classic numbered tiles puzzle',
          icon: '/src/assets/number-puzzle.png',
          isCustom: false
        }
      ]

      setPuzzleOptions([...staticPuzzles, ...dynamicPuzzles])
    } catch (err) {
      console.error('Error fetching puzzle options:', err)
      setError('Failed to load puzzle options')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPuzzleOptions()
  }, [])

  const handleUploadComplete = () => {
    fetchPuzzleOptions() // Refresh the list after upload
  }

  const handlePuzzleSelect = (puzzleId) => {
    onPuzzleSelect(puzzleId)
  }

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-content">
          <div className="loading-message">
            <h2>Loading Puzzles...</h2>
            <p>Please wait while we fetch available puzzle options.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <div className="home-content">
        
        <div className="puzzle-selection">
          <div className="selection-header">
            <h2 className="selection-title">Choose Your Puzzle</h2>
            {user && (
              <button 
                className="upload-puzzle-btn"
                onClick={() => setShowUploadModal(true)}
              >
                Upload New Puzzle
              </button>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError('')}>×</button>
            </div>
          )}
          
          <div className="puzzle-grid">
            {puzzleOptions.map((puzzle) => (
              <div key={puzzle.id} className="puzzle-option-wrapper">
                <div 
                  className="puzzle-option"
                  onClick={() => handlePuzzleSelect(puzzle.id)}
                >
                  {puzzle.isCustom || puzzle.icon.startsWith('/') ? (
                    <img src={puzzle.icon} alt={puzzle.name} />
                  ) : (
                    <div className="puzzle-icon">
                      <span>{puzzle.icon}</span>
                    </div>
                  )}
                </div>
                <h3 className="puzzle-name">{puzzle.name}</h3>
                <p className="puzzle-description">{puzzle.description}</p>
                {puzzle.isCustom && (
                  <span className="custom-badge">Custom</span>
                )}
              </div>
            ))}
          </div>
          
          {puzzleOptions.length === 0 && (
            <div className="no-puzzles">
              <p>No puzzles available. Be the first to upload one!</p>
            </div>
          )}
        </div>
      </div>

      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}

export default HomePage 