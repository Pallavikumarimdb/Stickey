"use client";

import { useRef, useState } from "react";
import { Stroke, Point } from "types/canvasTools";
import { WebSocketMessage, WsDataType } from "@repo/types/types";
import { getFromLocal, saveToLocal } from "lib/utils/localStorage";
import debounce from "lodash.debounce";
import { saveStrokeToDB } from "lib/strokes/strokes";


interface UseCanvasProps {
  send: (msg: WebSocketMessage) => void;
  roomId: string;
  userId: string;
  userName?: string;
  color?: string;
  width?: number;
  isAuthenticated: boolean;
}

export function useCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  {
    send,
    roomId,
    userId,
    userName = "",
    color = "#23ab2b",
    width = 2,
    isAuthenticated,
  }: UseCanvasProps
) {
  const [isDrawing, setIsDrawing] = useState(false);
  const points = useRef<Point[]>([]);
  const strokes = useRef<Stroke[]>([]);

  const debouncedSaveToDB = debounce(async (roomId: string, stroke: Stroke) => {
    try {
      await saveStrokeToDB(roomId, stroke);
    } catch (err) {
      console.error("Failed to save stroke to DB", err);
    }
  }, 500);


  const saveStroke = (stroke: Stroke) => {
    strokes.current.push(stroke);
    saveToLocal(roomId, stroke);

    if (isAuthenticated) {
      debouncedSaveToDB(roomId, stroke);
    }
  }


  const drawLine = (points: Point[], strokeColor: string, strokeWidth: number) => {
    const context = canvasRef.current?.getContext("2d");
    if (!context || points.length < 2) return;

    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWidth;
    context.lineJoin = "round";
    context.lineCap = "round";

    context.beginPath();
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (p1 && p2) {
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);
      }
    }
    context.stroke();
  };

  const redrawAll = () => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const cached = getFromLocal(roomId);
    for (const stroke of cached) {
      drawLine(stroke.points, stroke.color, stroke.width);
      strokes.current.push(stroke);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    points.current = [{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const newPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    points.current.push(newPoint);
    if (points.current.length >= 2) {
      const prevPoint = points.current[points.current.length - 2];
      if (prevPoint) {
        drawLine([prevPoint, newPoint], color, width);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);

    const stroke: Stroke = {
      id: crypto.randomUUID(),
      type: "pencil",
      points: points.current,
      color,
      width,
      userId,
    };

    const message: WebSocketMessage = {
      type: WsDataType.DRAW,
      userId,
      userName,
      roomId,
      message: null,
      timestamp: new Date().toISOString(),
      participants: null,
      id: stroke.id,
      connectionId: undefined,
      payload: stroke,
    };

    try {
      send(message);
      console.log("message    --->  " + JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
    }
    saveStroke(stroke);
    points.current = [];
  };

  const drawFromRemote = (stroke: Stroke) => {
    drawLine(stroke.points, stroke.color, stroke.width);
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    drawFromRemote,
    redrawAll
  };
}
