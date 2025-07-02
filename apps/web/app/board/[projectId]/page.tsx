'use client';
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { useWebSocket } from "hooks/useSocket";
import { useGuestToken } from "lib/utils/useGuestToken";
import { Canvas } from "@/canvas/Canvas";
import { Toolbar } from "@/canvas/Toolbar";
import { WebSocketMessage, WsDataType } from "@repo/types/types";
import { InviteButton } from "@/(dashboard)/_components/invite-button";
import { clearLocal } from "lib/utils/localStorage";
import { fetchStrokesFromDB } from "lib/strokes/strokes";
import { ToolType } from "types/canvasTools";
import { VideoCall } from "@/components/VideoCall";
import { useVideoWebRTC } from "hooks/useVideoWebRTC";


export default function ProjectPage() {
  const roomId = useParams().projectId as string;
  const [tool, setTool] = useState<ToolType>("pencil");
  const { data: session, status: sessionStatus } = useSession();
  const { guestToken, guestId, isGuestLoaded } = useGuestToken();
  const [guestIds, setGuestIds] = useState<string[]>([]);

  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [userName, setUserName] = useState("Guest");

  const drawFromRemoteRef = useRef<(stroke: any) => void>(() => { });

  const isAuthLoaded = sessionStatus !== "loading" && isGuestLoaded;
  const isAuthenticated = sessionStatus === "authenticated";

  const userId = isAuthenticated ? session!.user.id : guestId!;
  const token = isAuthenticated ? session!.accessToken : guestToken!;

  const shouldConnect = isAuthLoaded && !!token;


  const { send, connectionId, isOwner, status } = useWebSocket(
    roomId,
    token,
    (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.type === WsDataType.DRAW && msg.userId !== userId) {
        drawFromRemoteRef.current?.(msg.payload);
      }

      if (msg.type === WsDataType.SIGNAL) {
        onSignal(msg);
        return;
      }

      if (msg.type === WsDataType.CONNECTION_READY) {
        // Add guest to list (owner tracks all others)
        if (
          !msg.isOwner &&
          typeof msg.connectionId === "string" &&
          msg.connectionId !== connectionId
        ) {
          const connectionIdStr = msg.connectionId as string;
          setGuestIds((prev) =>
            prev.includes(connectionIdStr) ? prev : [...prev, connectionIdStr]
          );
        }
      }

      if (msg.userId === userId && msg.userName) {
        setUserName(msg.userName);
      }
    },
    shouldConnect
  );

  const {
    onSignal,
    connectToUser,
    localStream,
    isStreaming,
    startOwnStream,
    stopOwnStream,
    toggleMute,
    toggleVideo,
    isMuted,
    videoOff,
  } = useVideoWebRTC(send, roomId, userId);


  useEffect(() => {
    if (isAuthenticated) {
      fetchStrokesFromDB(roomId).then((strokes) => {
        if (!Array.isArray(strokes)) {
          console.warn("Invalid strokes from DB", strokes);
          return;
        }

        for (const stroke of strokes) {
          drawFromRemoteRef.current?.(stroke);
        }
        clearLocal(roomId);
      }).catch((err) => {
        console.error("Failed to fetch strokes", err);
      });
    }
  }, [roomId, isAuthenticated]);



  return (
    <>
      <div className="p-2 text-sm text-gray-600 flex justify-between items-center pr-20">
        <div>
          <Toolbar tool={tool} setTool={setTool} />
        </div>

        <div className="flex items-center gap-4">
          <div>
            You are: <strong>{session?.user?.name}</strong>{" "}
            {isOwner && <span className="text-blue-500">(Owner)</span>}
          </div>
          <InviteButton roomId={roomId} isOwner={isOwner} />
          <div>{status}</div>
        </div>
      </div>

      <VideoCall
        roomId={roomId}
        userId={userId}
        userName={userName}
        send={send}
        peers={guestIds}
        onSignal={onSignal}
        connectToUser={connectToUser}
        localStream={localStream.current}
        isOwner={isOwner}
        isStreaming={isStreaming}
        startOwnStream={startOwnStream}
        stopOwnStream={stopOwnStream}
        toggleMute={toggleMute}
        toggleVideo={toggleVideo}
        isMuted={isMuted}
        videoOff={videoOff}
      />




      <Canvas
        roomId={roomId}
        send={send}
        userId={userId}
        drawFromRemoteRef={drawFromRemoteRef}
        isAuthenticated={isAuthenticated}
        tool={tool}
      />
    </>
  );
}
