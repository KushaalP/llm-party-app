import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import RecommendationCard from './recommendationsComponents/RecommendationCard'

export default function Recommendations({
  recommendations,
  isHost,
  onRegenerate,
  canRegenerate = true,
}) {
  const [loadingIndex, setLoadingIndex] = useState(null)
  // Track which mobile cards are expanded
  const [expandedMobile, setExpandedMobile] = useState(new Set())

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

  // Toggle details visibility for a given card on mobile
  const toggleMobileExpansion = (index) => {
    setExpandedMobile(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
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
            className={`flex items-center justify-center btn btn-secondary p-2 md:px-6 md:py-2 gap-0 md:gap-2 ${!canRegenerate || loadingIndex !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className="w-6 h-6 md:w-4 md:h-4" />
            <span className="hidden md:block">Regenerate All</span>
          </button>
        )}
      </div>

      <div className="grid gap-6">
        {recommendations.map((movie, index) => (
          <RecommendationCard
            key={index}
            movie={movie}
            index={index}
            loadingIndex={loadingIndex}
            expanded={expandedMobile.has(index)}
            toggleMobileExpansion={toggleMobileExpansion}
            formatRating={formatRating}
          />
        ))}
      </div>

      <div className="mt-8 sm:mt-12 text-center">
        <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-0">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Enjoy your movie night!</h3>
          <p className="text-gray-400 text-sm sm:text-base">
            These recommendations were carefully selected based on everyone's preferences. 
            Have a great time watching together!
          </p>
        </div>
      </div>
    </div>
  )
}