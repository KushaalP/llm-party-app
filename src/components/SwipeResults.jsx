import { useState, useEffect } from 'react'
import { Heart, Users, Trophy, Film } from 'lucide-react'
import './recommendationsComponents/Recommendations.css'

export default function SwipeResults({ room, recommendations }) {
  const [matchedMovies, setMatchedMovies] = useState([])

  useEffect(() => {
    if (!room?.swipeData || !recommendations) return

    // Calculate movies with 2+ likes
    const movieLikes = {}
    const likersByMovie = {}

    // Count likes for each movie
    Object.entries(room.swipeData).forEach(([participantId, likedMovies]) => {
      const participant = room.participants.find(p => p.id === participantId)
      likedMovies.forEach(movieIndex => {
        if (!movieLikes[movieIndex]) {
          movieLikes[movieIndex] = 0
          likersByMovie[movieIndex] = []
        }
        movieLikes[movieIndex]++
        if (participant) {
          likersByMovie[movieIndex].push(participant.name)
        }
      })
    })

    // Filter and sort movies by likes (highest first)
    const matched = Object.entries(movieLikes)
      .filter(([_, likes]) => likes >= 2)
      .sort(([_, likesA], [__, likesB]) => likesB - likesA)
      .map(([movieIndex, likes]) => ({
        movie: recommendations[parseInt(movieIndex)],
        likes,
        likedBy: likersByMovie[movieIndex],
        percentage: Math.round((likes / room.participants.length) * 100)
      }))

    setMatchedMovies(matched)
  }, [room, recommendations])

  if (matchedMovies.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Matches Found</h2>
          <p className="text-gray-400">
            No movies were liked by 2 or more people. Try regenerating recommendations!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Your Group's Top Picks!</h1>
        <p className="text-gray-400">
          {matchedMovies.length} movie{matchedMovies.length > 1 ? 's' : ''} matched based on everyone's swipes
        </p>
      </div>

      <div className="space-y-6">
        {matchedMovies.map(({ movie, likes, likedBy, percentage }, index) => (
          <div key={movie.title} className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row">
              {/* Movie Poster */}
              {movie.poster && (
                <div className="sm:w-48 sm:h-72 relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Rank badge */}
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg">
                    {index + 1}
                  </div>
                </div>
              )}

              {/* Movie Details */}
              <div className="flex-1 p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{movie.title}</h3>
                  <p className="text-gray-400">
                    {movie.year} • {movie.genres?.join(', ')}
                  </p>
                </div>

                {movie.overview && (
                  <p className="text-gray-300 mb-4 line-clamp-3">{movie.overview}</p>
                )}

                {/* Match Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                    <span className="text-white font-semibold">{likes} likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">{percentage}% match</span>
                  </div>
                </div>

                {/* Who liked it */}
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Liked by:</span> {likedBy.join(', ')}
                  </p>
                </div>

                {/* Match scores if available */}
                {movie.participantMatchScore && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(movie.participantMatchScore).map(([name, score]) => {
                      let scoreClass = 'match-very-poor'
                      if (score >= 85) scoreClass = 'match-excellent'
                      else if (score >= 70) scoreClass = 'match-good'
                      else if (score >= 50) scoreClass = 'match-fair'
                      else if (score >= 30) scoreClass = 'match-poor'

                      return (
                        <div key={name} className={`match-score-pill ${scoreClass}`}>
                          {name}: {score}%
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Ready for movie night?</h3>
          <p className="text-gray-400">
            Pick any of these movies and enjoy watching together!
          </p>
        </div>
      </div>
    </div>
  )
}