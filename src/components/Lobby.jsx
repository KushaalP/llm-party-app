import React from 'react'

export default function Lobby({ room, isHost, onStartPreferences, onKickParticipant }) {
  const [copied, setCopied] = React.useState(false)

  const copyRoomCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(room.code)
      } else {
        // Fallback for insecure contexts / older iOS
        const textarea = document.createElement('textarea')
        textarea.value = room.code
        textarea.style.position = 'fixed' // avoid scrolling to bottom
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1500) // revert after 1.5s
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Room Code Card */}
      <div className="card text-center hover-glow">
        <h2 className="text-xl font-semibold text-white mb-4">🎬 Party Code</h2>
        <div className="text-5xl font-mono font-bold gradient-text tracking-wider mb-6 room-code">
          {room.code}
        </div>
        <button
          onClick={copyRoomCode}
          className="btn btn-secondary"
        >
          {copied ? '✅ Copied!' : '📋 Copy Code'}
        </button>
      </div>

      {/* Participants Card */}
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
            const displayName = participant.name === 'Host' && participant.id === room.host && storedName ? storedName : participant.name
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
                        {displayName} {participant.id === localStorage.getItem('participantId') && <span className="text-gray-400">(You)</span>}
                      </p>
                      {participant.id === room.host && (
                        <span className="badge badge-host">
                          👑 Host
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {participant.id === room.host ? 'Party creator' : 'Participant'}
                    </p>
                  </div>
                </div>
                {isHost && participant.id !== room.host && (
                  <button
                    onClick={() => onKickParticipant(participant.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Section */}
      <div className="text-center">
        {isHost ? (
          <div>
            <button
              onClick={onStartPreferences}
              disabled={room.participants.length < 2}
              className="btn btn-primary text-lg px-8 py-4"
              style={{
                background: room.participants.length >= 2 
                  ? 'linear-gradient(45deg, #1db954, #1ed760)' 
                  : '#535353',
                transform: room.participants.length >= 2 ? 'scale(1)' : 'scale(0.95)',
                transition: 'all 0.2s ease'
              }}
            >
              🎬 Start Movie Selection
            </button>
            {room.participants.length < 2 && (
              <p className="text-gray-400 text-sm mt-3">
                Need at least 2 participants to start
              </p>
            )}
          </div>
        ) : (
          <div className="card inline-block animate-pulse-slow">
            <div className="flex items-center gap-3 text-white">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="font-medium">Waiting for host to start...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}