import { Capacitor } from '@capacitor/core';

const isCapacitor = Capacitor.isNativePlatform();

function getServerUrl() {
  if (isCapacitor) {
    // Use environment variable for Capacitor builds
    // Falls back to localhost if not set
    return import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
  }
  
  // For web builds, use relative URLs
  return '';
}

export const SERVER_URL = getServerUrl();
export const SOCKET_URL = isCapacitor ? SERVER_URL : undefined;