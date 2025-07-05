import { useState } from 'react'
import PropTypes from 'prop-types'
import { moviePosters } from '../../data/moviePosters'

export default function MobilePosterCarousel({ line1, typedLine2 }) {
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

  return (
    <div className="block md:hidden" style={{ marginTop: '2rem' }}>
      <div
        style={{
          overflow: carouselPaused ? 'auto' : 'hidden',
          position: 'relative',
          height: '240px',
          cursor: carouselPaused ? 'grab' : 'default',
        }}
        onTouchStart={handleCarouselInteraction}
        onMouseDown={handleCarouselInteraction}
        onScroll={handleScrollEnd}
        onTouchEnd={handleScrollEnd}
      >
        <div
          style={{
            display: 'flex',
            animation: carouselPaused ? 'none' : 'scroll-left 12s linear infinite',
            gap: '12px',
            height: '100%',
            width: '200%',
          }}
        >
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
                pointerEvents: carouselPaused ? 'auto' : 'none',
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
                  userSelect: 'none',
                }}
                onError={(e) => {
                  e.target.src =
                    'https://via.placeholder.com/140x210/333333/666666?text=Movie'
                }}
                draggable={!carouselPaused}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tagline below carousel */}
      <div className="text-center mt-16 mb-8">
        <div className="space-y-1" style={{ minHeight: '48px' }}>
          <p className="text-gray-400 text-sm">{line1}</p>
          <p className="text-white text-lg">{typedLine2}</p>
        </div>
      </div>
    </div>
  )
}

MobilePosterCarousel.propTypes = {
  line1: PropTypes.string.isRequired,
  typedLine2: PropTypes.string.isRequired
} 