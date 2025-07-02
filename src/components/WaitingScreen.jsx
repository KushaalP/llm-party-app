import { useState, useEffect } from 'react'
import { ArrowLeft, Users, Clock, Film } from 'lucide-react'
import './WaitingScreen.css'

export default function WaitingScreen({ 
  room, 
  isGenerating, 
  onBackToPreferences 
}) {
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')

  const readyParticipants = room?.participants?.filter(p => p.isReady) || []
  const totalParticipants = room?.participants?.length || 0

  // Progress bar animation when generating
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0)
      setProgressMessage('')
      return
    }

    const messages = [
      'Analyzing your preferences...',
      'Finding perfect matches...',
      'Curating your movie list...',
      'Almost ready...'
    ]

    let currentProgress = 0
    let messageIndex = 0
    
    setProgressMessage(messages[0])

    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5 // Random increment between 5-20
      
      if (currentProgress >= 100) {
        currentProgress = 100
        setProgressMessage('Finalizing recommendations...')
        clearInterval(interval)
      } else {
        // Update message every 25% progress
        const newMessageIndex = Math.floor(currentProgress / 25)
        if (newMessageIndex !== messageIndex && newMessageIndex < messages.length) {
          messageIndex = newMessageIndex
          setProgressMessage(messages[messageIndex])
        }
      }
      
      setProgress(currentProgress)
    }, 200)

    return () => clearInterval(interval)
  }, [isGenerating])

  return (
    <div className="waiting-screen">
      <div className="waiting-content">
        
        {/* Header */}
        <div className="waiting-header">
          <div className="waiting-icon">
            {isGenerating ? (
              <Film className="w-12 h-12 text-blue-400 animate-pulse" />
            ) : (
              <Clock className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          <h1 className="waiting-title">
            {isGenerating ? 'Creating Your Recommendations' : 'Waiting for Everyone'}
          </h1>
          
          <p className="waiting-subtitle">
            {isGenerating 
              ? 'We\'re finding the perfect movies for your group...'
              : `${readyParticipants.length} of ${totalParticipants} participants ready`
            }
          </p>
        </div>

        {/* Progress Bar (only during generation) */}
        {isGenerating && (
          <div className="progress-section">
            <div className="progress-bar-container">
              <div 
                className="progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="progress-message">{progressMessage}</p>
          </div>
        )}

        {/* Participants Status */}
        <div className="participants-section">
          <div className="participants-header">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="participants-label">Participants</span>
          </div>
          
          <div className="participants-grid">
            {room?.participants?.map((participant) => (
              <div 
                key={participant.id}
                className={`participant-card ${participant.isReady ? 'ready' : 'not-ready'}`}
              >
                <div className="participant-avatar">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="participant-info">
                  <span className="participant-name">{participant.name}</span>
                  <span className="participant-status">
                    {participant.isReady ? '✓ Ready' : 'Setting preferences...'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button (only when not generating) */}
        {!isGenerating && (
          <div className="waiting-back-section">
            <button
              onClick={onBackToPreferences}
              className="waiting-back-button"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Change My Preferences</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}