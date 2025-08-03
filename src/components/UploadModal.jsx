import React, { useState, useRef } from 'react'
import { supabase, isSupabaseAvailable } from '../lib/supabase'
import './UploadModal.css'

const UploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  const [imageName, setImageName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      setError('')
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!imageName.trim() || !selectedFile) {
      setError('Please fill in all fields and select an image')
      return
    }

    if (!isSupabaseAvailable()) {
      setError('Supabase is not configured')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${selectedFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('puzzle-images')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('puzzle-images')
        .getPublicUrl(uploadData.path)

      // Save to database
      const { error: dbError } = await supabase
        .from('background_images')
        .insert({
          image_name: imageName.trim(),
          image_url: publicUrl,
          is_active: false // Start as inactive, needs admin approval
        })

      if (dbError) throw dbError

      // Reset form
      setImageName('')
      setSelectedFile(null)
      setPreviewUrl('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onUploadComplete()
      onClose()
    } catch (err) {
      setError('Failed to upload image. Please try again.')
      console.error('Error uploading image:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h2>Upload New Puzzle Image</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="imageName">Image Name:</label>
            <input
              type="text"
              id="imageName"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="Enter a name for your puzzle"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="imageFile">Select Image:</label>
            <input
              type="file"
              id="imageFile"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              required
              disabled={loading}
            />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="upload-info">
            <p>Your image will be reviewed by an admin before becoming available as a puzzle option.</p>
            <p>Supported formats: JPG, PNG, GIF (max 5MB)</p>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="upload-btn"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal 