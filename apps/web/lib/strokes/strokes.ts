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


export async function deleteStrokeFromDB(roomId: string, strokeId: string) {
  try {
    await fetch(`/api/strokes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, strokeId }),
    });
  } catch (err) {
    console.error("failed to delete stroke from DB", err);
  }
}