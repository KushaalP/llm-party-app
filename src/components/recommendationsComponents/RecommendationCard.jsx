import React from 'react'
import PropTypes from 'prop-types'
import { Film, Target } from 'lucide-react'

export default function RecommendationCard({
  movie,
  index,
  loadingIndex,
  expanded,
  toggleMobileExpansion,
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
          
          {/* Match scores at bottom like Tinder interests */}
          {movie.participantMatchScore && (
            <div className="match-scores-section">
              <div className="match-scores-title">
                <Target className="match-icon" />
                <span>Match Scores</span>
              </div>
              <div className="match-scores-pills">
                {Object.entries(movie.participantMatchScore)
                  .sort(([, a], [, b]) => b - a)
                  .map(([participantName, score]) => {
                    let scoreClass = 'match-very-poor';
                    if (score >= 85) scoreClass = 'match-excellent';
                    else if (score >= 70) scoreClass = 'match-good';
                    else if (score >= 50) scoreClass = 'match-moderate';
                    else if (score >= 30) scoreClass = 'match-poor';
                    
                    return (
                      <div key={participantName} className={`match-score-pill ${scoreClass}`}>
                        <span className="pill-name">{participantName}</span>
                        <span className="pill-score">{score}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
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

          {movie.watchProviders && (movie.watchProviders.streaming?.length > 0 || 
                                     movie.watchProviders.rent?.length > 0 || 
                                     movie.watchProviders.buy?.length > 0) && (
            <div className="card-section">
              <h4 className="section-title">Where to Watch</h4>
              <div className="watch-providers">
                {movie.watchProviders.streaming?.length > 0 && (
                  <div className="provider-section">
                    <p className="provider-label">Stream on:</p>
                    <div className="provider-logos">
                      {movie.watchProviders.streaming.map((provider, idx) => (
                        <div key={idx} className="provider-item" title={provider.name}>
                          {provider.logo ? (
                            <img src={provider.logo} alt={provider.name} className="provider-logo" />
                          ) : (
                            <span className="provider-text">{provider.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {movie.watchProviders.rent?.length > 0 && (
                  <div className="provider-section">
                    <p className="provider-label">Rent from:</p>
                    <div className="provider-logos">
                      {movie.watchProviders.rent.map((provider, idx) => (
                        <div key={idx} className="provider-item" title={provider.name}>
                          {provider.logo ? (
                            <img src={provider.logo} alt={provider.name} className="provider-logo" />
                          ) : (
                            <span className="provider-text">{provider.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {movie.participantMatchScore && (
            <div className="card-section">
              <h4 className="section-title">Match Scores</h4>
              <div className="match-score-list">
                {Object.entries(movie.participantMatchScore)
                  .sort(([, a], [, b]) => b - a)
                  .map(([participantName, score]) => {
                    let scoreClass = 'match-very-poor';
                    if (score >= 85) scoreClass = 'match-excellent';
                    else if (score >= 70) scoreClass = 'match-good';
                    else if (score >= 50) scoreClass = 'match-moderate';
                    else if (score >= 30) scoreClass = 'match-poor';
                    
                    return (
                      <div key={participantName} className="match-score-item">
                        <span className="match-score-name">{participantName}</span>
                        <span className={`match-score-value ${scoreClass}`}>{score}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        </div>
        
        {/* Subtle tap hint */}
        <div className="tap-to-return">
          Tap to return
        </div>
      </div>
    </div>
  )
}

RecommendationCard.propTypes = {
  movie: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  loadingIndex: PropTypes.number.isRequired,
  expanded: PropTypes.bool.isRequired,
  toggleMobileExpansion: PropTypes.func.isRequired,
  formatRating: PropTypes.func.isRequired,
  
}