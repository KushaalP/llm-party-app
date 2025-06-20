import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Film } from 'lucide-react'

const API_BASE = '/api'

export default function Home() {
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')
  const [error, setError] = useState('')
  const [createName, setCreateName] = useState('')
  const navigate = useNavigate()

  const handleCreateRoom = async () => {
    setIsCreating(true)
    setError('')
    
    try {
      const response = await axios.post(`${API_BASE}/create-room`, { name: createName.trim() || 'Host' })
      const { roomCode, hostId } = response.data
      
      localStorage.setItem('participantId', hostId)
      localStorage.setItem('participantName', createName.trim())
      localStorage.setItem('isHost', 'true')
      navigate(`/room/${roomCode}`)
    } catch {
      setError('Failed to create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async (e) => {
    e.preventDefault()
    if (!joinCode.trim() || !joinName.trim()) return
    
    setIsJoining(true)
    setError('')
    
    try {
      const response = await axios.post(`${API_BASE}/join-room`, {
        roomCode: joinCode.toUpperCase(),
        name: joinName.trim()
      })
      
      const { participantId } = response.data
      localStorage.setItem('participantId', participantId)
      localStorage.setItem('isHost', 'false')
      navigate(`/room/${joinCode.toUpperCase()}`)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to join room. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 title-bounce">
            Movie<span className="gradient-text">Party</span>
          </h1>
          <p className="text-gray-400 text-lg">
            AI-powered movie recommendations for your group
          </p>
        </div>

        {/* Main Card */}
        <div className="card space-y-6">
          {/* Create Form */}
          <input
            type="text"
            placeholder="Your name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            maxLength={20}
            className="input text-center"
          />
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !createName.trim()}
            className="btn btn-primary w-full"
          >
            {isCreating ? (
              <>
                <Film className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create New Party'
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="text-gray-400 text-sm font-semibold tracking-wider uppercase">OR</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <input
              type="text"
              placeholder="Party code (e.g. ABC123)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="input text-center font-mono tracking-wider"
            />
            <input
              type="text"
              placeholder="Your name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              maxLength={20}
              className="input text-center"
            />
            <button
              type="submit"
              disabled={isJoining || !joinCode.trim() || !joinName.trim()}
              className="btn btn-secondary w-full"
            >
              {isJoining ? (
                <>
                  <Film className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Party'
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-300 text-center text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            ✨ AI recommendations • 🎬 Group preferences • 🚀 Real-time sync
          </p>
        </div>
      </div>
    </div>
  )
}