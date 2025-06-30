import React, { useState, useRef } from 'react'
import styles from './swipedeck.module.css'

// Placeholder card images (swap with real content later)
const INITIAL_CARDS = [
  'https://picsum.photos/id/1011/600/350',
  'https://picsum.photos/id/1035/600/350',
  'https://picsum.photos/id/1025/600/350',
  'https://picsum.photos/id/1057/600/350',
  'https://picsum.photos/id/1043/600/350',
]

export default function SwipeDeck() {
  const [cards, setCards] = useState(INITIAL_CARDS)
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false })
  const startPoint = useRef({ x: 0, y: 0 })

  // throttle updates to one per animation frame for smoother dragging
  const frameRef = useRef(null)
  const pendingDragRef = useRef(drag)

  if (cards.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyMessage}>
          Now create your first party!
        </div>
      </div>
    )
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
      // animate card out of the viewport
      const direction = x > 0 ? 1 : -1
      setDrag({ x: direction * window.innerWidth, y: drag.y, isDragging: false })

      // remove the card after the animation finishes
      setTimeout(() => {
        setCards((prev) => prev.slice(1))
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
    <div className={styles.container}>
      {cards.map((url, i) => {
        const isTop = i === 0
        const translate = isTop ? `translate(${drag.x}px, ${drag.y}px)` : `translate(0px, ${-i * 4}px)`
        const rotate = isTop ? `rotate(${drag.x / 10}deg)` : `rotate(0deg)`
        const scale = isTop ? 1 : 1 - i * 0.02
        const transition = drag.isDragging && isTop ? 'none' : 'transform 0.3s ease-out'

        return (
          <div
            key={url + i}
            className={styles.card}
            style={{
              backgroundImage: `url(${url})`,
              transform: `${translate} ${rotate} scale(${scale})`,
              zIndex: cards.length - i,
              transition,
            }}
            onPointerDown={isTop ? handlePointerDown : undefined}
            onPointerMove={isTop ? handlePointerMove : undefined}
            onPointerUp={isTop ? handlePointerUp : undefined}
            onPointerCancel={isTop ? handlePointerUp : undefined}
          />
        )
      })}
    </div>
  )
}
