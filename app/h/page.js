
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  
  const startNewCall = () => {
    // Generate a random room ID
    const newRoomId = Math.random().toString(36).substring(2, 7);
    router.push(`/video-call?roomId=${newRoomId}`);
  };
  
  const joinCall = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/video-call?roomId=${roomId}`);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Video Call App</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <div className="mb-6">
          <button
            onClick={startNewCall}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-medium"
          >
            Start a New Call
          </button>
        </div>
        
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Join an Existing Call</h2>
          <form onSubmit={joinCall}>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-md font-medium"
            >
              Join Call
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}