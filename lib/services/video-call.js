'use client';

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
};

class VideoCallService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.currentRoom = null;
    this.callDoc = null;
    this.answerCandidates = null;
    this.offerCandidates = null;
    this.incomingCallHandler = null;
    this.remoteStreamHandler = null;
    this.unsubscribeFromCalls = null;
  }

  async setupPeerConnection(stream) {
    try {
      if (this.peerConnection) {
        this.cleanup();
      }

      this.peerConnection = new RTCPeerConnection(servers);
      this.localStream = stream;

      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      this.remoteStream = new MediaStream();
      
      if (this.peerConnection) {
        this.peerConnection.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            this.remoteStream.addTrack(track);
          });
          if (this.remoteStreamHandler) {
            this.remoteStreamHandler(this.remoteStream);
          }
        };

        this.peerConnection.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
        };

        this.peerConnection.onsignalingstatechange = () => {
          console.log('Signaling state:', this.peerConnection?.signalingState);
        };
      }

      return this.remoteStream;
    } catch (error) {
      console.error('Error setting up peer connection:', error);
      throw error;
    }
  }

  async createCall(callerId, recipientId, stream) {
    try {
      const callsRef = collection(db, 'calls');
      const newCallRef = doc(callsRef);
      const callId = newCallRef.id;

      this.callDoc = newCallRef;
      this.currentRoom = callId;

      await this.setupPeerConnection(stream);

      if (!this.peerConnection) {
        throw new Error('Failed to create peer connection');
      }

      const offerDescription = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offerDescription);

      const callData = {
        callerId,
        recipientId,
        status: 'pending',
        createdAt: serverTimestamp(),
        endedAt: null,
        participants: [callerId, recipientId],
        offer: {
          type: offerDescription.type,
          sdp: offerDescription.sdp
        }
      };

      await setDoc(newCallRef, callData);

      this.offerCandidates = collection(db, 'calls', callId, 'offerCandidates');
      this.answerCandidates = collection(db, 'calls', callId, 'answerCandidates');

      this.peerConnection.onicecandidate = async (event) => {
        if (event.candidate && this.offerCandidates) {
          try {
            await addDoc(this.offerCandidates, event.candidate.toJSON());
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      };

      const unsubscribeAnswer = onSnapshot(newCallRef, async (snapshot) => {
        const data = snapshot.data();
        if (!data?.answer || !this.peerConnection) return;

        if (!this.peerConnection.currentRemoteDescription && 
            this.peerConnection.signalingState === 'have-local-offer') {
          const answerDescription = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(answerDescription);
        }
      });

      const unsubscribeICE = onSnapshot(this.answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' && this.peerConnection) {
            const data = change.doc.data();
            if (!data) return;

            try {
              const candidate = new RTCIceCandidate(data);
              if (this.peerConnection.remoteDescription) {
                await this.peerConnection.addIceCandidate(candidate);
              }
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
        });
      });

      const originalCleanup = this.cleanup.bind(this);
      this.cleanup = () => {
        unsubscribeAnswer();
        unsubscribeICE();
        originalCleanup();
      };

      return callId;
    } catch (error) {
      console.error('Error creating call:', error);
      this.cleanup();
      throw error;
    }
  }

  async acceptCall(roomId, stream) {
    try {
      const callRef = doc(db, 'calls', roomId);
      const callSnapshot = await getDoc(callRef);
      
      if (!callSnapshot.exists()) {
        throw new Error('Call no longer exists');
      }

      this.callDoc = callRef;
      this.currentRoom = roomId;
      const callData = callSnapshot.data();

      await this.setupPeerConnection(stream);

      if (!this.peerConnection) {
        throw new Error('Failed to create peer connection');
      }

      const offerDescription = callData.offer;
      if (!offerDescription) {
        throw new Error('No offer found');
      }

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offerDescription)
      );

      const answerDescription = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answerDescription);

      this.offerCandidates = collection(db, 'calls', roomId, 'offerCandidates');
      this.answerCandidates = collection(db, 'calls', roomId, 'answerCandidates');

      this.peerConnection.onicecandidate = async (event) => {
        if (event.candidate && this.answerCandidates) {
          try {
            await addDoc(this.answerCandidates, event.candidate.toJSON());
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      };

      await updateDoc(callRef, {
        answer: {
          type: answerDescription.type,
          sdp: answerDescription.sdp
        },
        status: 'connected'
      });

      const unsubscribeICE = onSnapshot(this.offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' && this.peerConnection) {
            const data = change.doc.data();
            if (!data) return;

            try {
              const candidate = new RTCIceCandidate(data);
              await this.peerConnection.addIceCandidate(candidate);
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
        });
      });

      const originalCleanup = this.cleanup.bind(this);
      this.cleanup = () => {
        unsubscribeICE();
        originalCleanup();
      };

      return roomId;
    } catch (error) {
      console.error('Error accepting call:', error);
      this.cleanup();
      throw error;
    }
  }

  cleanup() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.currentRoom = null;
    this.callDoc = null;
    this.answerCandidates = null;
    this.offerCandidates = null;
    this.incomingCallHandler = null;
    this.remoteStreamHandler = null;
  }

  onIncomingCall(handler) {
    this.incomingCallHandler = handler;
    return () => {
      this.incomingCallHandler = null;
    };
  }

  onRemoteStream(handler) {
    this.remoteStreamHandler = handler;
    return () => {
      this.remoteStreamHandler = null;
    };
  }

  async checkForIncomingCall(userId) {
    if (this.unsubscribeFromCalls) {
      this.unsubscribeFromCalls();
    }

    try {
      this.unsubscribeFromCalls = onSnapshot(
        collection(db, 'calls'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const call = change.doc.data();
              if (
                call.status === 'pending' &&
                call.recipientId === userId &&
                !call.endedAt
              ) {
                const callData = {
                  callId: change.doc.id,
                  callerId: call.callerId,
                  ...call
                };
                
                if (this.incomingCallHandler) {
                  this.incomingCallHandler(callData);
                }
              }
            }
          });
        }
      );

      return this.unsubscribeFromCalls;
    } catch (error) {
      console.error('Error setting up call listener:', error);
      throw error;
    }
  }

  async endCall() {
    try {
      if (this.currentRoom && this.callDoc) {
        await updateDoc(this.callDoc, {
          status: 'ended',
          endedAt: serverTimestamp()
        });
      }
      this.cleanup();
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  }
}

const videoCallService = new VideoCallService();
export default videoCallService;