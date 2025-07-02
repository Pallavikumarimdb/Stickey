export interface Point {
  x: number;
  y: number;
}

export type ToolType = "pencil" | "rectangle" | "circle" | "arrow" | "diamond" | "text" | "eraser";


export interface Stroke {
  id: string;
   type: ToolType;
  points: Point[];
  color: string;
  width: number;
  text?: string;
  userId: string;
}
