import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Film } from 'lucide-react'
import MobilePosterCarousel from './homeComponents/MobilePosterCarousel'
import HomeCard from './homeComponents/HomeCard'
import SwipeDeck from './homeComponents/SwipeDeck'

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
          <HomeCard
            createName={createName}
            setCreateName={setCreateName}
            isCreating={isCreating}
            handleCreateRoom={handleCreateRoom}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            joinName={joinName}
            setJoinName={setJoinName}
            isJoining={isJoining}
            handleJoinRoom={handleJoinRoom}
            error={error}
          />

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

          {/* Swipe Deck */}
          <div className="mt-6 mb-4">
            <SwipeDeck />
          </div>
        </div>
      </div>
    </div>
  )
}