//components/VideoCall/VideoCallUI.js
"use client";
import { useEffect, useRef, useState } from "react";
import { initSocket, cleanupSocket } from "@/lib/socket";

const VideoCallUI = ({ roomId }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const [localVideoOff, setLocalVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("initializing"); // "initializing", "connecting", "connected", "failed"
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Add to your VideoCallUI.js file, inside the useEffect
  // This prevents disconnections during development reloads
  useEffect(() => {
    // Preserve the connection across hot reloads during development
    if (process.env.NODE_ENV === "development") {
      window.addEventListener("beforeunload", (event) => {
        // Cancel the event to prevent the page from unloading
        event.preventDefault();
        // Chrome requires returnValue to be set
        event.returnValue = "";
      });
    }

    return () => {
      if (process.env.NODE_ENV === "development") {
        window.removeEventListener("beforeunload", () => {});
      }
    };
  }, []);

  // Setup the socket connection
  useEffect(() => {
    const setupSocket = async () => {
      try {
        setConnectionStatus("connecting");
        const socketInstance = await initSocket();
        if (!socketInstance) {
          console.error("Failed to initialize socket");
          setConnectionStatus("failed");
          return;
        }

        setSocket(socketInstance);

        // Join the room when socket is ready
        socketInstance.emit("join-room", roomId);
        setIsConnected(true);
        setConnectionStatus("connected");
        console.log(`Joined room: ${roomId}`);

        // Listen for another user joining the room
        socketInstance.on("user-connected", (userId) => {
          console.log(`User connected to room: ${userId}`);
          setRemoteUserId(userId);

          // Automatically start the call when another user joins
          // Small delay to ensure everything is ready
          setTimeout(() => {
            startCall(userId, socketInstance);
          }, 1000);
        });

        // Handle WebRTC signaling
        socketInstance.on("offer", async (offer, fromUserId) => {
          console.log("Received offer from", fromUserId);
          setRemoteUserId(fromUserId);

          try {
            if (!peerConnectionRef.current) {
              console.log("Creating peer connection for received offer");
              createPeerConnection(fromUserId, socketInstance);
            }

            const offerDesc = new RTCSessionDescription(offer);
            console.log("Setting remote description (offer)");
            await peerConnectionRef.current.setRemoteDescription(offerDesc);

            console.log("Creating answer");
            const answer = await peerConnectionRef.current.createAnswer();

            console.log("Setting local description (answer)");
            await peerConnectionRef.current.setLocalDescription(answer);

            console.log("Sending answer to", fromUserId);
            socketInstance.emit("answer", answer, roomId, fromUserId);
          } catch (error) {
            console.error("Error handling offer:", error);
          }
        });

        socketInstance.on("answer", async (answer, fromUserId) => {
          console.log("Received answer from", fromUserId);
          try {
            if (
              peerConnectionRef.current &&
              peerConnectionRef.current.signalingState !== "closed"
            ) {
              console.log("Setting remote description (answer)");
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(answer)
              );
            } else {
              console.warn(
                "Cannot set remote description - peer connection not available or closed"
              );
            }
          } catch (error) {
            console.error("Error handling answer:", error);
          }
        });

        socketInstance.on("ice-candidate", async (candidate, fromUserId) => {
          console.log("Received ICE candidate from", fromUserId);
          try {
            if (
              peerConnectionRef.current &&
              peerConnectionRef.current.remoteDescription
            ) {
              console.log("Adding ICE candidate");
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } else {
              console.warn(
                "Cannot add ICE candidate - peer connection not ready"
              );
            }
          } catch (error) {
            console.error("Error handling ICE candidate:", error);
          }
        });

        socketInstance.on("user-disconnected", (userId) => {
          console.log(`User disconnected: ${userId}`);
          if (userId === remoteUserId) {
            setRemoteUserId(null);
            setIsCallStarted(false);
            stopCallDurationTimer();

            // Clean up peer connection
            if (peerConnectionRef.current) {
              peerConnectionRef.current.close();
              peerConnectionRef.current = null;
            }

            // Clear remote video
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          }
        });

        // Handle socket disconnection
        socketInstance.on("disconnect", () => {
          console.log("Socket disconnected");
          setIsConnected(false);
          setConnectionStatus("failed");
        });

        // Handle socket reconnection
        socketInstance.on("reconnect", () => {
          console.log("Socket reconnected");
          setIsConnected(true);
          setConnectionStatus("connected");
          // Rejoin the room after reconnection
          socketInstance.emit("join-room", roomId);
        });
      } catch (error) {
        console.error("Socket setup error:", error);
        setConnectionStatus("failed");
      }
    };

    setupSocket();

    // Setup local video
    const setupLocalVideo = async () => {
      try {
        console.log("Requesting user media");
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(
          "Got local media stream with tracks:",
          stream
            .getTracks()
            .map(
              (t) => `${t.kind}:${t.id}(${t.enabled ? "enabled" : "disabled"})`
            )
        );

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          console.log("Setting local video stream");
          localVideoRef.current.srcObject = stream;

          // Ensure video starts playing
          localVideoRef.current.play().catch((err) => {
            console.error("Error playing local video:", err);
          });
        } else {
          console.warn("Local video ref not available");
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        alert(
          "Cannot access camera or microphone. Please check permissions and try again."
        );
      }
    };

    setupLocalVideo();

    // Cleanup
    return () => {
      stopCallDurationTimer();

      if (socket) {
        socket.off("user-connected");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
        socket.off("user-disconnected");
        socket.off("disconnect");
        socket.off("reconnect");
        socket.off("pong-client");
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      // Use the cleanup function from socket.js
      cleanupSocket();
    };
  }, [roomId]);

  // Start call duration timer
  const startCallDurationTimer = () => {
    if (durationIntervalRef.current) return;

    setCallDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  // Stop call duration timer
  const stopCallDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  // Format duration as mm:ss
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Create WebRTC peer connection
  const createPeerConnection = (userId, currentSocket) => {
    console.log(`Creating peer connection for user: ${userId}`);

    // STUN and TURN servers for NAT traversal
    const servers = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        // Free TURN servers - you should replace these with your own TURN server in production
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
      iceCandidatePoolSize: 10,
    };

    const pc = new RTCPeerConnection(servers);

    // Add local tracks to the peer connection
    if (localStreamRef.current) {
      console.log(
        `Adding ${
          localStreamRef.current.getTracks().length
        } local tracks to peer connection`
      );
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    } else {
      console.warn("No local stream available when creating peer connection");
    }

    // Handle incoming tracks (remote user's video/audio)
    pc.ontrack = (event) => {
      console.log("Received remote track", event.streams);
      if (remoteVideoRef.current && event.streams && event.streams[0]) {
        console.log("Setting remote video stream");
        remoteVideoRef.current.srcObject = event.streams[0];

        // Ensure video starts playing
        remoteVideoRef.current.play().catch((err) => {
          console.error("Error playing remote video:", err);
        });
      } else {
        console.warn("Could not set remote video:", {
          refExists: !!remoteVideoRef.current,
          streamsExist: !!event.streams,
          streamEmpty: event.streams && !event.streams[0],
        });
      }
    };

    // Store the socket locally to ensure it's available in callbacks
    const socketToUse = currentSocket || socket;

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Generated ICE candidate for", userId);
        if (socketToUse) {
          socketToUse.emit("ice-candidate", event.candidate, roomId, userId);
        } else {
          console.error("Socket not available when generating ICE candidate");
        }
      } else {
        console.log("All ICE candidates generated");
      }
    };

    // Monitor all connection state changes
    pc.onconnectionstatechange = (event) => {
      console.log("Connection state changed:", pc.connectionState);
      if (pc.connectionState === "connected") {
        console.log("Peers connected!");
        setIsCallStarted(true);
        startCallDurationTimer();
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected" ||
        pc.connectionState === "closed"
      ) {
        console.warn("Peer connection failed or closed", pc.connectionState);
        setIsCallStarted(false);
        stopCallDurationTimer();
      }
    };

    // Monitor ICE connection state
    pc.oniceconnectionstatechange = (event) => {
      console.log("ICE connection state changed:", pc.iceConnectionState);
      if (
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "disconnected"
      ) {
        console.warn("ICE connection failed or disconnected");
      }
    };

    // Monitor signaling state
    pc.onsignalingstatechange = (event) => {
      console.log("Signaling state changed:", pc.signalingState);
    };

    peerConnectionRef.current = pc;
  };

  // Start the call (initiate WebRTC connection)
  const startCall = async (userId, currentSocket) => {
    if (!userId) {
      console.warn("Cannot start call: no remote user ID provided");
      return;
    }

    // Use provided socket or the state socket
    const socketToUse = currentSocket || socket;

    if (!socketToUse) {
      console.error("Cannot start call: socket not connected");
      return;
    }

    try {
      console.log(`Starting call with user: ${userId}`);
      createPeerConnection(userId, socketToUse);

      // Create and send offer
      console.log("Creating offer");
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      console.log("Setting local description (offer)");
      await peerConnectionRef.current.setLocalDescription(offer);

      console.log("Sending offer to remote peer");
      socketToUse.emit("offer", offer, roomId, userId);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  // End the call
  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setIsCallStarted(false);
    setRemoteUserId(null);
    stopCallDurationTimer();

    // Inform the server
    if (socket) {
      socket.emit("leave-room", roomId);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setLocalMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setLocalVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      alert("Room ID copied to clipboard!");
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4">
      {/* Header with call info */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-t-lg text-white mb-4 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Video Call</h2>
          <div className="flex items-center mt-2">
            <div
              className={`h-3 w-3 rounded-full mr-2 ${
                isConnected ? "bg-green-400" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm">
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                ? "Connecting..."
                : "Connection failed"}
            </span>
          </div>
        </div>

        <div className="flex items-center mt-4 md:mt-0">
          <div className="bg-black bg-opacity-30 px-3 py-1 rounded-md flex items-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {isCallStarted ? formatDuration(callDuration) : "00:00"}
            </span>
          </div>

          <div
            className="flex items-center bg-black bg-opacity-30 px-3 py-1 rounded-md cursor-pointer"
            onClick={copyRoomId}
          >
            <span className="mr-2 text-sm">Room: {roomId}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
        <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-900 aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center">
              <div
                className={`h-3 w-3 rounded-full mr-2 ${
                  localVideoOff ? "bg-red-500" : "bg-green-400"
                }`}
              ></div>
              <div className="text-white font-medium">You</div>
              {localMuted && (
                <div className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Muted
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-900 aspect-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center">
              <div
                className={`h-3 w-3 rounded-full mr-2 ${
                  isCallStarted ? "bg-green-400" : "bg-gray-500"
                }`}
              ></div>
              <div className="text-white font-medium">Remote User</div>
            </div>
          </div>

          {!isCallStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
              {remoteUserId ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                  <p>Connecting...</p>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <p className="text-lg">Waiting for someone to join...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Share your room ID to invite others
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full mb-6">
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`flex items-center justify-center w-14 h-14 rounded-full ${
              localMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
            title={localMuted ? "Unmute" : "Mute"}
          >
            {localMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`flex items-center justify-center w-14 h-14 rounded-full ${
              localVideoOff
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
            title={localVideoOff ? "Turn Video On" : "Turn Video Off"}
          >
            {localVideoOff ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3l18 18"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={endCall}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="End Call"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3l18 18"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Connection info */}
      <div className="w-full bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center">
            <span className="font-semibold mr-2">Connection:</span>
            <div
              className={`h-2 w-2 rounded-full mr-1 ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">Socket ID:</span>
            <span className="font-mono">{socket?.id || "Not connected"}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">Room ID:</span>
            <span className="font-mono">{roomId}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">Call Status:</span>
            <span>{isCallStarted ? "Active call" : "Not in call"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallUI;
