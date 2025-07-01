import React, { useState, useEffect, useRef } from 'react'
import { Heart, X } from 'lucide-react'
import RecommendationCard from './recommendationsComponents/RecommendationCard'
import './recommendationsComponents/Recommendations.css'

export default function Recommendations({
  recommendations,
}) {
  const [loadingIndex, setLoadingIndex] = useState(null)
  // Track which mobile cards are expanded
  const [expandedMobile, setExpandedMobile] = useState(new Set())
  
  // Swipe deck state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false })
  const startPoint = useRef({ x: 0, y: 0 })
  const frameRef = useRef(null)
  const pendingDragRef = useRef(drag)

  // reset loading state when recommendations prop changes
  useEffect(() => {
    setLoadingIndex(null)
    setCurrentIndex(0)
    setExpandedMobile(new Set())
  }, [recommendations])

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
    // Don't start drag if card is flipped
    if (expandedMobile.has(currentIndex)) return
    
    e.target.setPointerCapture(e.pointerId)
    startPoint.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: 0, y: 0, isDragging: true })
  }

  const handlePointerMove = (e) => {
    if (!drag.isDragging || expandedMobile.has(currentIndex)) return
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
    if (!drag.isDragging) return
    const threshold = 120 // px required to count as a swipe
    const { x } = drag
    const hasSwiped = Math.abs(x) > threshold

    if (hasSwiped && currentIndex < recommendations.length - 1) {
      // animate card out of the viewport
      const direction = x > 0 ? 1 : -1
      setDrag({ x: direction * window.innerWidth, y: drag.y, isDragging: false })

      // remove the card after the animation finishes
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setDrag({ x: 0, y: 0, isDragging: false })
      }, 300)
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
    if (currentIndex >= recommendations.length - 1) return
    
    // Animate card based on action
    const direction = action === 'like' ? 1 : -1
    setDrag({ x: direction * window.innerWidth, y: 0, isDragging: false })
    
    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setDrag({ x: 0, y: 0, isDragging: false })
    }, 300)
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
            const transition = drag.isDragging && isTop ? 'none' : 'transform 0.3s ease-out'

            return (
              <div
                key={index}
                className="swipe-deck-card-wrapper"
                style={{
                  transform: `${translate} ${rotate} scale(${scale})`,
                  zIndex: recommendations.length - i,
                  transition,
                }}
                onPointerDown={isTop ? handlePointerDown : undefined}
                onPointerMove={isTop ? handlePointerMove : undefined}
                onPointerUp={isTop ? handlePointerUp : undefined}
                onPointerCancel={isTop ? handlePointerUp : undefined}
              >
                <RecommendationCard
                  movie={movie}
                  index={index}
                  loadingIndex={loadingIndex}
                  expanded={expandedMobile.has(index)}
                  toggleMobileExpansion={toggleMobileExpansion}
                  formatRating={formatRating}
                />
              </div>
            )
          })}
        </div>

        {/* Tinder-style Action Buttons */}
        {currentIndex < recommendations.length - 1 && (
          <div className="tinder-buttons">
            <button 
              className="tinder-button tinder-button-pass"
              onClick={() => handleButtonAction('pass')}
            >
              <X className="w-6 h-6" />
            </button>
            <button 
              className="tinder-button tinder-button-like"
              onClick={() => handleButtonAction('like')}
            >
              <Heart className="w-6 h-6" />
            </button>
          </div>
        )}

      </div>

      {currentIndex === recommendations.length - 1 && (
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-0">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Enjoy your movie night!</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              These recommendations were carefully selected based on everyone's preferences. 
              Have a great time watching together!
            </p>
          </div>
        </div>
      )}

    </div>
  )
}