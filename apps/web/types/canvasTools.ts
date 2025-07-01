export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  type: "pencil";
  points: Point[];
  color: string;
  width: number;
  userId: string;
}
