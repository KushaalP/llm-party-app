import { useState, useEffect } from 'react'
import { ArrowLeft, Users, Clock, Film, CheckCircle } from 'lucide-react'
import './WaitingScreen.css'
import PropTypes from 'prop-types'
export default function WaitingScreen({ 
  room, 
  isGenerating, 
  onBackToPreferences,
  waitingType = 'preferences', // 'preferences' or 'swipeComplete'
  participantId,
  onSkipToResults
}) {
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')

  const readyParticipants = waitingType === 'swipeComplete' 
    ? room?.participants?.filter(p => p.swipesCompleted) || []
    : room?.participants?.filter(p => p.isReady) || []
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

  const handleBackClick = () => {
    onBackToPreferences()
  }

  return (
    <div className="waiting-screen visible">
      <div className="waiting-content">
        
        {/* Header */}
        <div className="waiting-header">
          <div className="waiting-icon">
            {isGenerating ? (
              <Film className="w-12 h-12 text-blue-400 animate-pulse" />
            ) : waitingType === 'swipeComplete' ? (
              <CheckCircle className="w-12 h-12 text-green-400" />
            ) : (
              <Clock className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          <h1 className="waiting-title">
            {isGenerating 
              ? 'Creating Your Recommendations' 
              : waitingType === 'swipeComplete'
                ? 'You\'ve finished swiping!'
                : 'Waiting for Everyone'}
          </h1>
          
          <p className="waiting-subtitle">
            {isGenerating 
              ? 'We\'re finding the perfect movies for your group...'
              : waitingType === 'swipeComplete'
                ? 'Waiting for everyone else to finish their selections...'
                : `${readyParticipants.length} of ${totalParticipants} participants ready`
            }
          </p>
        </div>

        {/* Progress Bar (only during generation) */}
        {isGenerating && (
          <div className="progress-section">
            <div className="progress-bar-container">
              <div 
                className={`progress-bar ${progress >= 100 ? 'complete' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="progress-message">
              {progress >= 100 ? (
                <>
                  <span>Finalizing recommendations</span>
                  <span className="anim-dots" />
                </>
              ) : (
                progressMessage
              )}
            </p>
          </div>
        )}

        {/* Participants Status */}
        <div className="participants-section">
          <div className="participants-header">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="participants-label">
              {waitingType === 'swipeComplete' ? 'Swipe Progress' : 'Participants'}
            </span>
          </div>
          
          <div className="participants-grid">
            {room?.participants?.map((participant) => {
              const isReady = waitingType === 'swipeComplete' 
                ? participant.swipesCompleted 
                : participant.isReady;
              
              return (
                <div 
                  key={participant.id}
                  className={`participant-card ${isReady ? 'ready' : 'not-ready'}`}
                >
                  <div className="participant-avatar">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="participant-info">
                    <span className="participant-name">
                      {participant.name}
                    </span>
                    <span className="participant-status">
                      {isReady ? (
                        '✓ Done'
                      ) : (
                        waitingType === 'swipeComplete' ? 'Swiping...' : 'Choosing...'
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {!isGenerating && (
          <div className="flex justify-center mt-6 pb-4">
            {waitingType === 'preferences' ? (
              <button
                onClick={handleBackClick}
                className="btn btn-secondary gap-2 px-6 mt-8"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Change My Preferences</span>
              </button>
            ) : (
              room?.host === participantId && onSkipToResults && (
                <button
                  onClick={onSkipToResults}
                  className="btn btn-primary px-6 mt-8"
                >
                  Skip to Results
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

WaitingScreen.propTypes = {
  room: PropTypes.object.isRequired,
  isGenerating: PropTypes.bool.isRequired,
  onBackToPreferences: PropTypes.func,
  waitingType: PropTypes.oneOf(['preferences', 'swipeComplete']),
  participantId: PropTypes.string,
  onSkipToResults: PropTypes.func
}
