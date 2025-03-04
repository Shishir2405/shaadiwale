'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';

const VideoCallContext = createContext({});

export function VideoCallProvider({ children }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Listen for incoming calls
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', auth.currentUser.uid),
      (doc) => {
        const data = doc.data();
        if (data?.incomingCall && !isCalling) {
          setIncomingCall(data.incomingCall);
        }
      }
    );

    return () => unsubscribe();
  }, [isCalling]);

  const value = {
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,
    isCalling,
    setIsCalling,
    incomingCall,
    setIncomingCall,
    currentRoom,
    setCurrentRoom,
    isAudioEnabled,
    setIsAudioEnabled,
    isVideoEnabled,
    setIsVideoEnabled
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
}

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (context === undefined) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};