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

export default function ProjectPage() {
  const roomId = useParams().projectId as string;

  const { data: session, status: sessionStatus } = useSession();
  const { guestToken, guestId, isGuestLoaded } = useGuestToken();

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

      if (msg.userId === userId && msg.userName) {
        setUserName(msg.userName);
      }
    },
    shouldConnect
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchStrokesFromDB(roomId).then((strokes) => {
        for (const stroke of strokes) {
          drawFromRemoteRef.current?.(stroke);
        }
        clearLocal(roomId);
      });
    }
  }, [roomId, isAuthenticated]);

  return (
    <>
      <div className="p-2 text-sm text-gray-600 flex justify-between items-center bg-gray-50 border-b">
        <div>
          Room: <strong>{roomId}</strong>
        </div>

        <div className="flex items-center gap-4">
          <div>
            You are: <strong>{userName}</strong>{" "}
            {isOwner && <span className="text-blue-500">(Owner)</span>}
          </div>
          <InviteButton roomId={roomId} isOwner={isOwner} />
          <div>Status: {status}</div>
        </div>
      </div>

      <Canvas
        roomId={roomId}
        send={send}
        userId={userId}
        drawFromRemoteRef={drawFromRemoteRef}
        isAuthenticated={isAuthenticated}
      />
      <Toolbar />
    </>
  );
}
