import React, { useState } from 'react'
import { supabase, isSupabaseAvailable } from '../lib/supabase'
import './BackgroundUpload.css'

const BackgroundUpload = ({ onUploadComplete }) => {
  const [imageName, setImageName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!imageName.trim() || !imageUrl.trim()) {
      setError('Please fill in all fields')
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
      const { error } = await supabase
        .from('background_images')
        .insert({
          image_name: imageName.trim(),
          image_url: imageUrl.trim(),
          is_active: true
        })

      if (error) throw error

      setSuccess(true)
      setImageName('')
      setImageUrl('')
      
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err) {
      setError('Failed to upload background image')
      console.error('Error uploading background image:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value)
    setError(null)
    setSuccess(false)
  }

  const handleImageNameChange = (e) => {
    setImageName(e.target.value)
    setError(null)
    setSuccess(false)
  }

  return (
    <div className="background-upload">
      <h3>Upload New Background Image</h3>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="imageName">Image Name:</label>
          <input
            type="text"
            id="imageName"
            value={imageName}
            onChange={handleImageNameChange}
            placeholder="Enter image name"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL:</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="https://example.com/image.jpg"
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
            Background image uploaded successfully!
          </div>
        )}

        <button 
          type="submit" 
          className="upload-btn"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      <div className="upload-tips">
        <h4>Tips for uploading images:</h4>
        <ul>
          <li>Use images with dimensions 400x400 pixels for best results</li>
          <li>Ensure the image URL is publicly accessible</li>
          <li>Use descriptive names for easy identification</li>
          <li>Supported formats: JPG, PNG, GIF, WebP</li>
        </ul>
      </div>
    </div>
  )
}

export default BackgroundUpload 