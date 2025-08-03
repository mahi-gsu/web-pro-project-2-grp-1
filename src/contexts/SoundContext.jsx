import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseAvailable } from '../lib/supabase'

const SoundContext = createContext()

export const useSound = () => {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}

export const SoundProvider = ({ children, user }) => {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Load user's sound setting on mount
  useEffect(() => {
    if (user && isSupabaseAvailable()) {
      loadSoundSetting()
    }
  }, [user])

  const loadSoundSetting = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('sound_setting')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading sound setting:', error)
      } else if (data) {
        setSoundEnabled(data.sound_setting)
      }
    } catch (error) {
      console.error('Error loading sound setting:', error)
    }
  }

  const toggleSound = async () => {
    if (!user || !isSupabaseAvailable()) {
      // For demo mode, just toggle locally
      setSoundEnabled(!soundEnabled)
      return
    }

    setIsLoading(true)
    const newSoundSetting = !soundEnabled

    try {
      const { error } = await supabase
        .from('users')
        .update({ sound_setting: newSoundSetting })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating sound setting:', error)
      } else {
        setSoundEnabled(newSoundSetting)
        console.log('Sound setting updated:', newSoundSetting)
      }
    } catch (error) {
      console.error('Error updating sound setting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const playSound = (audioRef) => {
    if (soundEnabled && audioRef && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err)
      })
    }
  }

  const value = {
    soundEnabled,
    toggleSound,
    playSound,
    isLoading
  }

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  )
} 