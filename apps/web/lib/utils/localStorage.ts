import { Stroke } from "types/canvasTools";

export function saveToLocal(roomId: string, stroke: Stroke) {
  const key = `strokes:${roomId}`;
  const strokes = JSON.parse(localStorage.getItem(key) || '[]');
  strokes.push(stroke);
  localStorage.setItem(key, JSON.stringify(strokes));
}

export function getFromLocal(roomId: string): Stroke[] {
  const key = `strokes:${roomId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function clearLocal(roomId: string) {
  localStorage.removeItem(`strokes:${roomId}`);
}
