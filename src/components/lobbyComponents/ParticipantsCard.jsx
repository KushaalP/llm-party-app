import React from 'react'

export default function ParticipantsCard({ room, isHost, onKickParticipant }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Participants</h2>
        <span className="text-gray-300 font-medium">
          {room.participants.length}/10
        </span>
      </div>

      <div className="space-y-3">
        {room.participants.map((participant) => {
          const storedName = localStorage.getItem('participantName')
          const displayName =
            participant.name === 'Host' && participant.id === room.host && storedName
              ? storedName
              : participant.name
          return (
            <div
              key={participant.id}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors min-h-[72px]"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg avatar-hover transition-all duration-300 flex-shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white truncate">
                      {displayName}{' '}
                      {participant.id === localStorage.getItem('participantId') && (
                        <span className="text-gray-400">(You)</span>
                      )}
                    </p>
                    {participant.id === room.host && (
                      <span className="badge badge-host">👑 Host</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {participant.id === room.host ? 'Party creator' : 'Participant'}
                  </p>
                </div>
              </div>
              {isHost && participant.id !== room.host && (
                <button onClick={() => onKickParticipant(participant.id)} className="remove-btn">
                  Remove
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 