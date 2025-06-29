import { useState } from 'react'
import PreferencesInputCard from './preferencesComponents/PreferencesInputCard'
import ReadyStatusCard from './preferencesComponents/ReadyStatusCard'
import GroupProgressCard from './preferencesComponents/GroupProgressCard'

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
      <PreferencesInputCard
        userPreferences={userPreferences}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        addPreference={addPreference}
        removePreference={removePreference}
        addSuggestion={addSuggestion}
        handleKeyPress={handleKeyPress}
        suggestionPrompts={SUGGESTION_PROMPTS}
      />

      {/* Ready Section & Participants */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ready Status */}
        <ReadyStatusCard
          readyCount={readyCount}
          totalParticipants={room.participants.length}
          userPreferencesLength={userPreferences.length}
          isReady={currentParticipant?.isReady}
          handleReadyToggle={handleReadyToggle}
        />

        {/* Participants Status */}
        <GroupProgressCard room={room} currentParticipant={currentParticipant} />
      </div>
    </div>
  )
}