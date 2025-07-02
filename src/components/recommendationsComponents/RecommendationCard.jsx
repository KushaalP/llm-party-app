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
          <div className="card-subtitle">
            <span className="card-genres-text">
              {movie.genres && movie.genres.length > 0 ? movie.genres.slice(0, 2).join(', ') : 'Film'}
            </span>
            <span className="card-divider">•</span>
            <span className="card-year-runtime">
              {movie.year}{movie.runtime ? `, ${movie.runtime} min` : ''}
            </span>
          </div>
        </div>

        {/* Match scores at top right */}
        {movie.participantMatchScore && (
          <div className="match-scores-top">
            {Object.entries(movie.participantMatchScore)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([participantName, score]) => (
                <div key={participantName} className="match-score-badge" data-score={score}>
                  <span className="match-score-name-full">{participantName}</span>
                  <span className="match-score-percent">{score}%</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Back of card */}
      <div className="card-face card-back">
        {/* Back button hint */}
        <button className="back-button-hint" onClick={(e) => {
          e.stopPropagation();
          toggleMobileExpansion(index);
        }}>
          ← Back
        </button>
        
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

          {movie.participantMatchScore && (
            <div className="card-section">
              <h4 className="section-title">Match Scores</h4>
              <div className="match-score-list">
                {Object.entries(movie.participantMatchScore)
                  .sort(([, a], [, b]) => b - a)
                  .map(([participantName, score]) => (
                    <div key={participantName} className="match-score-item">
                      <span className="match-score-name">{participantName}</span>
                      <span className="match-score-value">{score}%</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}