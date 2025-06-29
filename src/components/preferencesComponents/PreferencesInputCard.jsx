import React from 'react'

export default function PreferencesInputCard({
  userPreferences,
  currentInput,
  setCurrentInput,
  showSuggestions,
  setShowSuggestions,
  addPreference,
  removePreference,
  addSuggestion,
  handleKeyPress,
  suggestionPrompts,
}) {
  return (
    <div className="card">
      <h2 className="text-2xl font-semibold text-white mb-6">🎬 Share Your Movie Preferences</h2>

      {/* Current Preferences */}
      {userPreferences.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-6">Your Preferences:</h3>
          <div className="flex flex-wrap gap-3">
            {userPreferences.map((pref, index) => (
              <div key={index} className="preference-tag">
                <span className="pref-text">{pref}</span>
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
                {suggestionPrompts.map((suggestion, index) => (
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
  )
} 