'use client';

import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.roomId = null;
    this.callDoc = null;
    this.offerCandidates = null;
    this.answerCandidates = null;
  }

  async setupPeerConnection(roomId, localStream) {
    this.roomId = roomId;
    this.localStream = localStream;
    this.peerConnection = new RTCPeerConnection(servers);
    this.remoteStream = new MediaStream();

    // Add local tracks to peer connection
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Listen for remote tracks
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };

    // References to Firestore collections
    this.callDoc = doc(db, 'calls', roomId);
    this.offerCandidates = collection(db, 'calls', roomId, 'offerCandidates');
    this.answerCandidates = collection(db, 'calls', roomId, 'answerCandidates');

    // Listen for ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(this.offerCandidates, event.candidate.toJSON());
      }
    };

    return this.remoteStream;
  }

  async createOffer() {
    const offerDescription = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
      createdAt: serverTimestamp(),
    };

    await setDoc(this.callDoc, { offer });

    // Listen for remote answer
    onSnapshot(this.callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!this.peerConnection.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.peerConnection.setRemoteDescription(answerDescription);
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(this.answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          this.peerConnection.addIceCandidate(candidate);
        }
      });
    });
  }

  async createAnswer() {
    const callData = (await getDoc(this.callDoc)).data();
    const offerDescription = callData.offer;
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answerDescription);

    const answer = {
      sdp: answerDescription.sdp,
      type: answerDescription.type,
    };

    await updateDoc(this.callDoc, { answer });

    // Listen for remote ICE candidates
    onSnapshot(this.offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          this.peerConnection.addIceCandidate(candidate);
        }
      });
    });
  }

  async endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    if (this.roomId) {
      // Delete the call document and all subcollections
      await deleteDoc(this.callDoc);
    }

    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.roomId = null;
  }
}

export default new WebRTCService();