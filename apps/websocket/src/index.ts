
import dotenv from "dotenv";
import { WebSocketMessage, WsDataType } from '@repo/types/types';
import { publisher, subscriber } from './redis';
import { WebSocketServer, WebSocket } from "ws";
import { getProjectOwner } from '@repo/db/projectService';
import jwt, { JwtPayload } from "jsonwebtoken";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("jwt secret is required");
}

const JWT_SECRET = process.env.JWT_SECRET;

const wss = new WebSocketServer({ port: Number(process.env.PORT) || 8080 });

function authentication(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (typeof decoded === "string" || !decoded.id) return null;
    return {
      userName: decoded.name || "Guest",
      userId: decoded.id,
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

interface Message {
  type: string;
  [key: string]: any;
}

interface Connection {
  connectionId: string;
  userId: string;
  userName: string;
  ws: WebSocket;
  rooms: string[];
  isOwner: boolean;
}

const connections: Record<string, Connection> = {};
const roomMembers: Record<string, Set<string>> = {};
const roomOwners: Record<string, string> = {};
const roomStrokes: Record<string, WebSocketMessage[]> = {};
const subscribedChannels = new Set<string>();
const roomVideoEnabled: Record<string, boolean> = {}; 


function broadcast(roomId: string, message: Message, exclude: string[] = []) {
  const members = Array.from(roomMembers[roomId] || []);
  console.log("Members:", members);
  console.log("Message to broadcast:", JSON.stringify(message));

  members.forEach((connectionId) => {
    if (exclude.includes(connectionId)) return;

    const conn = connections[connectionId];
    if (conn?.ws.readyState === WebSocket.OPEN) {
      try {
        conn.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error("Broadcast failed:", connectionId, error);
        delete connections[connectionId];
        roomMembers[roomId]?.delete(connectionId);
      }
    }
  });
}

subscriber.on("message", (channel, msg) => {
  try {
    const parsed = JSON.parse(msg);
    const room = channel.split(":")[1];
    if (room) broadcast(room, parsed);
  } catch (err) {
    console.error("Redis message parse failed:", err);
  }
});

wss.on("connection", async (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  const roomId = url.searchParams.get('roomId');
  if (!roomId) return ws.close(1008, "Missing room ID");

  const auth = token ? authentication(token) : null;
  const userId = auth?.userId || `guest-${crypto.randomUUID()}`;
  const userName = auth?.userName || "Guest";
  const connectionId = crypto.randomUUID();

  const projectOwnerId = await getProjectOwner(roomId);
  const isProjectRoom = !!projectOwnerId;
  if (isProjectRoom && !auth?.userId) return ws.close(1008, "Unauthorized");

  const isOwner = projectOwnerId === userId;
  const isGuest = userId.startsWith("guest-");

  connections[connectionId] = { connectionId, userId, userName, ws, rooms: [roomId], isOwner };
  if (!roomMembers[roomId]) roomMembers[roomId] = new Set();
  roomMembers[roomId].add(connectionId);

  console.log(`[WS] ${userName} joined ${roomId} ${isOwner ? "(admin)" : isGuest ? "(guest)" : ""}`);

  if (roomStrokes[roomId]?.length) {
    roomStrokes[roomId].forEach((stroke) => {
      ws.send(JSON.stringify(stroke));
    });
  }

  ws.send(JSON.stringify({
    type: WsDataType.CONNECTION_READY,
    connectionId,
    isOwner,
    isGuest,
    payload: {
      isGuest,
      isAuthenticated: !!auth && !isGuest,
    },
  }));

  if (roomVideoEnabled[roomId]) {
    ws.send(JSON.stringify({
      type: "VIDEO_STREAM_ENABLED",
      roomId,
    }));
  }


  const redisChannel = `room:${roomId}`;
  if (!subscribedChannels.has(redisChannel)) {
    subscribedChannels.add(redisChannel);
    subscriber.subscribe(redisChannel, (err) => {
      if (err) console.error("Redis subscribe failed:", err);
    });
  }

  ws.on("message", (data) => {
    try {
      const raw = data.toString();
      const msg: WebSocketMessage = JSON.parse(raw);
      console.log("[WS RECEIVE]", msg);
      if (msg.type === "DRAW") {
        if (!msg.payload?.points?.length) {
          console.warn("Empty draw points received");
        }
        else {
          if (!roomStrokes[roomId]) roomStrokes[roomId] = [];
          roomStrokes[roomId].push(msg);
        }
      }
      else if (msg.type === "SIGNAL" && isOwner) {
        roomVideoEnabled[roomId] = true;
        broadcast(roomId, { type: "VIDEO_STREAM_ENABLED", roomId });
        return;
      }
      publisher.publish(redisChannel, JSON.stringify(msg));
      broadcast(roomId, msg, [connectionId]);
    } catch (err) {
      console.error("WebSocket message error:", err);
    }
  });

  ws.on("close", async () => {
    delete connections[connectionId];
    roomMembers[roomId]?.delete(connectionId);
    if (!roomMembers[roomId]?.size) {
      delete roomMembers[roomId];
      delete roomOwners[roomId];
      delete roomStrokes[roomId];
      delete roomVideoEnabled[roomId];
      console.log(`[WS] Room ${roomId} cleared.`);
    }
  });
});
