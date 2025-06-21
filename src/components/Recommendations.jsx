import React, { useState, useEffect } from 'react'
import { RefreshCw, Film } from 'lucide-react'

export default function Recommendations({
  recommendations,
  isHost,
  onRegenerate,
  canRegenerate = true,
  onReroll = () => {},
  rerollCounts = {},
}) {
  const [loadingIndex, setLoadingIndex] = useState(null)

  // reset loading state when recommendations prop changes
  useEffect(() => {
    setLoadingIndex(null)
  }, [recommendations])

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No recommendations available.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Your Movie Recommendations</h2>
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
          <div
            key={index}
            className="bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-colors relative"
          >
            {/* Loading overlay over poster */}
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-48 flex-shrink-0 group">
                {loadingIndex === index && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <Film className="w-24 h-24 animate-spin text-white opacity-90" />
                  </div>
                )}
                <img
                  src={movie.poster || 'https://via.placeholder.com/342x513?text=No+Image'}
                  alt={`${movie.title} poster`}
                  className="w-full h-72 md:h-full object-cover"
                />
              </div>
              
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="pr-16 md:pr-0">
                    <div className="flex items-center mb-4">
                      <span className="rank-badge">#{index + 1}</span>
                      <h3 className="text-2xl font-bold">{movie.title}</h3>
                      <span className="text-gray-400 ml-4 text-base">({movie.year})</span>
                    </div>
                    
                    <div className="flex items-center mb-5">
                      <span className="text-yellow-400 mr-2">⭐</span>
                      <span className="text-gray-300 font-medium">
                        {movie.rating ? `${movie.rating.toFixed(1)}/10` : 'N/A'}
                      </span>
                    </div>
                    
                    {movie.genres && movie.genres.length > 0 && (
                      <div className="flex flex-wrap gap-4 mb-6">
                        {movie.genres.map((genre, genreIndex) => (
                          <span
                            key={genreIndex}
                            className="genre-badge"
                          >
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
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Enjoy your movie night! 🎬</h3>
          <p className="text-gray-400">
            These recommendations were carefully selected based on everyone's preferences. 
            Have a great time watching together!
          </p>
        </div>
      </div>
    </div>
  )
}