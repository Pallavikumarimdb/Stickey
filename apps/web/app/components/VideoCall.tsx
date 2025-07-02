"use client";

import { useState, useEffect } from "react";
import { WebSocketMessage } from "@repo/types/types";

interface Props {
  roomId: string;
  userId: string;
  userName: string;
  send: (msg: WebSocketMessage) => void;
  peers: string[];
  onSignal: (msg: WebSocketMessage) => void;
  connectToUser: (id: string) => void;
  localStream: MediaStream | null;

  isStreaming: boolean;
  isOwner: boolean;
  startOwnStream: () => void;
  stopOwnStream: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  isMuted: boolean;
  videoOff: boolean;
}

export function VideoCall({
  userId,
  peers,
  localStream,
  isOwner,
  isStreaming,
  startOwnStream,
  stopOwnStream,
  toggleMute,
  toggleVideo,
  isMuted,
  videoOff,
}: Props) {
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => {
    peers.forEach((id) => {
      if (id !== userId) {
      }
    });
  }, [peers.length]);

   useEffect(() => {
    if (showPanel && localStream && userId) {
      const localVideo = document.getElementById(`video-${userId}`) as HTMLVideoElement;
      if (localVideo && localStream) {
        localVideo.srcObject = localStream;
      }
    }
  }, [showPanel, localStream, userId]);

  return (
    <>
      <button
        className="fixed right-2 top-2 z-50 text-xl bg-gray-800 text-white rounded p-1"
        onClick={() => setShowPanel((prev) => !prev)}
      >
        {showPanel ? "✕" : "☰"}
      </button>
      {showPanel && (
        <div className="fixed top-16 right-2 w-60 max-h-[90vh] overflow-y-auto bg-white shadow-lg rounded-lg border p-3 flex flex-col gap-1 z-40">
          <div className="grid grid-cols-1 gap-2">
            {[userId, ...peers.filter((id) => id !== userId)].map((id) => (
              <div key={id} className="flex flex-col items-center">
                <video
                  id={`video-${id}`}
                  autoPlay
                  playsInline
                  muted={id === userId}
                  className="w-full h-32 bg-black rounded shadow"
                />
                <span className="text-xs text-gray-500">
                  {id === userId ? "You" : `User ${id.slice(0, 5)}`}
                </span>
              </div>
            ))}
          </div>

            <div className="flex flex-wrap gap-2 justify-center">
            {isOwner && !isStreaming && (
              <button
                onClick={startOwnStream}
                className=""
              >
                🎥
              </button>
            )}
            {isStreaming && (
              <>
                <button
                  onClick={toggleMute}
                  className=" text-white rounded"
                >
                  {isMuted ? "🎙️" : "🔇"}
                </button>
                <button
                  onClick={toggleVideo}
                  className=" text-white rounded"
                >
                  {videoOff ? "📹" : "📷"}
                </button>
                {isOwner && (
                  <button
                    onClick={stopOwnStream}
                    className=" text-white rounded"
                  >
                    🛑
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
