import React, { useState, useEffect } from 'react'
import { RefreshCw, Film } from 'lucide-react'

export default function Recommendations({
  recommendations,
  isHost,
  onRegenerate,
  canRegenerate = true,
}) {
  const [loadingIndex, setLoadingIndex] = useState(null)

  // reset loading state when recommendations prop changes
  useEffect(() => {
    setLoadingIndex(null)
  }, [recommendations])

  const formatRating = (value) => {
    if (value === undefined || value === null) return 'N/A'
    const num = Number(value)
    if (Number.isNaN(num)) return 'N/A'
    return `${num.toFixed(1)}/10`
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold">Your Movie Recommendations</h2>
        {isHost && (
          <button
            onClick={onRegenerate}
            disabled={!canRegenerate || loadingIndex !== null}
            className={`flex items-center gap-2 btn btn-secondary px-6 py-2 ${!canRegenerate || loadingIndex !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Regenerate All</span>
          </button>
        )}
      </div>

      <div className="grid gap-6">
        {recommendations.map((movie, index) => (
          <div key={index}>
            {/* Mobile Layout */}
            <div className="md:hidden bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out">
              {/* Mobile Poster and Basic Info */}
              <div>
                <div className="relative">
                  {loadingIndex === index && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                      <Film className="w-16 h-16 animate-spin text-white opacity-90" />
                    </div>
                  )}
                  <img
                    src={movie.poster || 'https://via.placeholder.com/342x513?text=No+Image'}
                    alt={`${movie.title} poster`}
                    className={`w-full h-64 object-cover transition-all duration-300 ${
                      loadingIndex === index ? 'filter grayscale brightness-50' : ''
                    }`}
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="rank-badge">#{index + 1}</span>
                    <h3 className="text-lg font-bold flex-1">{movie.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">({movie.year})</p>
                </div>
              </div>

              {/* Mobile Details (always visible) */}
              <div className="p-4 pt-0 border-t border-gray-700">
                <div className="flex items-center mb-3">
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
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider uppercase">Synopsis</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{movie.overview}</p>
                  </div>
                )}

                {movie.reasoning && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider uppercase">Why We Picked This</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{movie.reasoning}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout - Unchanged */}
            <div className="hidden md:block bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-colors relative">
              <div className="flex flex-row">
                <div className="relative w-48 flex-shrink-0 group">
                  {loadingIndex === index && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                      <Film className="w-32 h-32 animate-spin text-white opacity-90" />
                    </div>
                  )}
                  <img
                    src={movie.poster || 'https://via.placeholder.com/342x513?text=No+Image'}
                    alt={`${movie.title} poster`}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      loadingIndex === index ? 'filter grayscale brightness-50' : ''
                    }`}
                  />
                </div>
                
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="pr-16">
                      <div className="flex items-center mb-4">
                        <span className="rank-badge">#{index + 1}</span>
                        <h3 className="text-2xl font-bold">{movie.title}</h3>
                        <span className="text-gray-400 ml-4 text-base">({movie.year})</span>
                      </div>
                      
                      <div className="flex items-center mb-5">
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
                      <h4 className="text-sm font-semibold text-gray-400 mb-3 tracking-wider uppercase">Synopsis</h4>
                      <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                    </div>
                  )}

                  {movie.reasoning && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-3 tracking-wider uppercase">Why We Picked This</h4>
                      <p className="text-gray-300 leading-relaxed">{movie.reasoning}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 sm:mt-12 text-center">
        <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-0">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Enjoy your movie night! 🎬</h3>
          <p className="text-gray-400 text-sm sm:text-base">
            These recommendations were carefully selected based on everyone's preferences. 
            Have a great time watching together!
          </p>
        </div>
      </div>
    </div>
  )
}