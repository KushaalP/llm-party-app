import React, { useState, useEffect, useRef } from 'react'
import { Heart, X, Info, Users, CheckCircle } from 'lucide-react'
import RecommendationCard from './recommendationsComponents/RecommendationCard'
import './recommendationsComponents/Recommendations.css'

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

  // reset loading state when recommendations prop changes
  useEffect(() => {
    setLoadingIndex(null)
    setCurrentIndex(0)
    setExpandedMobile(new Set())
    setSwipesComplete(false)
  }, [recommendations])

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

  // Swipe handlers - using same mechanics as SwipeDeck
  const handlePointerDown = (e) => {
    if (isAnimating) return
    e.target.setPointerCapture(e.pointerId)
    startPoint.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: 0, y: 0, isDragging: true })
  }

  const handlePointerMove = (e) => {
    if (!drag.isDragging) return
    const dx = e.clientX - startPoint.current.x
    const dy = e.clientY - startPoint.current.y

    // Store the latest drag values
    pendingDragRef.current = { x: dx, y: dy, isDragging: true }

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
    const threshold = 120 // px required to count as a swipe
    const { x } = drag
    const hasSwiped = Math.abs(x) > threshold

    if (hasSwiped && currentIndex <= recommendations.length - 1) {
      // Prevent further actions while animating
      setIsAnimating(true)
      
      // animate card out of the viewport
      const direction = x > 0 ? 1 : -1
      setDrag({ x: direction * window.innerWidth * 1.5, y: drag.y, isDragging: false })

      // Emit like event if swiped right
      if (direction > 0 && socket) {
        socket.emit('movie-liked', {
          roomCode: room.code,
          participantId,
          movieIndex: currentIndex
        })
      }

      // remove the card after the animation finishes
      setTimeout(() => {
        const nextIndex = currentIndex + 1
        setCurrentIndex(nextIndex)
        setDrag({ x: 0, y: 0, isDragging: false })
        setIsAnimating(false)

        // Check if completed all swipes
        if (nextIndex >= recommendations.length && socket) {
          setSwipesComplete(true)
          socket.emit('swipes-completed', {
            roomCode: room.code,
            participantId
          })
        }
      }, 400) // Increased timeout to match CSS transition
    } else {
      // snap back to centre
      setDrag({ x: 0, y: 0, isDragging: false })
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
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setDrag({ x: 0, y: 0, isDragging: false })
      setIsAnimating(false)

      // Check if completed all swipes
      if (nextIndex >= recommendations.length && socket) {
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
      {/* Swipe Deck Container */}
      <div className="swipe-deck-container">
        {/* Progress indicator */}
        <div className="swipe-progress">
          <span className="progress-text">
            {currentIndex + 1} of {recommendations.length}
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
            const rotate = isTop ? `rotate(${drag.x / 10}deg)` : `rotate(0deg)`
            const scale = isTop ? 1 : 1 - i * 0.04
            const transition = drag.isDragging && isTop ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            
            // Calculate swipe feedback
            const threshold = 120
            const swipeProgress = isTop ? Math.min(Math.abs(drag.x) / threshold, 1) : 0
            const isSwipingLeft = drag.x < -40
            const showSwipeHint = Math.abs(drag.x) > 40

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
                />
                
                {/* Swipe Feedback Overlay */}
                {isTop && showSwipeHint && (
                  <div className={`swipe-feedback ${isSwipingLeft ? 'nope' : 'like'}`}>
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

      {swipesComplete && (
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-0">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">You've finished swiping!</h3>
            <p className="text-gray-400 mb-6">
              Waiting for everyone else to finish their selections...
            </p>
            
            {/* Show who's done swiping */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 font-medium">Swipe Progress</span>
              </div>
              <div className="space-y-2">
                {room?.participants?.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium">
                      {participant.name}
                      {participant.id === participantId && " (You)"}
                    </span>
                    <span className={`text-sm font-medium ${participant.swipesCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                      {participant.swipesCompleted ? '✓ Done' : 'Swiping...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host skip button */}
            {room?.host === participantId && (
              <button
                onClick={() => socket.emit('skip-to-results', { roomCode: room.code, hostId: participantId })}
                className="btn btn-primary"
              >
                Skip to Results
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  )
}