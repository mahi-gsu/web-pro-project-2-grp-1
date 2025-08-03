import React from 'react'
import './SaveConfirmModal.css'

const SaveConfirmModal = ({ isOpen, onSave, onDiscard, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="save-confirm-overlay" onClick={onCancel}>
      <div className="save-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="save-confirm-header">
          <h2>Save Your Progress?</h2>
        </div>
        
        <div className="save-confirm-content">
          <p>You have unsaved progress. Would you like to save your current game state?</p>
          <p>You can resume from where you left off when you return to this puzzle.</p>
        </div>
        
        <div className="save-confirm-actions">
          <button 
            className="save-btn"
            onClick={onSave}
          >
            Save Progress
          </button>
          <button 
            className="discard-btn"
            onClick={onDiscard}
          >
            Discard Progress
          </button>
          <button 
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaveConfirmModal 