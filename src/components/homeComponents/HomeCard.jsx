import { Film } from 'lucide-react'

export default function HomeCard({
  createName,
  setCreateName,
  isCreating,
  handleCreateRoom,
  joinCode,
  setJoinCode,
  joinName,
  setJoinName,
  isJoining,
  handleJoinRoom,
  error,
}) {
  return (
    <div className="card space-y-4 mt-negative">
      {/* Create Form */}
      <input
        type="text"
        placeholder="Your name"
        value={createName}
        onChange={(e) => setCreateName(e.target.value)}
        maxLength={20}
        className="input text-center"
      />
      <button
        onClick={handleCreateRoom}
        disabled={isCreating || !createName.trim()}
        className="btn btn-primary w-full text-lg"
      >
        {isCreating ? (
          <>
            <Film className="w-4 h-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create New Party'
        )}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: '1', borderTop: '1px solid #404040' }}></div>
        <span
          style={{
            background: 'rgba(64, 64, 64, 0.5)',
            color: '#9ca3af',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.05em',
          }}
        >
          OR
        </span>
        <div style={{ flex: '1', borderTop: '1px solid #404040' }}></div>
      </div>

      {/* Join Form */}
      <input
        type="text"
        placeholder="Party code (e.g. ABC123)"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
        maxLength={6}
        className="input text-center font-mono tracking-wider"
      />
      <input
        type="text"
        placeholder="Your name"
        value={joinName}
        onChange={(e) => setJoinName(e.target.value)}
        maxLength={20}
        className="input text-center"
      />
      <button
        onClick={(e) => {
          e.preventDefault()
          handleJoinRoom(e)
        }}
        disabled={isJoining || !joinCode.trim() || !joinName.trim()}
        className="btn btn-secondary w-full text-lg"
      >
        {isJoining ? (
          <>
            <Film className="w-4 h-4 animate-spin" />
            Joining...
          </>
        ) : (
          'Join Party'
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-300 text-center text-sm">
          {error}
        </div>
      )}
    </div>
  )
} 