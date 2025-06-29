import React from 'react'

export default function GroupProgressCard({ room, currentParticipant }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">Group Progress</h3>
      <div className="space-y-3">
        {room.participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  participant.isReady ? 'bg-green-500' : 'bg-gray-500'
                }`}
              >
                {participant.isReady ? '✓' : participant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white text-sm">
                  {participant.name}{' '}
                  {participant.id === currentParticipant.id && (
                    <span className="text-gray-400">(You)</span>
                  )}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  {participant.id === room.host && (
                    <span className="badge badge-host">👑 Host</span>
                  )}
                  <span
                    className={
                      participant.isReady
                        ? 'text-green-400 font-medium'
                        : 'text-gray-400 font-medium italic'
                    }
                  >
                    {participant.isReady ? (
                      'Ready'
                    ) : (
                      <>
                        <span>Choosing</span>
                        <span className="anim-dots" />
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 