import React, { useState, useEffect, useRef } from 'react'
import { Heart, X, Info } from 'lucide-react'
import RecommendationCard from './recommendationsComponents/RecommendationCard'
import WaitingScreen from './WaitingScreen'
import './recommendationsComponents/Recommendations.css'
import PropTypes from 'prop-types'

export default function Recommendations({
  recommendations,
  room,
  participantId,
  socket,
}) {
  const [loadingIndex, setLoadingIndex] = useState(null)
  // Track which mobile cards are expanded
  const [expandedMobile, setExpandedMobile] = useState(new Set())
  
  // Swipe deck state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false })
  const [isAnimating, setIsAnimating] = useState(false)
  const [swipesComplete, setSwipesComplete] = useState(false)
  const startPoint = useRef({ x: 0, y: 0 })
  const frameRef = useRef(null)
  const pendingDragRef = useRef(drag)
  const prevRecommendationsLength = useRef(0)
  
  // Velocity tracking
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastMoveTime = useRef(Date.now())
  const lastPosition = useRef({ x: 0, y: 0 })
  const smoothDragRef = useRef({ x: 0, y: 0 })

  // reset loading state when recommendations meaningfully change
  useEffect(() => {
    // Only reset if recommendations length changes or it's a completely different set
    // This prevents resetting when the array reference changes but content is the same
    if (!recommendations) return
    
    setLoadingIndex(null)
    setExpandedMobile(new Set())
    
    // Don't reset currentIndex or swipesComplete if we're in the middle of swiping
    // Only reset if the recommendations array length has changed
    if (prevRecommendationsLength.current !== recommendations.length) {
      setCurrentIndex(0)
      setSwipesComplete(false)
      prevRecommendationsLength.current = recommendations.length
    }
  }, [recommendations?.length])

  // Sync swipesComplete with room data
  useEffect(() => {
    if (participantId && room?.participants) {
      const participant = room.participants.find(p => p.id === participantId)
      if (participant?.swipesCompleted) {
        setSwipesComplete(true)
        // Set index to end if already completed
        setCurrentIndex(recommendations?.length || 0)
      }
    }
  }, [room, participantId, recommendations])

  const formatRating = (value) => {
    if (value === undefined || value === null) return 'N/A'
    const num = Number(value)
    if (Number.isNaN(num)) return 'N/A'
    return `${num.toFixed(1)}/10`
  }

  // Toggle details visibility for a given card on mobile
  const toggleMobileExpansion = (index) => {
    setExpandedMobile(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // Swipe handlers with enhanced physics
  const handlePointerDown = (e) => {
    if (isAnimating) return
    e.target.setPointerCapture(e.pointerId)
    
    // Get card position for tilt calculation
    const rect = e.currentTarget.getBoundingClientRect()
    const touchY = e.clientY - rect.top
    const cardHeight = rect.height
    
    startPoint.current = { 
      x: e.clientX, 
      y: e.clientY,
      touchOffset: (touchY / cardHeight) - 0.5 // -0.5 to 0.5, negative = top, positive = bottom
    }
    lastPosition.current = { x: e.clientX, y: e.clientY }
    lastMoveTime.current = Date.now()
    velocityRef.current = { x: 0, y: 0 }
    smoothDragRef.current = { x: 0, y: 0 }
    setDrag({ x: 0, y: 0, isDragging: true })
  }

  const handlePointerMove = (e) => {
    if (!drag.isDragging) return
    
    const currentTime = Date.now()
    const deltaTime = Math.max(1, currentTime - lastMoveTime.current)
    
    // Calculate raw position
    const dx = e.clientX - startPoint.current.x
    const dy = e.clientY - startPoint.current.y
    
    // Calculate velocity
    const vx = (e.clientX - lastPosition.current.x) / deltaTime * 100
    const vy = (e.clientY - lastPosition.current.y) / deltaTime * 100
    
    // Apply exponential smoothing to velocity (0.3 = smoothing factor)
    velocityRef.current.x = velocityRef.current.x * 0.7 + vx * 0.3
    velocityRef.current.y = velocityRef.current.y * 0.7 + vy * 0.3
    
    // Apply smooth easing to drag position (spring-like feel)
    const springFactor = 0.85
    smoothDragRef.current.x = smoothDragRef.current.x * springFactor + dx * (1 - springFactor)
    smoothDragRef.current.y = smoothDragRef.current.y * springFactor + dy * (1 - springFactor)
    
    // Add slight vertical drift based on horizontal movement (natural arc)
    const verticalDrift = Math.abs(smoothDragRef.current.x) * 0.05
    
    // Store the latest drag values with smoothing
    pendingDragRef.current = { 
      x: smoothDragRef.current.x, 
      y: smoothDragRef.current.y + verticalDrift, 
      isDragging: true 
    }
    
    // Update tracking references
    lastPosition.current = { x: e.clientX, y: e.clientY }
    lastMoveTime.current = currentTime

    // Only schedule a state update if we don't already have one queued
    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(() => {
        setDrag(pendingDragRef.current)
        frameRef.current = null
      })
    }
  }

  const handlePointerUp = (e) => {
    if (!drag.isDragging || isAnimating) return
    
    const { x, y } = drag
    const velocityX = Math.abs(velocityRef.current.x)
    
    // Dynamic threshold based on velocity (lower threshold for faster swipes)
    const baseThreshold = 120
    const velocityThreshold = Math.max(50, baseThreshold - velocityX * 0.5)
    
    // Consider both position and velocity for swipe detection
    const hasSwiped = Math.abs(x) > velocityThreshold || velocityX > 150
    
    if (hasSwiped && currentIndex <= recommendations.length - 1) {
      // Prevent further actions while animating
      setIsAnimating(true)
      
      // Calculate exit trajectory based on velocity and position
      const direction = x > 0 ? 1 : -1
      const exitVelocity = Math.max(Math.abs(velocityRef.current.x), 200)
      const exitDistance = window.innerWidth * 1.5
      const exitY = y + (velocityRef.current.y * 0.3) // Natural arc based on velocity
      
      setDrag({ 
        x: direction * exitDistance, 
        y: exitY, 
        isDragging: false 
      })

      // Emit like event if swiped right
      if (direction > 0 && socket) {
        socket.emit('movie-liked', {
          roomCode: room.code,
          participantId,
          movieIndex: currentIndex
        })
      }

      // Calculate animation duration based on exit velocity
      const animationDuration = Math.min(600, Math.max(300, 1000 / (exitVelocity * 0.01)))
      
      // remove the card after the animation finishes
      setTimeout(() => {
        const nextIndex = Math.min(currentIndex + 1, recommendations.length - 1)
        setCurrentIndex(nextIndex)
        setDrag({ x: 0, y: 0, isDragging: false })
        setIsAnimating(false)
        
        // Reset smooth drag values
        smoothDragRef.current = { x: 0, y: 0 }
        velocityRef.current = { x: 0, y: 0 }

        // Check if completed all swipes
        if (currentIndex === recommendations.length - 1 && socket) {
          setSwipesComplete(true)
          socket.emit('swipes-completed', {
            roomCode: room.code,
            participantId
          })
        }
      }, animationDuration)
    } else {
      // Smooth spring-back animation
      setDrag({ x: 0, y: 0, isDragging: false })
      // Reset tracking values after snap back
      setTimeout(() => {
        smoothDragRef.current = { x: 0, y: 0 }
        velocityRef.current = { x: 0, y: 0 }
      }, 400)
    }

    try {
      e.target.releasePointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }

    // cancel any pending frame
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }

  const handleButtonAction = (action) => {
    if (currentIndex >= recommendations.length || isAnimating) return
    
    // Prevent further actions while animating
    setIsAnimating(true)
    
    // Animate card based on action
    const direction = action === 'like' ? 1 : -1
    setDrag({ x: direction * window.innerWidth * 1.5, y: 0, isDragging: false })
    
    // Emit like event if liked
    if (action === 'like' && socket) {
      socket.emit('movie-liked', {
        roomCode: room.code,
        participantId,
        movieIndex: currentIndex
      })
    }
    
    // Move to next card after animation
    setTimeout(() => {
      const nextIndex = Math.min(currentIndex + 1, recommendations.length - 1)
      setCurrentIndex(nextIndex)
      setDrag({ x: 0, y: 0, isDragging: false })
      setIsAnimating(false)

      // Check if completed all swipes
      if (currentIndex === recommendations.length - 1 && socket) {
        setSwipesComplete(true)
        socket.emit('swipes-completed', {
          roomCode: room.code,
          participantId
        })
      }
    }, 400)
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No recommendations available.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {!swipesComplete ? (
        /* Swipe Deck Container */
        <div className="swipe-deck-container">
        {/* Progress indicator */}
        <div className="swipe-progress">
          <span className="progress-text">
            {Math.min(currentIndex + 1, recommendations.length)} of {recommendations.length}
          </span>
          <div className="progress-dots">
            {recommendations.map((_, idx) => (
              <div 
                key={idx} 
                className={`progress-dot ${idx === currentIndex ? 'active' : ''} ${idx < currentIndex ? 'completed' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Swipe hint - only show on first card */}
        {currentIndex === 0 && (
          <p className="swipe-hint">Swipe to see your recommendations →</p>
        )}

        <div className="swipe-deck">
          {recommendations.slice(currentIndex).map((movie, i) => {
            const index = currentIndex + i
            const isTop = i === 0
            const translate = isTop ? `translate(${drag.x}px, ${drag.y}px)` : `translate(0px, ${-i * 8}px)`
            
            // More natural rotation with slight dampening and touch offset influence
            const rotationDampening = 15
            const maxRotation = 20
            const baseRotation = drag.x / rotationDampening
            const touchInfluence = startPoint.current?.touchOffset || 0
            const rotation = isTop ? Math.max(-maxRotation, Math.min(maxRotation, baseRotation + (touchInfluence * 5))) : 0
            const rotate = `rotate(${rotation}deg)`
            
            // Dynamic scaling for stacked cards
            const scale = isTop ? 1 : 1 - i * 0.04 + (isTop ? 0 : Math.min(0.02, Math.abs(drag.x) / 1000))
            
            // Spring-based transitions
            const springTransition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
            const snapBackTransition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            const transition = drag.isDragging && isTop ? 'none' : 
                              (drag.x === 0 && drag.y === 0) ? springTransition : snapBackTransition
            
            // Calculate swipe feedback with velocity consideration
            const velocityBoost = Math.min(1, Math.abs(velocityRef.current.x) / 200)
            const threshold = 120
            const swipeProgress = isTop ? Math.min((Math.abs(drag.x) / threshold) + velocityBoost * 0.3, 1) : 0
            const isSwipingLeft = drag.x < -30
            const showSwipeHint = Math.abs(drag.x) > 30 || Math.abs(velocityRef.current.x) > 100
            
            // Calculate glow effect
            const glowIntensity = isTop && showSwipeHint ? swipeProgress * 0.6 : 0
            const glowColor = isSwipingLeft 
              ? `rgba(239, 68, 68, ${glowIntensity})` // Red for NOPE
              : `rgba(34, 197, 94, ${glowIntensity})` // Green for LIKE
            const glowStyle = isTop && showSwipeHint
              ? `0 0 ${40 * swipeProgress}px ${glowColor}, 0 0 ${60 * swipeProgress}px ${glowColor}`
              : undefined

            return (
              <div
                key={index}
                className="swipe-deck-card-wrapper"
                style={{
                  transform: `${translate} ${rotate} scale(${scale})`,
                  zIndex: recommendations.length - i,
                  transition,
                }}
                onPointerDown={isTop && !expandedMobile.has(index) ? handlePointerDown : undefined}
                onPointerMove={isTop && !expandedMobile.has(index) ? handlePointerMove : undefined}
                onPointerUp={isTop && !expandedMobile.has(index) ? handlePointerUp : undefined}
                onPointerCancel={isTop && !expandedMobile.has(index) ? handlePointerUp : undefined}
              >
                <RecommendationCard
                  movie={movie}
                  index={index}
                  loadingIndex={loadingIndex}
                  expanded={expandedMobile.has(index)}
                  toggleMobileExpansion={toggleMobileExpansion}
                  formatRating={formatRating}
                  glowStyle={glowStyle}
                  isTop={isTop}
                />
                
                {/* Swipe Feedback Overlay with dynamic opacity */}
                {isTop && showSwipeHint && (
                  <div 
                    className={`swipe-feedback ${isSwipingLeft ? 'nope' : 'like'}`}
                    style={{ opacity: swipeProgress * 0.8 }}
                  >
                    <span className="swipe-feedback-text">
                      {isSwipingLeft ? 'NOPE' : 'LIKE'}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Tinder-style Action Buttons */}
        {currentIndex < recommendations.length && !swipesComplete && (
          <div className="tinder-buttons">
            <button 
              className="tinder-button tinder-button-pass"
              onClick={() => handleButtonAction('pass')}
            >
              <X className="w-8 h-8" strokeWidth={3} />
            </button>
            <button 
              className="tinder-button tinder-button-info"
              onClick={() => !isAnimating && toggleMobileExpansion(currentIndex)}
              disabled={isAnimating}
            >
              <Info className="w-6 h-6" strokeWidth={2.5} />
            </button>
            <button 
              className="tinder-button tinder-button-like"
              onClick={() => handleButtonAction('like')}
            >
              <Heart className="w-8 h-8" strokeWidth={3} />
            </button>
          </div>
        )}
        </div>
      ) : (
        /* Waiting Screen */
        <WaitingScreen
          room={room}
          isGenerating={false}
          waitingType="swipeComplete"
          participantId={participantId}
          onSkipToResults={() => socket.emit('skip-to-results', { roomCode: room.code, hostId: participantId })}
        />
      )}
    </div>
  )
}

Recommendations.propTypes = {
  recommendations: PropTypes.array.isRequired,
  room: PropTypes.object.isRequired,
  participantId: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
}