"use client";

import { useEffect, useRef, useState } from "react";
import { useCanvas } from "hooks/useCanvas";
import { WebSocketMessage } from "@repo/types/types";

interface CanvasProps {
  roomId: string;
  send: (msg: WebSocketMessage) => void;
  userId: string; 
  isAuthenticated: boolean;
  drawFromRemoteRef?: React.RefObject<(stroke: any) => void>;
}

export const Canvas = ({ roomId, send, userId, drawFromRemoteRef, isAuthenticated  }: CanvasProps) => {
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
    redrawAll,
  } = useCanvas(canvasRef, { send, roomId, userId, isAuthenticated  });

  useEffect(() => {
    if (drawFromRemoteRef) {
      drawFromRemoteRef.current = drawFromRemote;
    }
  }, [drawFromRemoteRef, drawFromRemote]);

  useEffect(() => {
    redrawAll();
  }, [canvasSize]); 


  

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
