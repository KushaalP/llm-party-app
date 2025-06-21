import { useState, useEffect } from 'react'
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
  const [liveCount, setLiveCount] = useState(127)
  const line1 = "45 minutes browsing. 5 people arguing. 0 movies watched."
  const line2Full = "Let's fix that in 2 minutes."
  const [typedLine2, setTypedLine2] = useState('')

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

  // --- Effects for UI animations ---
  useEffect(() => {
    // Typing effect for second tagline line
    const startDelay = 1500 // ms
    const typingSpeed = 50 // ms per char
    let timeoutId = setTimeout(() => {
      let index = 0
      const intervalId = setInterval(() => {
        setTypedLine2(line2Full.slice(0, index + 1))
        index++
        if (index === line2Full.length) {
          clearInterval(intervalId)
        }
      }, typingSpeed)
    }, startDelay)
    return () => clearTimeout(timeoutId)
  }, [])

  // Live parties counter pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Live counter top-left */}
      <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 10 }} className="flex items-center gap-2 text-sm">
        <span className="animate-pulse text-green-400">●</span>
        <span className="text-gray-400"><span className="text-white font-semibold">{liveCount}</span> parties deciding right now</span>
      </div>

      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="logo-title text-7xl font-extrabold mb-4 title-bounce">
            Movie<span className="gradient-text">Party</span>
          </h1>

          {/* Enhanced Tagline */}
          <div className="space-y-1" style={{ minHeight: '48px' }}>
            <p className="text-gray-400 text-sm md:text-base">
              {line1}
            </p>
            <p className="text-white text-lg md:text-xl">
              {typedLine2}
            </p>
          </div>

          {/* Spacer after tagline */}
          <div className="mt-6" />
        </div>

        {/* Main Card */}
        <div className="card space-y-6 p-10 mt-8">
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