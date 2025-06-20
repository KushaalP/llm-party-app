import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSocket } from '../hooks/useSocket'
import Lobby from './Lobby'
import Preferences from './Preferences'
import Recommendations from './Recommendations'
import { Film } from 'lucide-react'

const API_BASE = '/api'

export default function Room() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const socket = useSocket()
  
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('lobby') // lobby, preferences, generating, results
  const [participantId] = useState(localStorage.getItem('participantId'))
  const [isHost] = useState(localStorage.getItem('isHost') === 'true')

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

    socket.on('room-update', (updatedRoom) => {
      setRoom(updatedRoom)
    })

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

    return () => {
      socket.off('room-update')
      socket.off('participant-joined')
      socket.off('participant-kicked')
      socket.off('generating-recommendations')
      socket.off('recommendations-ready')
      socket.off('recommendations-error')
      socket.off('preferences-started')
      socket.off('generation-cancelled')
    }
  }, [socket, roomCode, participantId, navigate])

  // Sync phase with room state
  useEffect(() => {
    if (room) {
      if (room.recommendations) {
        setPhase('results')
      } else if (room.locked) {
        setPhase('generating')
      } else if (room.preferencesStarted) {
        setPhase('preferences')
      } else {
        setPhase('lobby')
      }
    }
  }, [room])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Film className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
      </div>
    )
  }

  const currentParticipant = room?.participants.find(p => p.id === participantId)

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Room <span className="gradient-text">{roomCode}</span>
          </h1>
          <p className="text-white/70 text-lg font-medium">
            {phase === 'lobby' && 'Waiting for everyone to join'}
            {phase === 'preferences' && 'Share your movie preferences'}
            {phase === 'generating' && 'AI is finding perfect movies for your group...'}
            {phase === 'results' && 'Here are your personalized recommendations!'}
          </p>
        </div>

        {phase === 'lobby' && (
          <Lobby
            room={room}
            isHost={isHost}
            onStartPreferences={startPreferences}
            onKickParticipant={handleKickParticipant}
          />
        )}

        {phase === 'preferences' && (
          <Preferences
            room={room}
            currentParticipant={currentParticipant}
            onSubmitPreferences={handlePreferencesSubmit}
            onSetReady={handleSetReady}
            isHost={isHost}
          />
        )}

        {phase === 'generating' && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Film className="w-20 h-20 animate-spin text-green-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-2">Generating Recommendations</h2>
              <p className="text-gray-400">Our AI is analyzing everyone's preferences...</p>
            </div>
          </div>
        )}

        {phase === 'results' && room?.recommendations && (
          <Recommendations
            recommendations={room.recommendations}
            isHost={isHost}
            onRegenerate={handleRegenerateRecommendations}
            canRegenerate={room.regenerateCount < 2}
            onReroll={handleRerollMovie}
            rerollCounts={room.rerollCounts}
          />
        )}
      </div>
    </div>
  )
}