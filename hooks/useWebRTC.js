// hooks/useWebRTC.js
import { useState, useCallback, useRef, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../lib/firebase";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callId, setCallId] = useState("");
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [isCallCreated, setIsCallCreated] = useState(false);

  const pcRef = useRef(null);

  // Initialize peer connection
  const initPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
    }
    pcRef.current = new RTCPeerConnection(servers);
    return pcRef.current;
  }, []);

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      // If webcam is already started, just return
      if (isWebcamStarted && localStream) {
        return localStream;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const pc = initPeerConnection();
      const remoteMediaStream = new MediaStream();

      // Push tracks from local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Pull tracks from remote stream
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteMediaStream.addTrack(track);
        });
        setRemoteStream(remoteMediaStream);
      };

      setLocalStream(stream);
      setRemoteStream(remoteMediaStream);
      setIsWebcamStarted(true);

      return stream;
    } catch (error) {
      console.error("Error starting webcam:", error);
      setIsWebcamStarted(false);
      throw error;
    }
  }, [isWebcamStarted, localStream, initPeerConnection]);

  // Create a call
  const createCall = useCallback(async () => {
    try {
      // Ensure webcam is started
      if (!isWebcamStarted || !localStream) {
        await startWebcam();
      }

      // Reinitialize peer connection
      const pc = initPeerConnection();

      // Reference Firestore collections for signaling
      const callDocRef = doc(collection(firestore, "calls"));
      const offerCandidatesRef = collection(callDocRef, "offerCandidates");
      const answerCandidatesRef = collection(callDocRef, "answerCandidates");

      setCallId(callDocRef.id);

      // Get candidates for caller, save to db
      pc.onicecandidate = (event) => {
        event.candidate && addDoc(offerCandidatesRef, event.candidate.toJSON());
      };

      // Add local stream tracks to peer connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Create offer
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await setDoc(callDocRef, { offer });

      // Set call created state
      setIsCallCreated(true);

      // Listen for remote answer
      onSnapshot(callDocRef, (snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      // When answered, add candidate to peer connection
      onSnapshot(answerCandidatesRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });

      return callDocRef.id;
    } catch (error) {
      console.error("Error creating call:", error);
      setIsCallCreated(false);
      throw error;
    }
  }, [isWebcamStarted, localStream, startWebcam, initPeerConnection]);

  // Answer a call
  const answerCall = useCallback(
    async (inputCallId) => {
      try {
        // Ensure we have a local stream (webcam started)
        if (!isWebcamStarted || !localStream) {
          await startWebcam();
        }

        // Reinitialize peer connection
        const pc = initPeerConnection();

        const callDocRef = doc(firestore, "calls", inputCallId);
        const answerCandidatesRef = collection(callDocRef, "answerCandidates");
        const offerCandidatesRef = collection(callDocRef, "offerCandidates");

        pc.onicecandidate = (event) => {
          event.candidate &&
            addDoc(answerCandidatesRef, event.candidate.toJSON());
        };

        // Add local stream tracks to peer connection
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });

        const callData = (await getDoc(callDocRef)).data();
        if (!callData) {
          console.error("No call data found");
          return;
        }

        const offerDescription = callData.offer;
        await pc.setRemoteDescription(
          new RTCSessionDescription(offerDescription)
        );

        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };

        await updateDoc(callDocRef, { answer });

        onSnapshot(offerCandidatesRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              pc.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });
      } catch (error) {
        console.error("Error answering call:", error);
      }
    },
    [isWebcamStarted, localStream, startWebcam, initPeerConnection]
  );

  // Hangup call
  const hangupCall = useCallback(() => {
    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Stop tracks
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());

    // Reset states
    setLocalStream(null);
    setRemoteStream(null);
    setIsWebcamStarted(false);
    setCallId("");
    setIsCallCreated(false);
  }, [localStream, remoteStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hangupCall();
    };
  }, [hangupCall]);

  return {
    localStream,
    remoteStream,
    callId,
    isWebcamStarted,
    isCallCreated,
    startWebcam,
    createCall,
    answerCall,
    hangupCall,
  };
};
