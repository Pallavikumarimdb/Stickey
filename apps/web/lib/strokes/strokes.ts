import { Stroke } from "types/canvasTools";

export const fetchStrokesFromDB = async (projectId: string): Promise<Stroke[]> => {
  const res = await fetch(`/api/shape/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch");

  const data = await res.json();
  return data.strokes;
};


export const saveStrokeToDB = async (roomId: string, stroke: Stroke) => {
  await fetch("/api/shape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, stroke }),
  });
};