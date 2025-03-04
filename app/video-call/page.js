//app/video-call/page.js
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import VideoCallUI from '@/components/VideoCall/VideoCallUI';

export default function VideoCallPage() {
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
}
