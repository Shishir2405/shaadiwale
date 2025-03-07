"use client";

import { useState } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";

export default function Home() {
  const {
    localStream,
    remoteStream,
    callId,
    isWebcamStarted,
    isCallCreated,
    startWebcam,
    createCall,
    answerCall,
    hangupCall,
  } = useWebRTC();

  const [inputCallId, setInputCallId] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-extrabold text-center mb-6">
                  WebRTC Demo
                </h2>

                {/* Webcam Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">
                    1. Start your Webcam
                  </h3>
                  <button
                    onClick={startWebcam}
                    disabled={isWebcamStarted}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isWebcamStarted
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    }`}
                  >
                    {isWebcamStarted ? "Webcam Started" : "Start Webcam"}
                  </button>
                </div>

                {/* Video Streams */}
                {isWebcamStarted && (
                  <div className="flex justify-center space-x-4 mb-6">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">
                        Local Stream
                      </h4>
                      <video
                        ref={(video) => {
                          if (video && localStream)
                            video.srcObject = localStream;
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-w-md bg-gray-200 rounded-lg"
                      />
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">
                        Remote Stream
                      </h4>
                      <video
                        ref={(video) => {
                          if (video && remoteStream)
                            video.srcObject = remoteStream;
                        }}
                        autoPlay
                        playsInline
                        className="w-full max-w-md bg-gray-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Create Call Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">
                    2. Create a New Call
                  </h3>
                  <button
                    onClick={createCall}
                    disabled={!isWebcamStarted}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      !isWebcamStarted
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    }`}
                  >
                    Create Call
                  </button>
                  {callId && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-gray-600">
                        Call ID:{" "}
                        <span className="font-bold text-indigo-600">
                          {callId}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Join Call Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">3. Join a Call</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputCallId}
                      onChange={(e) => setInputCallId(e.target.value)}
                      placeholder="Enter Call ID"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={() => answerCall(inputCallId)}
                      disabled={!isWebcamStarted || !inputCallId}
                      className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        !isWebcamStarted || !inputCallId
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      }`}
                    >
                      Join Call
                    </button>
                  </div>
                </div>

                {/* Hangup Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">4. Hangup</h3>
                  <button
                    onClick={hangupCall}
                    disabled={!isWebcamStarted}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      !isWebcamStarted
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    }`}
                  >
                    Hangup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
