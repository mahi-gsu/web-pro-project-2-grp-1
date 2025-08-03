import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Puzzle.css'
import { supabase, isSupabaseAvailable } from '../lib/supabase'
import SaveConfirmModal from './SaveConfirmModal'
import SolvedModal from './SolvedModal'
import { useSound } from '../contexts/SoundContext'

const Puzzle = ({ user, puzzleType = 'numbers' }) => {
  const { imageId } = useParams()
  const [board, setBoard] = useState([])
  const [emptyPos, setEmptyPos] = useState({ row: 3, col: 3 })
  const [moves, setMoves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const [movingTile, setMovingTile] = useState(null)
  const [tilePositions, setTilePositions] = useState({})
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [puzzleTitle, setPuzzleTitle] = useState('')
  const [hasSavedState, setHasSavedState] = useState(false)
  const [savedStateId, setSavedStateId] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSolvedModal, setShowSolvedModal] = useState(false)
  const [isSavingStats, setIsSavingStats] = useState(false)
  const [statsSaved, setStatsSaved] = useState(false)
  const [finalMoves, setFinalMoves] = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const navigate = useNavigate()
  
  // Audio for tile movement
  const tileAudioRef = useRef(null)
  
  // Sound context
  const { playSound } = useSound()

  // Initialize audio
  useEffect(() => {
    tileAudioRef.current = new Audio('/database/tile.mp3')
    tileAudioRef.current.volume = 0.5
  }, [])

  // Play tile movement sound
  const playTileSound = useCallback(() => {
    playSound(tileAudioRef)
  }, [playSound])

  // Initialize puzzle based on type
  const initializePuzzle = useCallback(() => {
    const numbers = Array.from({ length: 15 }, (_, i) => i + 1)
    const initialBoard = []
    
    for (let i = 0; i < 4; i++) {
      const row = []
      for (let j = 0; j < 4; j++) {
        if (i === 3 && j === 3) {
          row.push(0) // Empty space
        } else {
          row.push(numbers[i * 4 + j])
        }
      }
      initialBoard.push(row)
    }
    
    setBoard(initialBoard)
    setEmptyPos({ row: 3, col: 3 })
    setMoves(0)
    setTimer(0)
    setIsPlaying(false)
    setIsSolved(false)
    setMovingTile(null)
    setTilePositions({})
    setFinalMoves(0)
    setFinalTime(0)
  }, [])

  // Load saved game state
  const loadSavedGameState = useCallback(async () => {
    if (!isSupabaseAvailable() || !user) {
      console.log('Supabase not available or no user')
      return false
    }

    try {
      const puzzleId = puzzleType === 'bg' ? `bg_${imageId}` : puzzleType
      console.log('Loading saved state for:', { puzzleType, puzzleId, userId: user.id })
      
      const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_id', user.id)
        .eq('puzzle_type', puzzleType)
        .eq('puzzle_id', puzzleId)
        .eq('is_active', true)

      if (error) throw error
      
      if (data && data.length > 0) {
        const savedState = data[0]
        console.log('Found saved state:', savedState)
        setBoard(savedState.board_state)
        setEmptyPos(savedState.empty_position)
        setMoves(savedState.moves_count)
        setTimer(savedState.time_seconds)
        setHasSavedState(true)
        setSavedStateId(savedState.state_id)
        setIsPlaying(true)
        return true
      } else {
        console.log('No saved state found')
        
        // Debug: Check what's actually in the database
        const { data: debugData, error: debugError } = await supabase
          .from('game_states')
          .select('*')
          .eq('user_id', user.id)
          .eq('puzzle_type', puzzleType)
        
        if (debugError) {
          console.error('Debug query error:', debugError)
        } else {
          console.log('All states for this user and puzzle type:', debugData)
        }
      }
    } catch (err) {
      console.error('Error loading saved game state:', err)
    }
    return false
  }, [user, puzzleType, imageId])

  // Save game state
  const saveGameState = useCallback(async () => {
    if (!isSupabaseAvailable() || !user || isSolved) {
      console.log('Cannot save: Supabase not available, no user, or puzzle solved')
      return false
    }

    try {
      const puzzleId = puzzleType === 'bg' ? `bg_${imageId}` : puzzleType
      const gameState = {
        board_state: board,
        empty_position: emptyPos,
        moves_count: moves,
        time_seconds: timer,
        updated_at: new Date().toISOString()
      }

      console.log('Saving game state for:', { puzzleType, puzzleId, userId: user.id })

      // Always upsert - update if exists, insert if not
      const { data, error } = await supabase
        .from('game_states')
        .upsert({
          user_id: user.id,
          puzzle_type: puzzleType,
          puzzle_id: puzzleId,
          is_active: true,
          ...gameState
        }, {
          onConflict: 'user_id,puzzle_type,puzzle_id'
        })
        .select()

      if (error) throw error
      
      if (data && data.length > 0) {
        const stateId = data[0].state_id
        if (!savedStateId) {
          console.log('New state created:', stateId)
          setSavedStateId(stateId)
          setHasSavedState(true)
        } else {
          console.log('State updated:', stateId)
        }
        setHasUnsavedChanges(false)
        return true
      }
    } catch (err) {
      console.error('Error saving game state:', err)
    }
    return false
  }, [user, puzzleType, imageId, board, emptyPos, moves, timer, isSolved, savedStateId])

  // Modal handlers
  const handleSaveAndNavigate = async () => {
    const saved = await saveGameState()
    if (saved) {
      setShowSaveModal(false)
      navigate('/')
    }
  }

  const handleDiscardAndNavigate = () => {
    setShowSaveModal(false)
    setHasUnsavedChanges(false)
    navigate('/')
  }

  const handleCancelNavigation = () => {
    setShowSaveModal(false)
  }

  // Delete saved game state
  const deleteSavedGameState = useCallback(async () => {
    if (!isSupabaseAvailable() || !savedStateId) return

    try {
      const { error } = await supabase
        .from('game_states')
        .update({ is_active: false })
        .eq('state_id', savedStateId)

      if (error) throw error
      
      setHasSavedState(false)
      setSavedStateId(null)
    } catch (err) {
      console.error('Error deleting saved game state:', err)
    }
  }, [savedStateId])

  // Fetch background image for custom puzzles
  const fetchBackgroundImage = useCallback(async () => {
    if (puzzleType === 'bg' && imageId) {
      if (!isSupabaseAvailable()) return

      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('*')
          .eq('image_id', imageId)
          .eq('is_active', true)
          .single()

        if (error) throw error
        if (data) {
          setBackgroundImage(data.image_url)
          setPuzzleTitle(data.image_name)
        }
      } catch (err) {
        console.error('Error fetching background image:', err)
      }
    } else {
      setBackgroundImage(null)
      setPuzzleTitle(getPuzzleTitle())
    }
  }, [puzzleType, imageId])

  useEffect(() => {
    const initializeGame = async () => {
      await fetchBackgroundImage()
      const hasSaved = await loadSavedGameState()
      if (!hasSaved) {
        initializePuzzle()
      }
    }
    initializeGame()
  }, [fetchBackgroundImage, loadSavedGameState, initializePuzzle])

  // Timer effect
  useEffect(() => {
    let interval = null
    if (isPlaying && !isSolved) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isSolved])

  // Track unsaved changes
  useEffect(() => {
    if (isPlaying && !isSolved && board.length > 0 && moves > 0) {
      setHasUnsavedChanges(true)
    }
  }, [board, moves, isPlaying, isSolved])

  // Navigation protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Check if puzzle is solved
  const isBoardSolved = useCallback((boardState) => {
    // For both number and image puzzles, check if tiles are in correct order (1-15, with 0 at bottom-right)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i === 3 && j === 3) {
          if (boardState[i][j] !== 0) return false
        } else {
          if (boardState[i][j] !== i * 4 + j + 1) return false
        }
      }
    }
    return true
  }, [])

  // Check if two positions are adjacent
  const isAdjacent = useCallback((pos1, pos2) => {
    return (
      (Math.abs(pos1.row - pos2.row) === 1 && pos1.col === pos2.col) ||
      (Math.abs(pos1.col - pos2.col) === 1 && pos1.row === pos2.row)
    )
  }, [])

  // Check if a puzzle configuration is solvable
  const isSolvable = useCallback((boardState) => {
    // Convert 2D board to 1D array (excluding empty space)
    const tiles = []
    let emptyRow = 0
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (boardState[i][j] === 0) {
          emptyRow = i
        } else {
          tiles.push(boardState[i][j])
        }
      }
    }
    
    // Count inversions
    let inversions = 0
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] > tiles[j]) {
          inversions++
        }
      }
    }
    
    // For a 4x4 puzzle, it's solvable if:
    // - Empty space is on an even row (0 or 2) and inversions are odd, OR
    // - Empty space is on an odd row (1 or 3) and inversions are even
    return (emptyRow % 2 === 0) ? (inversions % 2 === 1) : (inversions % 2 === 0)
  }, [])

  // Generate a random solvable configuration
  const generateSolvableConfig = useCallback(() => {
    // Start with solved state
    const solvedBoard = []
    for (let i = 0; i < 4; i++) {
      const row = []
      for (let j = 0; j < 4; j++) {
        if (i === 3 && j === 3) {
          row.push(0) // Empty space
        } else {
          row.push(i * 4 + j + 1)
        }
      }
      solvedBoard.push(row)
    }
    
    let currentBoard = JSON.parse(JSON.stringify(solvedBoard))
    let emptyPos = { row: 3, col: 3 }
    let lastMove = null
    
    // Make random valid moves to shuffle (avoiding immediate reversals)
    for (let move = 0; move < 100; move++) {
      const possibleMoves = []
      
      // Find all valid moves (adjacent to empty space)
      if (emptyPos.row > 0) possibleMoves.push({ row: emptyPos.row - 1, col: emptyPos.col, direction: 'down' }) // Up
      if (emptyPos.row < 3) possibleMoves.push({ row: emptyPos.row + 1, col: emptyPos.col, direction: 'up' }) // Down
      if (emptyPos.col > 0) possibleMoves.push({ row: emptyPos.row, col: emptyPos.col - 1, direction: 'right' }) // Left
      if (emptyPos.col < 3) possibleMoves.push({ row: emptyPos.row, col: emptyPos.col + 1, direction: 'left' }) // Right
      
      // Filter out moves that would immediately reverse the last move
      const validMoves = possibleMoves.filter(move => {
        if (!lastMove) return true
        return !(
          (lastMove.direction === 'up' && move.direction === 'down') ||
          (lastMove.direction === 'down' && move.direction === 'up') ||
          (lastMove.direction === 'left' && move.direction === 'right') ||
          (lastMove.direction === 'right' && move.direction === 'left')
        )
      })
      
      // Pick a random valid move
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
      
      // Swap the tile with empty space
      const temp = currentBoard[randomMove.row][randomMove.col]
      currentBoard[randomMove.row][randomMove.col] = 0
      currentBoard[emptyPos.row][emptyPos.col] = temp
      
      // Update empty position and last move
      emptyPos = { row: randomMove.row, col: randomMove.col }
      lastMove = randomMove
    }
    
    return { board: currentBoard, emptyPos }
  }, [])

  // Shuffle puzzle
  const shufflePuzzle = useCallback(() => {
    // Delete saved state when shuffling
    deleteSavedGameState()
    
    // Generate a solvable configuration
    const { board: newBoard, emptyPos: newEmptyPos } = generateSolvableConfig()
    
    // Verify it's solvable (should always be true, but double-check)
    if (!isSolvable(newBoard)) {
      console.warn('Generated unsolvable configuration, regenerating...')
      const { board: retryBoard, emptyPos: retryEmptyPos } = generateSolvableConfig()
      setBoard(retryBoard)
      setEmptyPos(retryEmptyPos)
    } else {
      setBoard(newBoard)
      setEmptyPos(newEmptyPos)
    }
    
    setMoves(0)
    setTimer(0)
    setIsPlaying(true)
    setIsSolved(false)
    setMovingTile(null)
    setTilePositions({})
    setShowSolvedModal(false)
    setFinalMoves(0)
    setFinalTime(0)
  }, [deleteSavedGameState, generateSolvableConfig, isSolvable])

  // Save game stats
  const saveGameStats = useCallback(async (finalMoveCount, finalTimeSeconds) => {
    if (!isSupabaseAvailable() || !user) {
      console.log('Cannot save stats: Supabase not available or no user')
      return
    }
    
    setIsSavingStats(true)
    
    try {
      // Prepare the data according to the new schema
      const gameStatsData = {
        user_id: user.id,
        puzzle_type: puzzleType,
        time_taken_seconds: finalTimeSeconds,
        moves_count: finalMoveCount,
        background_image_id: puzzleType === 'bg' ? parseInt(imageId) : null
      }
      
      console.log('Saving game stats:', gameStatsData)
      
      const { data, error } = await supabase
        .from('game_stats')
        .insert(gameStatsData)
        .select()
      
      if (error) {
        console.error('Error saving game stats:', error)
        setStatsSaved(false)
      } else {
        console.log('Game stats saved successfully:', data)
        setStatsSaved(true)
      }
    } catch (error) {
      console.error('Error saving game stats:', error)
      setStatsSaved(false)
    } finally {
      setIsSavingStats(false)
    }
  }, [user, puzzleType, imageId])

  // Handle tile click with smooth movement
  const handleTileClick = useCallback((row, col) => {
    if (isSolved || !isPlaying || movingTile) return
    
    const clickedPos = { row, col }
    
    if (isAdjacent(clickedPos, emptyPos)) {
      // Play tile movement sound
      playTileSound()
      
      // Single tile move with smooth animation
      const tileValue = board[row][col]
      setMovingTile({ row, col, value: tileValue })
      
      // Calculate the slide direction and distance
      const direction = {
        row: emptyPos.row - row,
        col: emptyPos.col - col
      }
      
      // Update tile positions for smooth animation
      setTilePositions(prev => ({
        ...prev,
        [`${row}-${col}`]: {
          transform: `translate(${direction.col * 83}px, ${direction.row * 83}px)`,
          transition: 'transform 0.3s linear'
        }
      }))
      
      setTimeout(() => {
        const newBoard = [...board]
        newBoard[emptyPos.row][emptyPos.col] = newBoard[row][col]
        newBoard[row][col] = 0
        
        setBoard(newBoard)
        setEmptyPos(clickedPos)
        setMoves(prev => prev + 1)
        setMovingTile(null)
        setTilePositions({})
        
        // Check if solved
        if (isBoardSolved(newBoard)) {
          const finalMoveCount = moves + 1
          setFinalMoves(finalMoveCount)
          setFinalTime(timer)
          setIsSolved(true)
          setIsPlaying(false)
          saveGameStats()
          setShowSolvedModal(true)
        }
      }, 300)
    } else if (clickedPos.row === emptyPos.row || clickedPos.col === emptyPos.col) {
      // Play tile movement sound
      playTileSound()
      
      // Multi-tile slide with smooth animation
      const tileValue = board[row][col]
      setMovingTile({ row, col, value: tileValue })
      
      const isRowMove = clickedPos.row === emptyPos.row
      const direction = isRowMove 
        ? (clickedPos.col > emptyPos.col ? 1 : -1)
        : (clickedPos.row > emptyPos.row ? 1 : -1)
      
      // Calculate which tiles need to move
      const tilesToAnimate = []
      if (isRowMove) {
        // For row moves, animate tiles between empty space and clicked position
        const start = direction > 0 ? emptyPos.col + 1 : clickedPos.col
        const end = direction > 0 ? clickedPos.col : emptyPos.col - 1
        for (let c = start; c <= end; c++) {
          tilesToAnimate.push({ row: emptyPos.row, col: c })
        }
      } else {
        // For column moves, animate tiles between empty space and clicked position
        const start = direction > 0 ? emptyPos.row + 1 : clickedPos.row
        const end = direction > 0 ? clickedPos.row : emptyPos.row - 1
        for (let r = start; r <= end; r++) {
          tilesToAnimate.push({ row: r, col: emptyPos.col })
        }
      }
      
      // Set positions for smooth sliding animation
      const newPositions = {}
      tilesToAnimate.forEach((pos, index) => {
        const delay = index * 50 // Staggered animation
        newPositions[`${pos.row}-${pos.col}`] = {
          transform: isRowMove 
            ? `translateX(${-direction * 83}px)` // Tiles slide towards empty space
            : `translateY(${-direction * 83}px)`,
          transition: `transform 0.3s linear ${delay}ms`
        }
      })
      
      setTilePositions(newPositions)
      
      setTimeout(() => {
        const newBoard = [...board]
        
        if (isRowMove) {
          // Slide tiles towards empty space
          if (direction > 0) {
            // Moving right: tiles slide left towards empty space
            for (let c = emptyPos.col; c < clickedPos.col; c++) {
              newBoard[emptyPos.row][c] = newBoard[emptyPos.row][c + 1]
            }
          } else {
            // Moving left: tiles slide right towards empty space
            for (let c = emptyPos.col; c > clickedPos.col; c--) {
              newBoard[emptyPos.row][c] = newBoard[emptyPos.row][c - 1]
            }
          }
          newBoard[emptyPos.row][clickedPos.col] = 0
          setEmptyPos({ row: emptyPos.row, col: clickedPos.col })
        } else {
          // Slide tiles towards empty space
          if (direction > 0) {
            // Moving down: tiles slide up towards empty space
            for (let r = emptyPos.row; r < clickedPos.row; r++) {
              newBoard[r][emptyPos.col] = newBoard[r + 1][emptyPos.col]
            }
          } else {
            // Moving up: tiles slide down towards empty space
            for (let r = emptyPos.row; r > clickedPos.row; r--) {
              newBoard[r][emptyPos.col] = newBoard[r - 1][emptyPos.col]
            }
          }
          newBoard[clickedPos.row][emptyPos.col] = 0
          setEmptyPos({ row: clickedPos.row, col: emptyPos.col })
        }
        
        setBoard(newBoard)
        setMoves(prev => prev + 1)
        setMovingTile(null)
        setTilePositions({})
        
        // Check if solved
        if (isBoardSolved(newBoard)) {
          const finalMoveCount = moves + 1
          setFinalMoves(finalMoveCount)
          setFinalTime(timer)
          setIsSolved(true)
          setIsPlaying(false)
          saveGameStats(finalMoveCount, timer)
          setShowSolvedModal(true)
        }
      }, 300 + (tilesToAnimate.length * 50))
    }
  }, [board, emptyPos, isSolved, isPlaying, isAdjacent, isBoardSolved, movingTile, saveGameStats, playTileSound])

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get puzzle title based on type
  const getPuzzleTitle = () => {
    const titles = {
      numbers: 'Number 15 Puzzle',
      penguin: 'Penguin Jigsaw Puzzle',
      cow: 'Cow Jigsaw Puzzle',
      duck: 'Duck Jigsaw Puzzle'
    }
    return titles[puzzleType] || 'Fifteen Puzzle'
  }

  return (
    <div className="puzzle-container">
      <div className="welcome-section">
        <div className="welcome-text">
          Welcome, {user?.email}
          {!isSupabaseAvailable() && <span> (Demo Mode)</span>}
        </div>
        <div className="puzzle-title">{puzzleTitle}</div>
        <button 
          className="back-to-home-btn"
          onClick={() => {
            if (hasUnsavedChanges) {
              setShowSaveModal(true)
            } else {
              navigate('/')
            }
          }}
        >
          Back to Home
        </button>
      </div>
      
      <div className="game-info-section">
        <div className="game-stats">
          <div className="timer">Time: {formatTime(timer)}</div>
          <div className="moves">Moves: {moves}</div>
          {hasSavedState && (
            <div className="saved-state-indicator">
              Resumed Game
            </div>
          )}
        </div>
        <button className="shuffle-btn" onClick={shufflePuzzle}>
          Shuffle
        </button>
      </div>
      
      <div className="puzzle-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="puzzle-row">
            {row.map((tile, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`puzzle-tile ${tile === 0 ? 'empty' : ''}`}
                onClick={() => tile !== 0 && handleTileClick(rowIndex, colIndex)}
                style={{
                  ...tilePositions[`${rowIndex}-${colIndex}`],
                  ...(backgroundImage && tile !== 0 && {
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: '400px 400px',
                    backgroundPosition: `-${((tile - 1) % 4) * 100}px -${Math.floor((tile - 1) / 4) * 100}px`
                  })
                }}
              >
                {tile !== 0 && !backgroundImage && (
                  <span className="tile-number">{tile}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <SolvedModal 
        isOpen={showSolvedModal}
        onClose={() => {
          setShowSolvedModal(false)
          navigate('/')
        }}
        moves={finalMoves}
        time={formatTime(finalTime)}
        isSavingStats={isSavingStats}
        statsSaved={statsSaved}
      />

      <SaveConfirmModal 
        isOpen={showSaveModal}
        onSave={handleSaveAndNavigate}
        onDiscard={handleDiscardAndNavigate}
        onCancel={handleCancelNavigation}
      />
    </div>
  )
}

export default Puzzle 