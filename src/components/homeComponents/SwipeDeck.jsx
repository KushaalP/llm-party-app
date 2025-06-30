import React, { useState, useRef } from 'react'
import styles from './swipedeck.module.css'
import { Film, Users, SlidersHorizontal, Sparkles, PartyPopper } from 'lucide-react'

// Guided onboarding steps for users
const INITIAL_CARDS = [
  {
    title: 'Create or Join a Party',
    description: 'Start a new party or enter a code to hop into an existing one.',
    icon: Film,
    bg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  },
  {
    title: 'Wait for Friends',
    description: "Once everyone's in, you're ready to roll.",
    icon: Users,
    bg: 'linear-gradient(135deg, #047857 0%, #22c55e 100%)',
  },
  {
    title: 'Select Your Preferences',
    description: 'Swipe through films to capture the group vibe.',
    icon: SlidersHorizontal,
    bg: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
  },
  {
    title: 'Get a Recommendation',
    description: 'We crunch the picks and suggest the perfect movie.',
    icon: Sparkles,
    bg: 'linear-gradient(135deg, #6b21a8 0%, #d946ef 100%)',
  },
  {
    title: 'Now create your first party!',
    description: '',
    icon: PartyPopper,
    bg: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
  },
]

export default function SwipeDeck() {
  const [cards, setCards] = useState(INITIAL_CARDS)
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false })
  const [showHint, setShowHint] = useState(true)
  const startPoint = useRef({ x: 0, y: 0 })

  // throttle updates to one per animation frame for smoother dragging
  const frameRef = useRef(null)
  const pendingDragRef = useRef(drag)

  if (cards.length === 0) {
    setCards(INITIAL_CARDS)
    setShowHint(true)
  }

  const handlePointerDown = (e) => {
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
    if (!drag.isDragging) return
    const threshold = 120 // px required to count as a swipe
    const { x } = drag
    const hasSwiped = Math.abs(x) > threshold

    if (hasSwiped) {
      if (showHint) setShowHint(false)
      // animate card out of the viewport
      const direction = x > 0 ? 1 : -1
      setDrag({ x: direction * window.innerWidth, y: drag.y, isDragging: false })

      // remove the card after the animation finishes
      setTimeout(() => {
        setCards((prev) => {
          const next = prev.slice(1)
          if (next.length === 0) {
            setShowHint(true)
            return INITIAL_CARDS
          }
          return next
        })
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

  // The top-most card is index 0
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {cards.map((card, i) => {
          const isTop = i === 0
          const translate = isTop ? `translate(${drag.x}px, ${drag.y}px)` : `translate(0px, ${-i * 8}px)`
          const rotate = isTop ? `rotate(${drag.x / 10}deg)` : `rotate(0deg)`
          const scale = isTop ? 1 : 1 - i * 0.04
          const transition = drag.isDragging && isTop ? 'none' : 'transform 0.3s ease-out'

          return (
            <div
              key={card.title}
              className={styles.card}
              style={{
                background: card.bg,
                transform: `${translate} ${rotate} scale(${scale})`,
                zIndex: cards.length - i,
                transition,
              }}
              onPointerDown={isTop ? handlePointerDown : undefined}
              onPointerMove={isTop ? handlePointerMove : undefined}
              onPointerUp={isTop ? handlePointerUp : undefined}
              onPointerCancel={isTop ? handlePointerUp : undefined}
            >
              <card.icon className={styles.cardIcon} size={36} />
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
            </div>
          )
        })}
      </div>
      {showHint && (<p className={styles.hint}>Swipe to learn how to use the app! &nbsp;→</p>)}
    </div>
  )
}
