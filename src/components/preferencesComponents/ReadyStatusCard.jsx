import React from 'react'
import { CheckCircle2, Hourglass } from 'lucide-react'

export default function ReadyStatusCard({
  readyCount,
  totalParticipants,
  userPreferencesLength,
  isReady,
  handleReadyToggle,
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Ready to Continue?</h3>
        <span className="text-sm text-gray-400">
          {readyCount}/{totalParticipants} ready
        </span>
      </div>

      <button
        onClick={handleReadyToggle}
        disabled={userPreferencesLength === 0}
        className={`btn w-full text-lg py-4 ${
          userPreferencesLength > 0
            ? 'btn-secondary'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Hourglass size={18} className="inline-block mr-1 -mt-1" /> Mark as Ready
      </button>

      {userPreferencesLength === 0 && (
        <p className="text-yellow-400 text-sm font-medium mt-4 text-center tracking-wide">
          Add at least one preference first!
        </p>
      )}
    </div>
  )
} 