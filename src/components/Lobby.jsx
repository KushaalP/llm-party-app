import React from 'react'
import { Clapperboard } from 'lucide-react'
import PartyCodeCard from './lobbyComponents/PartyCodeCard'
import ParticipantsCard from './lobbyComponents/ParticipantsCard'

export default function Lobby({ room, isHost, onStartPreferences, onKickParticipant }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Room Code Card */}
      <PartyCodeCard code={room.code} />

      {/* Participants Card */}
      <ParticipantsCard room={room} isHost={isHost} onKickParticipant={onKickParticipant} />

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
              <>
                <Clapperboard size={20} /> Start Movie Selection
              </>
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