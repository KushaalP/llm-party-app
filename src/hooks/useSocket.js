import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket() {
  const socketRef = useRef(null)

  useEffect(() => {
    const backendUrl = undefined; // Use same origin, proxy will handle it
    socketRef.current = io(backendUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id)
    })

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    socketRef.current.on('connect_error', (error) => {
      console.log('Socket connection error:', error)
    })

    socketRef.current.on('error', (error) => {
      console.log('Socket error:', error)
    })
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return socketRef.current
}