// File: /lib/socket.js
import { io } from 'socket.io-client';

let socket;
let heartbeatInterval;

export const initSocket = async () => {
  if (!socket) {
    try {
      // Check that the Socket.IO server is running
      const response = await fetch('/api/socketio');
      if (!response.ok) {
        console.error('Failed to initialize socket server:', response.status);
        return null;
      }
      
      // Determine the correct Socket.IO server URL based on environment
      const socketUrl = process.env.NODE_ENV === 'production'
        ? window.location.origin // Use the same origin in production
        : 'http://localhost:3001'; // Use the dev server in development
      
      console.log(`Connecting to Socket.IO server at: ${socketUrl}`);
      
      // Connect to the Socket.IO server with improved configuration
      socket = io(socketUrl, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        forceNew: false, // Reuse existing connection
        transports: ['websocket', 'polling']
      });
      
      // Setup connection event handlers
      socket.on('connect', () => {
        console.log('Connected to Socket.IO server with ID:', socket.id);
        
        // Start heartbeat to prevent disconnects
        startHeartbeat();
      });
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        
        // Stop heartbeat
        stopHeartbeat();
        
        // Handle different disconnect reasons
        if (reason === 'io server disconnect') {
          // The server has forcefully disconnected the socket
          console.log('Attempting to reconnect...');
          socket.connect();
        }
        // The socket will automatically try to reconnect for other reasons
      });
      
      socket.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
      });
      
      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Socket reconnection attempt #${attemptNumber}`);
      });
      
      socket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });
      
      socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
      });
      
      // Receive pong response from server
      socket.on('pong-client', () => {
        console.log('Received pong from server');
      });
      
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      return null;
    }
  }
  
  return socket;
};

// Start sending periodic heartbeats to keep connection alive
function startHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  heartbeatInterval = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit('ping-server');
      console.log('Ping sent to server');
    }
  }, 20000); // Send heartbeat every 20 seconds
}

// Stop heartbeat interval
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// Clean up function to be called when component unmounts
export const cleanupSocket = () => {
  stopHeartbeat();
  
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};