import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmText = "Confirm", cancelText = "Cancel" }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="btn btn-secondary px-6 py-2"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}