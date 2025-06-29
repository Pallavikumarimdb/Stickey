import z from 'zod'

export const SignUpFormSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string()
})

/* for understanding:--

// Enums are for representing fixed sets of values; interfaces are for defining data shapes and contracts.
// Enums define a set of named constants; interfaces define the structure of objects.
// Enums exist at runtime as JavaScript objects; interfaces do not.

*/

export enum WsDataType {
  CONNECTION_READY = "CONNECTION_READY",
  USER_JOINED = "USER_JOINED",
  USER_LEFT = "USER_LEFT",
  DRAW = "DRAW",
  UPDATE = "UPDATE",
  CURSOR_MOVE = "CURSOR_MOVE",
  STREAM_SHAPE = "STREAM_SHAPE",
  STREAM_UPDATE = "STREAM_UPDATE",
  ERASER = "ERASER",
  CLOSE_ROOM = "CLOSE_ROOM",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  EXISTING_PARTICIPANTS = "EXISTING_PARTICIPANTS",
  EXISTING_SHAPES = "EXISTING_SHAPES",
}

export type ProjectParticipants = {
  userId: string;
  userName: string;
};


export type WebSocketMessage = {
  type: WsDataType;
  userId: string;
  userName?: string;
  roomId: string;
  message: string | null;
  timestamp?: string;
  participants: ProjectParticipants[] | null;
  id?: string; // shape ID
  connectionId?: string;
  isOwner?: boolean;
  payload?: any;
};
