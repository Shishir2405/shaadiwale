// File: /app/api/socket/route.js
import { Server } from 'socket.io';
import { NextResponse } from 'next/server';

// Helper to initialize socket server
const initSocketServer = (res) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

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
  }
};

export async function GET(req) {
  const res = new Response();
  
  // Make NextResponse object from standard Response
  const nextRes = new NextResponse(res.body, res);
  
  // Add missing socket property
  if (!nextRes.socket) {
    nextRes.socket = req.socket;
  }
  
  // Add missing server property
  if (!nextRes.socket.server) {
    nextRes.socket.server = {};
  }
  
  // Initialize the socket server
  initSocketServer(nextRes);
  
  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
}