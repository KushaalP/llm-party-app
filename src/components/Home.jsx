import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Film } from 'lucide-react'
import { moviePosters } from '../data/moviePosters'

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
  const [carouselPaused, setCarouselPaused] = useState(false)
  const [scrollTimeout, setScrollTimeout] = useState(null)

  const handleScrollEnd = () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    const timeout = setTimeout(() => {
      setCarouselPaused(false)
    }, 2000)
    setScrollTimeout(timeout)
  }

  const handleCarouselInteraction = () => {
    setCarouselPaused(true)
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
  }

  const handleCreateRoom = async () => {
    setIsCreating(true)
    setError('')
    
    try {
      const response = await axios.post(`${API_BASE}/create-room`, { name: createName.trim() || 'Host' })
      const { roomCode, hostId } = response.data
      
      localStorage.setItem('participantId', hostId)
      localStorage.setItem('participantName', createName.trim())
      localStorage.setItem('isHost', 'true')
      localStorage.setItem('roomCode', roomCode)
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
      localStorage.setItem('participantName', joinName.trim())
      localStorage.setItem('isHost', 'false')
      localStorage.setItem('roomCode', joinCode.toUpperCase())
      navigate(`/room/${joinCode.toUpperCase()}`)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to join room. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  // Typing effect for tagline
  useEffect(() => {
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

  // Redirect to existing room if participant data is present
  useEffect(() => {
    const storedRoomCode = localStorage.getItem('roomCode')
    const storedParticipantId = localStorage.getItem('participantId')
    if (storedRoomCode && storedParticipantId) {
      navigate(`/room/${storedRoomCode}`)
    }
  }, [navigate])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* iOS-style Header */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0,
        right: 0,
        zIndex: 50, 
        background: 'rgba(10, 10, 10, 0.95)', 
        backdropFilter: 'blur(16px)', 
        borderBottom: '1px solid #282828', 
        padding: '16px 24px' 
      }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Movie<span className="gradient-text">Party</span>
          </h1>
          
          {/* Live counter */}
          <div className="flex items-center gap-2 text-sm">
            <span className="10e-pulse text-green-400">●</span>
            <span className="text-gray-400">
              <span className="text-white font-semibold">{liveCount}</span> live
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ paddingTop: '120px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div className="max-w-md mx-auto">
          {/* Main Card */}
          <div className="card space-y-4">
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
              className="btn btn-primary w-full text-lg"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: '1', borderTop: '1px solid #404040' }}></div>
              <span style={{
                background: 'rgba(64, 64, 64, 0.5)',
                color: '#9ca3af',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.05em'
              }}>OR</span>
              <div style={{ flex: '1', borderTop: '1px solid #404040' }}></div>
            </div>

            {/* Join Form */}
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
              onClick={(e) => {
                e.preventDefault()
                handleJoinRoom(e)
              }}
              disabled={isJoining || !joinCode.trim() || !joinName.trim()}
              className="btn btn-secondary w-full text-lg"
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

            {/* Error */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-300 text-center text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Desktop Tagline - Hidden on mobile */}
          <div className="hidden md:block text-center mt-10">
            <div className="space-y-1" style={{ minHeight: '48px' }}>
              <p className="text-gray-400 text-sm md:text-base mt-4">
                {line1}
              </p>
              <p className="text-white text-lg md:text-xl">
                {typedLine2}
              </p>
            </div>
          </div>
        </div>
        
        {/* Movie Poster Carousel - Mobile only */}
        <div className="block md:hidden" style={{ marginTop: '2rem' }}>
          <div 
            style={{ 
              overflow: carouselPaused ? 'auto' : 'hidden', 
              position: 'relative', 
              height: '240px',
              cursor: carouselPaused ? 'grab' : 'default'
            }}
            onTouchStart={handleCarouselInteraction}
            onMouseDown={handleCarouselInteraction}
            onScroll={handleScrollEnd}
            onTouchEnd={handleScrollEnd}
          >
            <div style={{
              display: 'flex',
              animation: carouselPaused ? 'none' : 'scroll-left 12s linear infinite',
              gap: '12px',
              height: '100%',
              width: '200%'
            }}>
              {/* Duplicate the array twice for seamless loop */}
              {[...moviePosters, ...moviePosters].map((movie, index) => (
                <div
                  key={`${movie.title}-${index}`}
                  style={{
                    minWidth: '140px',
                    height: '210px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    transform: 'scale(0.95)',
                    transition: 'transform 0.3s ease',
                    filter: 'brightness(0.8) saturate(0.9)',
                    userSelect: 'none',
                    pointerEvents: carouselPaused ? 'auto' : 'none'
                  }}
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      userSelect: 'none'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/140x210/333333/666666?text=Movie'
                    }}
                    draggable={!carouselPaused}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Tagline - Below carousel, hidden initially */}
          <div className="text-center mt-16 mb-8">
            <div className="space-y-1" style={{ minHeight: '48px' }}>
              <p className="text-gray-400 text-sm">
                {line1}
              </p>
              <p className="text-white text-lg">
                {typedLine2}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}