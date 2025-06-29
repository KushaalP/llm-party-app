import React from 'react'

export default function PartyCodeCard({ code }) {
  const [copied, setCopied] = React.useState(false)

  const copyRoomCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code)
      } else {
        // Fallback for insecure contexts / older iOS
        const textarea = document.createElement('textarea')
        textarea.value = code
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="card text-center hover-glow">
      <h2 className="text-xl font-semibold text-white mb-4">🎬 Party Code</h2>
      <div className="text-5xl font-mono font-bold gradient-text tracking-wider mb-6 room-code">
        {code}
      </div>
      <button onClick={copyRoomCode} className="btn btn-secondary">
        {copied ? '✅ Copied!' : '📋 Copy Code'}
      </button>
    </div>
  )
} 