'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import VideoCallUI from '@/components/VideoCall/VideoCallUI';

// Create a separate component that uses useSearchParams
const VideoCallWithParams = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomId, setRoomId] = useState(null);
  
  useEffect(() => {
    // Get room ID from URL parameters
    const roomIdParam = searchParams.get('roomId');
    
    if (roomIdParam) {
      setRoomId(roomIdParam);
    } else {
      // Generate a random room ID if not provided
      const newRoomId = Math.random().toString(36).substring(2, 7);
      router.push(`/video-call?roomId=${newRoomId}`);
    }
  }, [searchParams, router]);
  
  if (!roomId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Video Call</h1>
      <VideoCallUI roomId={roomId} />
    </div>
  );
};

// Main page component with Suspense
export default function VideoCallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-pink-500" />
          <p className="mt-4 text-gray-600">Loading video call...</p>
        </div>
      </div>
    }>
      <VideoCallWithParams />
    </Suspense>
  );
}