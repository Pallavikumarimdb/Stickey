"use client";

import { useRef, useState } from "react";
import { Stroke, Point, ToolType } from "types/canvasTools";
import { WebSocketMessage, WsDataType } from "@repo/types/types";
import { getFromLocal, overwriteLocal, saveToLocal } from "lib/utils/localStorage";
import debounce from "lodash.debounce";
import { deleteStrokeFromDB, saveStrokeToDB } from "lib/strokes/strokes";


interface UseCanvasProps {
  send: (msg: WebSocketMessage) => void;
  roomId: string;
  userId: string;
  userName?: string;
  tool: ToolType;
  color?: string;
  width?: number;
  isAuthenticated: boolean;
}
export function useCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  previewRef: React.RefObject<HTMLCanvasElement>,
  {
    send,
    roomId,
    userId,
    tool,
    userName = "",
    color = "#23ab2b",
    width = 2,
    isAuthenticated,
  }: UseCanvasProps
) {
  const [isDrawing, setIsDrawing] = useState(false);
  const points = useRef<Point[]>([]);
  const startPoint = useRef<Point | null>(null);
  const strokes = useRef<Stroke[]>([]);

  const ctx = () => canvasRef.current?.getContext("2d");
  const previewCtx = () => previewRef.current?.getContext("2d");

  const clearPreview = () => {
    const context = previewCtx();
    if (context && previewRef.current) {
      context.clearRect(
        0,
        0,
        previewRef.current.width,
        previewRef.current.height
      );
    }
  };


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
  };

  const drawStroke = (
    stroke: Stroke,
    context: CanvasRenderingContext2D | null = ctx()
  ) => {
    if (!context) return;

    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.width;
    context.lineJoin = "round";
    context.lineCap = "round";

    if (stroke.type === "pencil") {
      context.beginPath();
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];
        if (!p1 || !p2) continue;
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);
      }
      context.stroke();
      context.save();
      return;
    }

    const start = stroke.points[0];
    const end = stroke.points[1];
    if (!start || !end) return;

    switch (stroke.type) {
      case "rectangle":
        context.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;

      case "circle":
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        context.beginPath();
        context.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        context.stroke();
        break;

      case "arrow":
        drawArrow(context, start, end);
        break;

      case "diamond":
        drawDiamond(context, start, end);
        break;

      case "text":
        context.font = `${stroke.width * 10}px sans-serif`;
        context.fillStyle = stroke.color;
        context.fillText(stroke.text || "Text", start.x, start.y);
        break;
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
    const headlen = 10;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineTo(
      to.x - headlen * Math.cos(angle - Math.PI / 6),
      to.y - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headlen * Math.cos(angle + Math.PI / 6),
      to.y - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawDiamond = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    ctx.beginPath();
    ctx.moveTo(midX, start.y);
    ctx.lineTo(end.x, midY);
    ctx.lineTo(midX, end.y);
    ctx.lineTo(start.x, midY);
    ctx.closePath();
    ctx.stroke();
  };

  const redrawAll = (fromStrokes?: Stroke[]) => {
    const context = ctx();
    if (!context || !canvasRef.current) return;

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const cache = fromStrokes ?? getFromLocal(roomId);
    strokes.current = [...cache];

    for (const stroke of strokes.current) {
      drawStroke(stroke, context);
    }
  };



  function isPointNearStroke(point: Point, stroke: Stroke, tolerance = 5): boolean {
    const [start, end] = stroke.points;

    if (!start || !end) return false;
    switch (stroke.type) {
      case "pencil":
        return stroke.points.some(p =>
          Math.abs(p.x - point.x) < tolerance && Math.abs(p.y - point.y) < tolerance
        );

      case "rectangle":
      case "diamond":
        return (
          point.x >= Math.min(start.x, end.x) - tolerance &&
          point.x <= Math.max(start.x, end.x) + tolerance &&
          point.y >= Math.min(start.y, end.y) - tolerance &&
          point.y <= Math.max(start.y, end.y) + tolerance
        );

      case "circle":
        const dx = point.x - start.x;
        const dy = point.y - start.y;
        const radius = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return Math.abs(distance - radius) < tolerance;

      case "arrow":
        return isPointNearLine(point, start, end, tolerance);

      case "text":
        return (
          Math.abs(point.x - start.x) < 40 &&
          Math.abs(point.y - start.y) < 20
        );

      default:
        return false;
    }
  }

  function isPointNearLine(p: Point, a: Point, b: Point, tolerance = 5): boolean {
    const dist =
      Math.abs((b.y - a.y) * p.x - (b.x - a.x) * p.y + b.x * a.y - b.y * a.x) /
      Math.sqrt((b.y - a.y) ** 2 + (b.x - a.x) ** 2);
    return dist <= tolerance;
  }


  const handleMouseDown = (e: React.MouseEvent) => {
    const clickPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    if (tool === "eraser") {
      const indexToRemove = strokes.current.findIndex((stroke) =>
        isPointNearStroke(clickPoint, stroke)
      );

      if (indexToRemove !== -1) {
        const [removed] = strokes.current.splice(indexToRemove, 1);
        const updated = [...strokes.current];

        overwriteLocal(roomId, updated);

        if (isAuthenticated && removed) {
          deleteStrokeFromDB(roomId, removed.id);
        }

        const context = ctx();
        if (context && canvasRef.current) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          for (const stroke of updated) {
            drawStroke(stroke, context);
          }
        }
      }
      else {
        console.log("No stroke found near click.");
      }

      return;
    }

    redrawAll(strokes.current);
    setIsDrawing(true);
    startPoint.current = clickPoint;
    points.current = [clickPoint];

    if (tool === "text") {
      const text = prompt("Enter text:") || "Text";

      const stroke: Stroke = {
        id: crypto.randomUUID(),
        type: "text",
        points: [clickPoint],
        color,
        width,
        userId,
        text,
      };

      sendStroke(stroke);
      drawStroke(stroke);
      saveStroke(stroke);
      setIsDrawing(false);
    }
  };


  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const newPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    if (tool === "pencil") {
      points.current.push(newPoint);
      const prevPoint = points.current[points.current.length - 2];
      if (prevPoint) {
        drawStroke(
          {
            id: "",
            type: "pencil",
            points: [prevPoint, newPoint],
            color,
            width,
            userId,
          },
          ctx()
        );
      }
      return;
    }

    //......> ensure mouseup has [start, end] for all shape tools  .......>
    points.current[1] = newPoint;

    const preview = previewCtx();
    if (!startPoint.current || !preview) return;

    preview.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    drawStroke(
      {
        id: "",
        type: tool,
        points: [startPoint.current, newPoint],
        color,
        width,
        userId,
      },
      preview
    );
  };


  const handleMouseUp = () => {
    if (!startPoint.current) return;

    const end = points.current[points.current.length - 1] ?? startPoint.current;

    const stroke: Stroke = {
      id: crypto.randomUUID(),
      type: tool,
      points: tool === "pencil" ? points.current : [startPoint.current, end],
      color,
      width,
      userId,
    };


    clearPreview();
    drawStroke(stroke, ctx());
    sendStroke(stroke);
    saveStroke(stroke);

    setIsDrawing(false);
    points.current = [];
    startPoint.current = null;
  };

  const sendStroke = (stroke: Stroke) => {
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
    send(message);
  };

  const drawFromRemote = (stroke: Stroke) => {
    drawStroke(stroke);
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    drawFromRemote,
    redrawAll,
  };
}
