import { useState } from 'react'

const SUGGESTION_PROMPTS = [
  "Action movies with great fight scenes",
  "Romantic comedies that aren't too cheesy", 
  "Psychological horror over gore",
  "Mind-bending sci-fi films",
  "Classic 80s and 90s movies",
  "Marvel or DC superhero movies",
  "Movies based on true stories",
  "Foreign films with subtitles",
  "Academy Award winners",
  "Light-hearted family comedies",
  "Thriller movies that keep you guessing",
  "Movies with amazing cinematography"
]

export default function Preferences({ room, currentParticipant, onSubmitPreferences, onSetReady }) {
  const [userPreferences, setUserPreferences] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addPreference = () => {
    if (currentInput.trim() && userPreferences.length < 5) {
      const newPrefs = [...userPreferences, currentInput.trim()]
      setUserPreferences(newPrefs)
      setCurrentInput('')
      onSubmitPreferences(newPrefs.join(', '))
    }
  }

  const removePreference = (index) => {
    const newPrefs = userPreferences.filter((_, i) => i !== index)
    setUserPreferences(newPrefs)
    onSubmitPreferences(newPrefs.join(', '))
  }

  const addSuggestion = (suggestion) => {
    if (userPreferences.length < 5) {
      const newPrefs = [...userPreferences, suggestion]
      setUserPreferences(newPrefs)
      onSubmitPreferences(newPrefs.join(', '))
      setShowSuggestions(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPreference()
    }
  }

  const handleReadyToggle = () => {
    const newReadyState = !currentParticipant?.isReady
    onSetReady(newReadyState)
  }

  const readyCount = room.participants.filter(p => p.isReady).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Preferences Card */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-white mb-6">🎬 Share Your Movie Preferences</h2>
        
        {/* Current Preferences */}
        {userPreferences.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-6">Your Preferences:</h3>
            <div className="flex flex-wrap gap-3">
              {userPreferences.map((pref, index) => (
                <div
                  key={index}
                  className="preference-tag"
                >
                  {pref}
                  <button
                    onClick={() => removePreference(index)}
                    className="hover:text-red-600 transition-colors ml-1 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Preference */}
        {userPreferences.length < 5 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Add preference ${userPreferences.length + 1}/5...`}
                className="input flex-1"
                maxLength={100}
              />
              <button
                onClick={addPreference}
                disabled={!currentInput.trim()}
                className="btn btn-primary"
              >
                Add
              </button>
            </div>

            {/* Suggestions */}
            <div>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="btn btn-secondary text-sm px-4 py-2 mb-4"
              >
                {showSuggestions ? '🔼 Hide Suggestions' : '💡 Need Inspiration?'}
              </button>
              
              {showSuggestions && (
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {SUGGESTION_PROMPTS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => addSuggestion(suggestion)}
                      className="suggestion-btn"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {userPreferences.length >= 5 && (
          <div className="text-center text-gray-400 text-sm">
            Maximum 5 preferences reached
          </div>
        )}
      </div>

      {/* Ready Section & Participants */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ready Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Ready to Continue?</h3>
            <span className="text-sm text-gray-400">
              {readyCount}/{room.participants.length} ready
            </span>
          </div>
          
          <button
            onClick={handleReadyToggle}
            disabled={userPreferences.length === 0}
            className={`btn w-full text-lg py-4 ${
              currentParticipant?.isReady
                ? 'btn-primary'
                : userPreferences.length > 0 
                ? 'btn-secondary' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentParticipant?.isReady ? '✅ Ready!' : '⏳ Mark as Ready'}
          </button>
          
          {userPreferences.length === 0 && (
            <p className="text-yellow-400 text-sm font-medium mt-4 text-center tracking-wide">
              Add at least one preference first!
            </p>
          )}
        </div>

        {/* Participants Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Group Progress</h3>
          <div className="space-y-3">
            {room.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    participant.isReady 
                      ? 'bg-green-500' 
                      : 'bg-gray-500'
                  }`}>
                    {participant.isReady ? '✓' : participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{participant.name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      {participant.id === room.host && (
                        <span className="badge badge-host">👑 Host</span>
                      )}
                      <span className={participant.isReady ? 'text-green-400 font-medium' : 'text-gray-400 font-medium italic'}>
                        {participant.isReady ? 'Ready' : 'Choosing...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}