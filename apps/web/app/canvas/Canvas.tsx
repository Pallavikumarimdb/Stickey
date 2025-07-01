"use client";

import { useEffect, useRef, useState } from "react";
import { useCanvas } from "hooks/useCanvas";
import { WebSocketMessage } from "@repo/types/types";

interface CanvasProps {
  roomId: string;
  send: (msg: WebSocketMessage) => void;
  userId: string; 
  drawFromRemoteRef?: React.RefObject<(stroke: any) => void>;
}

export const Canvas = ({ roomId, send, userId, drawFromRemoteRef  }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const resizeCanvas = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    drawFromRemote,
  } = useCanvas(canvasRef, { send, roomId, userId });

  useEffect(() => {
    if (drawFromRemoteRef) {
      drawFromRemoteRef.current = drawFromRemote;
    }
  }, [drawFromRemoteRef, drawFromRemote]);

  

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className="w-full h-full bg-white touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};
