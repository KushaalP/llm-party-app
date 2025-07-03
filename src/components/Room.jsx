import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../hooks/useSocket'
import Lobby from './Lobby'
import Preferences from './Preferences'
import Recommendations from './Recommendations'
import WaitingScreen from './WaitingScreen'
import SwipeResults from './SwipeResults'
import { Film, LogOut } from 'lucide-react'
import { pageVariants, phaseVariants } from '../utils/animationVariants'

const API_BASE = '/api'

export default function Room() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const socket = useSocket()
  
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('lobby') // lobby, preferences, waiting, generating, results, swipe-results
  const [participantId] = useState(localStorage.getItem('participantId'))
  const [isHost] = useState(localStorage.getItem('isHost') === 'true')
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (!participantId) {
      navigate('/')
      return
    }

    const fetchRoom = async () => {
      try {
        const response = await axios.get(`${API_BASE}/room/${roomCode}`)
        setRoom(response.data)
        
        if (response.data.recommendations) {
          setPhase('results')
        } else if (response.data.locked) {
          setPhase('generating')
        } else if (response.data.preferencesStarted) {
          setPhase('preferences')
        }
        
        setLoading(false)
      } catch (error) {
        setError(error.response?.data?.error || 'Room not found')
        setLoading(false)
      }
    }

    fetchRoom()
  }, [roomCode, participantId, navigate])

  useEffect(() => {
    if (!socket) return

    socket.emit('join-room', roomCode)

    const handleRoomUpdate = (updatedRoom) => {
      setRoom(updatedRoom)
      
      // Check if all participants are ready and we're in preferences phase
      // Use a callback to get the current phase value
      setPhase(currentPhase => {
        if (currentPhase === 'preferences' && updatedRoom.participants.every(p => p.isReady)) {
          return 'waiting'
        }
        return currentPhase
      })
    }

    socket.on('room-update', handleRoomUpdate)

    socket.on('participant-joined', (participant) => {
      setRoom(prev => ({
        ...prev,
        participants: [...prev.participants, participant]
      }))
    })

    socket.on('participant-kicked', (kickedParticipantId) => {
      if (kickedParticipantId === participantId) {
        navigate('/')
      }
    })

    socket.on('generating-recommendations', () => {
      console.log('Received generating-recommendations event')
      setPhase('generating')
    })

    socket.on('recommendations-ready', (recommendations) => {
      setRoom(prev => ({ ...prev, recommendations }))
      setPhase('results')
    })

    socket.on('recommendations-error', (error) => {
      setError(error)
      setPhase('preferences')
    })

    socket.on('preferences-started', () => {
      setPhase('preferences')
    })

    socket.on('generation-cancelled', () => {
      setPhase('preferences')
    })

    socket.on('room-closed', () => {
      navigate('/')
    })

    socket.on('participant-left', ({ participantId: leftParticipantId, name }) => {
      console.log(`Participant ${name} (${leftParticipantId}) left the room`)
      // The room-update event will handle the actual state update
    })

    socket.on('room-not-found', () => {
      console.log('Room not found, redirecting to home')
      setError('Room no longer exists')
      setTimeout(() => navigate('/'), 2000)
    })

    socket.on('participant-not-found', () => {
      console.log('Participant not found in room, redirecting to home')
      localStorage.removeItem('participantId')
      localStorage.removeItem('isHost')
      setError('You are no longer part of this room')
      setTimeout(() => navigate('/'), 2000)
    })

    socket.on('all-swipes-complete', () => {
      console.log('All participants have completed swipes')
      setPhase('swipe-results')
    })

    return () => {
      socket.off('room-update', handleRoomUpdate)
      socket.off('participant-joined')
      socket.off('participant-kicked')
      socket.off('generating-recommendations')
      socket.off('recommendations-ready')
      socket.off('recommendations-error')
      socket.off('preferences-started')
      socket.off('generation-cancelled')
      socket.off('room-closed')
      socket.off('participant-left')
      socket.off('room-not-found')
      socket.off('participant-not-found')
      socket.off('all-swipes-complete')
    }
  }, [socket, roomCode, participantId, navigate])

  // Sync phase with room state
  useEffect(() => {
    if (room) {
      let newPhase = phase
      
      // Priority order: swipe-results > results > generating > waiting > preferences > lobby
      if (room.allSwipesComplete) {
        newPhase = 'swipe-results'
      } else if (room.recommendations) {
        newPhase = 'results'
      } else if (room.locked) {
        newPhase = 'generating'
      } else if (room.preferencesStarted) {
        const currentParticipant = room.participants?.find(p => p.id === participantId)
        if (currentParticipant?.isReady) {
          // User is ready, show waiting screen (unless already generating/results)
          if (phase !== 'generating' && phase !== 'results') {
            newPhase = 'waiting'
          }
        } else {
          // User not ready, show preferences
          newPhase = 'preferences'
        }
      } else {
        newPhase = 'lobby'
      }
      
      if (newPhase !== phase) {
        console.log(`Phase transition: ${phase} -> ${newPhase}`, {
          hasRecommendations: !!room.recommendations,
          isLocked: room.locked,
          preferencesStarted: room.preferencesStarted,
          userReady: room.participants?.find(p => p.id === participantId)?.isReady,
          currentPhase: phase,
          newPhase
        })
        setIsTransitioning(true)
        setPhase(newPhase)
        // Reset transitioning state after animation completes
        setTimeout(() => setIsTransitioning(false), 300)
      }
    }
  }, [room, participantId, phase])

  const startPreferences = () => {
    // Notify all participants to start preferences phase
    if (socket && isHost) {
      socket.emit('start-preferences', { roomCode, hostId: participantId })
    }
  }

  const handlePreferencesSubmit = (preferences) => {
    if (socket) {
      socket.emit('update-preferences', {
        roomCode,
        participantId,
        preferences
      })
    }
  }

  const handleSetReady = (isReady) => {
    if (socket) {
      socket.emit('set-ready', {
        roomCode,
        participantId,
        isReady
      })
    }
    
    // Let the room-update event handle phase transitions
    // No manual phase setting needed here
  }

  const handleBackToPreferences = () => {
    setPhase('preferences')
    // Emit socket event to unset ready state
    if (socket) {
      socket.emit('set-ready', {
        roomCode,
        participantId,
        isReady: false
      })
    }
  }

  const handleKickParticipant = (participantToKick) => {
    if (socket && isHost) {
      socket.emit('kick-participant', {
        roomCode,
        hostId: participantId,
        participantId: participantToKick
      })
    }
  }

  const handleRegenerateRecommendations = () => {
    if (socket && isHost) {
      socket.emit('regenerate-recommendations', {
        roomCode,
        hostId: participantId
      })
    }
  }

  // FIRST_EDIT: per-movie reroll
  const handleRerollMovie = (movieIndex) => {
    if (socket && isHost) {
      socket.emit('reroll-movie', {
        roomCode,
        hostId: participantId,
        movieIndex
      })
    }
  }

  const handleLeaveRoom = () => {
    const msg = isHost
      ? 'As the host, leaving will close the room for all participants. Are you sure you want to continue?'
      : 'Are you sure you want to leave this room?'
    if (!window.confirm(msg)) return
    if (socket) {
      socket.emit('leave-room', { roomCode, participantId })
    }
    localStorage.removeItem('participantId')
    localStorage.removeItem('isHost')
    navigate('/')
  }

  if (loading && !room) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gray-900"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="text-center">
          <Film className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading room...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gray-900"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="text-center">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-4">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    )
  }

  const currentParticipant = room?.participants.find(p => p.id === participantId)

  return (
    <motion.div 
      className="min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AnimatePresence mode="wait">
        {/* Waiting/Generating phases - full screen */}
        {(phase === 'waiting' || phase === 'generating') && (
          <motion.div
            key="waiting"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <WaitingScreen
              room={room}
              isGenerating={phase === 'generating'}
              onBackToPreferences={handleBackToPreferences}
            />
          </motion.div>
        )}

        {/* Lobby phase */}
        {phase === 'lobby' && (
          <motion.div 
            key="lobby"
            className="p-4 py-8"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="container mx-auto">
              <div className="text-center mb-8 relative">
                <button
                  onClick={handleLeaveRoom}
                  className="absolute top-0 right-0 btn btn-secondary flex items-center gap-2 px-4 py-2 mb-4"
                >
                  <LogOut className="w-4 h-4 " />
                  Leave Room
                </button>
                
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  Room <span className="gradient-text">{roomCode}</span>
                </h1>
                <p className="text-white/70 text-lg font-medium">
                  Waiting for everyone to join
                </p>
              </div>

              <Lobby
                room={room}
                isHost={isHost}
                onStartPreferences={startPreferences}
                onKickParticipant={handleKickParticipant}
              />
            </div>
          </motion.div>
        )}

        {/* Preferences phase */}
        {phase === 'preferences' && (
          <motion.div 
            key="preferences"
            className="p-4 py-8"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="container mx-auto">
              <div className="text-center mb-8 relative">
                <button
                  onClick={handleLeaveRoom}
                  className="absolute top-0 right-0 btn btn-secondary flex items-center gap-2 px-4 py-2 mb-4"
                >
                  <LogOut className="w-4 h-4 " />
                  Leave Room
                </button>
                
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  Room <span className="gradient-text">{roomCode}</span>
                </h1>
                <p className="text-white/70 text-lg font-medium">
                  Share your movie preferences
                </p>
              </div>

              <Preferences
                room={room}
                currentParticipant={currentParticipant}
                onSubmitPreferences={handlePreferencesSubmit}
                onSetReady={handleSetReady}
                isHost={isHost}
                onKickParticipant={handleKickParticipant}
              />
            </div>
          </motion.div>
        )}

        {/* Results phase */}
        {phase === 'results' && room?.recommendations && (
          <motion.div 
            key="results"
            className="p-4 py-8"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="container mx-auto">
              <div className="text-center mb-8 relative">
                <button
                  onClick={handleLeaveRoom}
                  className="absolute top-0 right-0 btn btn-secondary flex items-center gap-2 px-4 py-2 mb-4"
                >
                  <LogOut className="w-4 h-4 " />
                  Leave Room
                </button>
              </div>

              <Recommendations
                recommendations={room.recommendations}
                room={room}
                participantId={participantId}
                socket={socket}
                isHost={isHost}
                onRegenerate={handleRegenerateRecommendations}
                canRegenerate={room.regenerateCount < 2}
                onReroll={handleRerollMovie}
                rerollCounts={room.rerollCounts}
              />
            </div>
          </motion.div>
        )}

        {/* Swipe Results phase */}
        {phase === 'swipe-results' && room?.recommendations && (
          <motion.div 
            key="swipe-results"
            className="p-4 py-8"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="container mx-auto">
              <div className="text-center mb-8 relative">
                <button
                  onClick={handleLeaveRoom}
                  className="absolute top-0 right-0 btn btn-secondary flex items-center gap-2 px-4 py-2 mb-4"
                >
                  <LogOut className="w-4 h-4 " />
                  Leave Room
                </button>
              </div>

              <SwipeResults
                room={room}
                recommendations={room.recommendations}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}