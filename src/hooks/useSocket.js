import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket() {
  const socketRef = useRef(null)

  useEffect(() => {
    const backendUrl = undefined; // Use same origin, proxy will handle it
    socketRef.current = io(backendUrl, {
      autoConnect: true,
      transports: ['websocket'],
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return socketRef.current
}