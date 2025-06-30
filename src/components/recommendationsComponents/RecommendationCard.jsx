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
    <div>
      {/* Mobile Layout */}
      <div className="md:hidden bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out">
        {/* Mobile Poster and Basic Info (tap to expand) */}
        <div className="cursor-pointer" onClick={() => toggleMobileExpansion(index)}>
          {hasPoster && (
            <div className="relative">
              {loadingIndex === index && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                  <Film className="w-16 h-16 animate-spin text-white opacity-90" />
                </div>
              )}
              <img
                src={movie.poster}
                alt={`${movie.title} poster`}
                className={`w-full h-64 object-cover transition-all duration-300 ${
                  loadingIndex === index ? 'filter grayscale brightness-50' : ''
                }`}
              />
            </div>
          )}

          <div className="p-4 mobile-card-info">
            <div className="flex items-center gap-3 mb-2 title-row">
              <span className="rank-badge">#{index + 1}</span>
              <h3 className="text-lg font-bold flex-1">{movie.title}</h3>
            </div>
            <p className="text-gray-400 text-sm year-text">({movie.year})</p>
            <p className="text-xs text-gray-500 tap-hint">Tap to see details</p>
          </div>
        </div>

        {/* Mobile Expanded Details */}
        <div
          style={{
            maxHeight: expanded ? '1000px' : '0px',
            opacity: expanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.5s ease-in-out, opacity 0.5s ease-in-out',
          }}
        >
          <div className="p-4 pt-0 border-t border-gray-700">
            <div className="flex items-center rating-row">
              <span className="text-yellow-400 mr-2">⭐</span>
              <span className="text-gray-300 font-medium">
                {movie.rating ? formatRating(movie.rating) : 'N/A'}
              </span>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((genre, genreIndex) => (
                  <span key={genreIndex} className="genre-badge text-xs">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider uppercase">
                  Synopsis
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {movie.overview}
                </p>
              </div>
            )}

            {movie.reasoning && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider uppercase">
                  Why We Picked This
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {movie.reasoning}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-colors relative">
        <div className="flex flex-row">
          {hasPoster && (
            <div className="relative w-48 flex-shrink-0 group">
              {loadingIndex === index && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                  <Film className="w-32 h-32 animate-spin text-white opacity-90" />
                </div>
              )}
              <img
                src={movie.poster}
                alt={`${movie.title} poster`}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  loadingIndex === index ? 'filter grayscale brightness-50' : ''
                }`}
              />
            </div>
          )}

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="pr-16">
                <div className="flex items-center mb-4">
                  <span className="rank-badge">#{index + 1}</span>
                  <h3 className="text-2xl font-bold">{movie.title}</h3>
                  <span className="text-gray-400 ml-4 text-base">({movie.year})</span>
                </div>

                <div className="flex items-center rating-row">
                  <span className="text-yellow-400 mr-2">⭐</span>
                  <span className="text-gray-300 font-medium">
                    {movie.rating ? formatRating(movie.rating) : 'N/A'}
                  </span>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-6">
                    {movie.genres.map((genre, genreIndex) => (
                      <span key={genreIndex} className="genre-badge">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {movie.overview && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 tracking-wider uppercase">
                  Synopsis
                </h4>
                <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {movie.reasoning && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3 tracking-wider uppercase">
                  Why We Picked This
                </h4>
                <p className="text-gray-300 leading-relaxed">{movie.reasoning}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 