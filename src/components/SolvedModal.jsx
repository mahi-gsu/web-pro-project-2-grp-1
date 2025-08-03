import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import './SolvedModal.css'

const SolvedModal = ({ isOpen, onClose, moves, time, isSavingStats, statsSaved }) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation when modal opens
      // Creates a beautiful confetti effect from both sides of the screen
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 0,
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8']
      }

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }))
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }))
      }, 250)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="solved-modal-overlay">
      <div className="solved-modal">
        <div className="solved-modal-content">
          <h1 className="solved-title">Puzzle Solved!</h1>
          
          <div className="solved-stats">
            <div className="stat-item">
              <span className="stat-label">Moves:</span>
              <span className="stat-value">{moves}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{time}</span>
            </div>
          </div>
          
          <div className="solved-message">
            <p>Congratulations! You've successfully completed the puzzle!</p>
            <p>Your skills are truly impressive!</p>
            {isSavingStats && (
              <p className="saving-stats">Saving your achievement...</p>
            )}
            {statsSaved && (
              <p className="stats-saved">Achievement saved to your profile!</p>
            )}
          </div>
          
          <div className="solved-actions">
            <button className="ok-btn" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SolvedModal 