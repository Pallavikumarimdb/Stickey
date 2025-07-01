"use client";

import { useEffect, useRef, useState } from "react";
import { useCanvas } from "hooks/useCanvas";
import { WebSocketMessage } from "@repo/types/types";
import { ToolType } from "types/canvasTools";

interface CanvasProps {
  roomId: string;
  send: (msg: WebSocketMessage) => void;
  userId: string;
  isAuthenticated: boolean;
  tool: ToolType;
  drawFromRemoteRef?: React.RefObject<(stroke: any) => void>;
}

export const Canvas = ({ roomId, send, userId, drawFromRemoteRef, isAuthenticated, tool }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const previewRef = useRef<HTMLCanvasElement>(null!);


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
  } = useCanvas(canvasRef, previewRef, { send, roomId, userId, isAuthenticated, tool });

  useEffect(() => {
    if (drawFromRemoteRef) {
      drawFromRemoteRef.current = drawFromRemote;
    }
  }, [drawFromRemoteRef, drawFromRemote]);

  useEffect(() => {
    redrawAll();
  }, [canvasSize]);




  return (
    <div className="relative w-full h-full">
  <canvas
    ref={canvasRef}
    width={canvasSize.width}
    height={canvasSize.height}
    className="absolute top-0 left-0 z-10"
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
  />

  <canvas
    ref={previewRef}
    width={canvasSize.width}
    height={canvasSize.height}
    className="absolute top-0 left-0 z-20 pointer-events-none"
  />
</div>

  );
};
