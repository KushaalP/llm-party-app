import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../config/api'

export function useSocket() {
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
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