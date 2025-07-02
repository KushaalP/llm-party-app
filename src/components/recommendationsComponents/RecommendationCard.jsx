import React from 'react'
import { Film } from 'lucide-react'

export default function RecommendationCard({
  movie,
  index,
  loadingIndex,
  expanded,
  toggleMobileExpansion,
  formatRating,
}) {
  const hasPoster = Boolean(movie.poster)

  return (
    <div 
      className="recommendation-swipe-card"
      onClick={() => toggleMobileExpansion(index)}
      style={{
        transform: expanded ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
    >
      {/* Front of card */}
      <div className="card-face card-front">
        {hasPoster && (
          <div className="card-poster-container">
            {loadingIndex === index && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <Film className="w-16 h-16 animate-spin text-white opacity-90" />
              </div>
            )}
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              className={`card-poster ${loadingIndex === index ? 'filter grayscale brightness-50' : ''}`}
            />
            <div className="card-gradient-overlay"></div>
          </div>
        )}

        <div className="card-content-front">
          <h3 className="card-title">{movie.title}</h3>
          <p className="card-year">({movie.year})</p>
          
          <div className="card-rating">
            <span className="text-yellow-400">⭐</span>
            <span>{movie.rating ? formatRating(movie.rating) : 'N/A'}</span>
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div className="card-genres">
              {movie.genres.slice(0, 3).map((genre, genreIndex) => (
                <span key={genreIndex} className="genre-pill">
                  {genre}
                </span>
              ))}
            </div>
          )}

          {movie.participantMatchScore && (
            <div className="match-scores">
              {Object.entries(movie.participantMatchScore).map(([participantName, score]) => (
                <div key={participantName} className="match-pill">
                  <span className="match-name">{participantName}</span>
                  <span className="match-score">{score}%</span>
                </div>
              ))}
            </div>
          )}

          <p className="tap-hint">Tap to flip</p>
        </div>
      </div>

      {/* Back of card */}
      <div className="card-face card-back">
        <div className="card-content-back">
          <h3 className="card-title-back">{movie.title}</h3>
          
          {movie.overview && (
            <div className="card-section">
              <h4 className="section-title">Synopsis</h4>
              <p className="section-text">{movie.overview}</p>
            </div>
          )}

          {movie.reasoning && (
            <div className="card-section">
              <h4 className="section-title">Why We Picked This</h4>
              <p className="section-text">{movie.reasoning}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}