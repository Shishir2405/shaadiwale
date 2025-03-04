// File: /app/api/socketio/route.js
import { NextResponse } from 'next/server';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Create a custom HTTP server to handle Socket.IO connections for App Router
let io;

// Only instantiate the server once
if (!global.socketIOServer) {
  console.log('Creating Socket.IO HTTP server');
  
  // Create a basic HTTP server
  const httpServer = createServer();
  
  // Create Socket.IO server using the HTTP server
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  // Handle Socket.IO connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle room joining
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', socket.id);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle WebRTC signaling
    socket.on('offer', (offer, roomId, to) => {
      console.log(`Relaying offer from ${socket.id} to ${to} in room ${roomId}`);
      socket.to(to).emit('offer', offer, socket.id);
    });

    socket.on('answer', (answer, roomId, to) => {
      console.log(`Relaying answer from ${socket.id} to ${to} in room ${roomId}`);
      socket.to(to).emit('answer', answer, socket.id);
    });

    socket.on('ice-candidate', (candidate, roomId, to) => {
      console.log(`Relaying ICE candidate from ${socket.id} to ${to} in room ${roomId}`);
      socket.to(to).emit('ice-candidate', candidate, socket.id);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      io.emit('user-disconnected', socket.id);
    });
  });
  
  // Start the server on a different port to avoid conflicts
  httpServer.listen(3001, () => {
    console.log('Socket.IO server is running on port 3001');
  });
  
  // Store the server instance globally
  global.socketIOServer = io;
} else {
  // Reuse the existing Socket.IO server
  io = global.socketIOServer;
}

// API route handler
export async function GET(req) {
  return NextResponse.json({ 
    success: true, 
    message: 'Socket.IO server is running on port 3001'
  });
}