
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

declare module "http" {
  interface IncomingMessage {
    user: {
      id: string;
      email: string;
    };
  }
}

const wss = new WebSocketServer({ port: Number(process.env.PORT) || 8080 });

function authentication(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (typeof decoded == "string") {
      console.error("Decoded token is a string, expected object");
      return null;
    }
    if (!decoded.id) {
      console.error("No valid user ID in token");
      return null;
    }
    return {
      userName: decoded.name || "Guest",
      userId: decoded.id
    }
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
const subscribedChannels = new Set<string>();


function broadcast(roomId: string, message: Message, exclude: string[] = []) {
  roomMembers[roomId]?.forEach((connectionId) => {
    if (exclude.includes(connectionId)) return;

    const conn = connections[connectionId];
    if (conn?.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify(message));
    }
  });
}


wss.on('connection', async (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  if (!url) {
    console.error("No valid URL found in request");
    return;
  }

  const token = url.searchParams.get('token');
  const roomId = url.searchParams.get('roomId');

  console.log("New connection attempt to:", roomId);
  console.log("Token:", token);

  if (!roomId) {
    ws.close(1008, "Missing room ID");
    return;
  }

  const auth = token ? authentication(token) : null;

  const isAuthenticated = !!auth && !auth.userId?.startsWith("guest-");

  const userId = auth?.userId || `guest-${crypto.randomUUID()}`;
  const userName = auth?.userName || "Guest";

  const connectionId = crypto.randomUUID();

  const projectOwnerId = await getProjectOwner(roomId);
  const isProjectRoom = !!projectOwnerId;

  if (isProjectRoom && (!auth || !auth.userId)) {
    ws.close(1008, "Unauthorized access to project room");
    return;
  }


  const isOwner = projectOwnerId === userId;
  const isGuest = userId.startsWith("guest-");

  connections[connectionId] = {
    connectionId,
    userId,
    userName,
    ws,
    rooms: [roomId],
    isOwner,
  };

  if (!roomMembers[roomId]) roomMembers[roomId] = new Set();
  roomMembers[roomId].add(connectionId);

  console.log(`[WS] ${userName} joined ${roomId} ${isOwner ? "(admin)" : isGuest ? "(guest)" : ""}`);

  ws.send(
    JSON.stringify({
      type: WsDataType.CONNECTION_READY,
      connectionId,
      isOwner,
      isGuest,
      payload: {
        isGuest,
        isAuthenticated
      }
    })
  );

  const redisChannel = `room:${roomId}`;

  subscriber.subscribe(redisChannel);
  if (!subscribedChannels.has(redisChannel)) {
    subscribedChannels.add(redisChannel);
    subscriber.subscribe(redisChannel);

    subscriber.on("message", (_, msg) => {
      try {
        const parsed = JSON.parse(msg);
        broadcast(roomId, parsed);
      } catch (err) {
        console.error("Failed to parse Redis message", err);
      }
    });
  }

  ws.on("message", (raw) => {
    try {
      const msg: WebSocketMessage = JSON.parse(raw.toString());
      publisher.publish(redisChannel, JSON.stringify(msg));
      broadcast(roomId, msg, [connectionId]);
    } catch (err) {
      console.error("Invalid message", err);
    }
  });


  ws.on("close", async() => {
    delete connections[connectionId];
    roomMembers[roomId]?.delete(connectionId);

    const isRoomEmpty = roomMembers[roomId]?.size === 0;

    if (isRoomEmpty) {
      console.log(`[WS] Room ${roomId} is now empty.`);

      const projectOwnerId = await getProjectOwner(roomId);
      if (projectOwnerId === userId) {
        console.log(`[WS] Deleting room ${roomId} owned by ${userId}`);
        delete roomMembers[roomId];
        delete roomOwners[roomId];
      }
    }
  });
});