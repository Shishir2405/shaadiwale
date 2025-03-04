// File: /app/api/socketio/route.js
import { NextResponse } from "next/server";
import { createServer } from "http";
import { Server } from "socket.io";

// Track active connections and rooms
const activeRooms = new Map();
const activeConnections = new Set();

// Create a global variable for the server instance
let io;
let httpServer;

export async function GET(req) {
  // Only create the Socket.IO server if it doesn't exist
  if (!global.socketIOServer) {
    try {
      console.log("Creating Socket.IO HTTP server");

      // Create a basic HTTP server
      httpServer = createServer();

      // Create Socket.IO server with more robust configuration
      io = new Server(httpServer, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
        connectTimeout: 45000,
        pingTimeout: 60000, // Longer ping timeout
        pingInterval: 25000, // More frequent pings
        transports: ["websocket", "polling"], // Enable fallback
        allowUpgrades: true,
        upgradeTimeout: 30000,
        maxHttpBufferSize: 1e8, // 100 MB
      });

      // Handle Socket.IO connections
      io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        activeConnections.add(socket.id);

        // Log active connections
        console.log(
          `Active connections: ${Array.from(activeConnections).join(", ")}`
        );

        // Handle ping to keep connection alive
        socket.on("ping-server", () => {
          socket.emit("pong-client");
        });

        // Handle room joining
        socket.on("join-room", (roomId) => {
          socket.join(roomId);

          // Track room membership
          if (!activeRooms.has(roomId)) {
            activeRooms.set(roomId, new Set());
          }
          activeRooms.get(roomId).add(socket.id);

          // Announce to room
          socket.to(roomId).emit("user-connected", socket.id);
          console.log(`User ${socket.id} joined room ${roomId}`);
          console.log(
            `Room ${roomId} has members: ${Array.from(
              activeRooms.get(roomId)
            ).join(", ")}`
          );
        });

        // Handle WebRTC signaling
        socket.on("offer", (offer, roomId, to) => {
          console.log(
            `Relaying offer from ${socket.id} to ${to} in room ${roomId}`
          );
          socket.to(to).emit("offer", offer, socket.id);
        });

        socket.on("answer", (answer, roomId, to) => {
          console.log(
            `Relaying answer from ${socket.id} to ${to} in room ${roomId}`
          );
          socket.to(to).emit("answer", answer, socket.id);
        });

        socket.on("ice-candidate", (candidate, roomId, to) => {
          console.log(
            `Relaying ICE candidate from ${socket.id} to ${to} in room ${roomId}`
          );
          socket.to(to).emit("ice-candidate", candidate, socket.id);
        });

        // Handle explicit room leaving
        socket.on("leave-room", (roomId) => {
          leaveRoom(socket, roomId);
        });

        // Handle disconnections
        socket.on("disconnect", () => {
          console.log(`User disconnected: ${socket.id}`);
          activeConnections.delete(socket.id);

          // Remove from all rooms
          activeRooms.forEach((members, roomId) => {
            if (members.has(socket.id)) {
              leaveRoom(socket, roomId);
            }
          });
        });
      });

      // Helper function to handle leaving a room
      function leaveRoom(socket, roomId) {
        socket.leave(roomId);

        // Update room tracking
        if (activeRooms.has(roomId)) {
          const roomMembers = activeRooms.get(roomId);
          roomMembers.delete(socket.id);

          // Notify others in the room
          io.to(roomId).emit("user-disconnected", socket.id);

          console.log(`User ${socket.id} left room ${roomId}`);

          // Clean up empty rooms
          if (roomMembers.size === 0) {
            activeRooms.delete(roomId);
            console.log(`Room ${roomId} is now empty and removed`);
          } else {
            console.log(
              `Room ${roomId} has members: ${Array.from(roomMembers).join(
                ", "
              )}`
            );
          }
        }
      }

      // Find an available port (prefer 3001, but try others if needed)
      const port = process.env.SOCKET_PORT || 3001;

      // Start the server
      httpServer.listen(port, () => {
        console.log(`Socket.IO server is running on port ${port}`);
      });

      // Store the server instance globally
      global.socketIOServer = io;
    } catch (error) {
      console.error("Error creating Socket.IO server:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to start Socket.IO server",
          error: error.message,
        },
        { status: 500 }
      );
    }
  } else {
    // Reuse the existing Socket.IO server
    io = global.socketIOServer;
    console.log("Using existing Socket.IO server");

    // Log current status
    console.log(`Active connections: ${activeConnections.size}`);
    console.log(`Active rooms: ${activeRooms.size}`);
  }

  // Return success response
  return NextResponse.json({
    success: true,
    message: "Socket.IO server is running",
    port: process.env.SOCKET_PORT || 3001,
    activeConnections: activeConnections.size,
    activeRooms: Array.from(activeRooms.keys()),
  });
}
