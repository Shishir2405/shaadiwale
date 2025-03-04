// lib/webrtc-service.js
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
};

export class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.roomId = null;
    this.roomRef = null;
    this.iceCandidates = new Set();
    this.onCallStateChange = null;
  }

  async initialize(localStream) {
    this.localStream = localStream;
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);
    
    // Add local tracks
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTransceiver(track, {
        streams: [this.localStream],
        direction: "sendrecv",
      });
    });

    // Handle remote stream
    this.peerConnection.ontrack = ({ streams: [stream] }) => {
      this.remoteStream = stream;
      this.onCallStateChange?.({ type: 'remote-stream', stream });
    };

    // Handle connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      this.onCallStateChange?.({
        type: 'connection-state',
        state: this.peerConnection.iceConnectionState,
      });
    };
  }

  async createRoom(userName) {
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peerConnection.setLocalDescription(offer);

      const roomData = {
        offer: { type: offer.type, sdp: offer.sdp },
        createdBy: userName,
        createdAt: serverTimestamp(),
        status: "waiting",
        localCandidates: [],
        remoteCandidates: [],
      };

      this.roomRef = await addDoc(collection(db, "rooms"), roomData);
      this.roomId = this.roomRef.id;

      // Handle ICE candidates
      this.peerConnection.onicecandidate = async ({ candidate }) => {
        if (candidate) {
          const candidateString = JSON.stringify(candidate.toJSON());
          if (!this.iceCandidates.has(candidateString)) {
            this.iceCandidates.add(candidateString);
            await this.updateICECandidates(candidate, true);
          }
        }
      };

      // Listen for remote peer
      this.setupRoomListener();

      return this.roomId;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  async joinRoom(roomId, userName) {
    try {
      this.roomId = roomId;
      this.roomRef = doc(db, "rooms", roomId);
      
      const roomSnapshot = await getDoc(this.roomRef);
      if (!roomSnapshot.exists()) {
        throw new Error("Room not found");
      }

      const { offer } = roomSnapshot.data();
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      await updateDoc(this.roomRef, {
        answer: { type: answer.type, sdp: answer.sdp },
        joinedBy: userName,
        joinedAt: serverTimestamp(),
      });

      // Handle ICE candidates
      this.peerConnection.onicecandidate = async ({ candidate }) => {
        if (candidate) {
          const candidateString = JSON.stringify(candidate.toJSON());
          if (!this.iceCandidates.has(candidateString)) {
            this.iceCandidates.add(candidateString);
            await this.updateICECandidates(candidate, false);
          }
        }
      };

      this.setupRoomListener();
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  }

  async updateICECandidates(candidate, isOffer) {
    try {
      const field = isOffer ? "localCandidates" : "remoteCandidates";
      const roomDoc = await getDoc(this.roomRef);
      const currentCandidates = roomDoc.data()?.[field] || [];

      await updateDoc(this.roomRef, {
        [field]: [...currentCandidates, candidate.toJSON()],
      });
    } catch (error) {
      console.error("Error updating ICE candidates:", error);
    }
  }

  setupRoomListener() {
    return onSnapshot(this.roomRef, async (snapshot) => {
      const data = snapshot.data();
      
      if (!this.peerConnection.currentRemoteDescription && data?.answer) {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }

      // Process ICE candidates
      const candidates = data?.remoteCandidates || [];
      for (const candidate of candidates) {
        const candidateString = JSON.stringify(candidate);
        if (!this.iceCandidates.has(candidateString)) {
          this.iceCandidates.add(candidateString);
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    });
  }

  async endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    if (this.roomRef) {
      await deleteDoc(this.roomRef);
    }

    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.roomId = null;
    this.roomRef = null;
    this.iceCandidates.clear();
  }

  toggleAudio(enabled) {
    this.localStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  toggleVideo(enabled) {
    this.localStream?.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
}

export const webRTCService = new WebRTCService();

