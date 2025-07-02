import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage, WsDataType } from '@repo/types/types';

interface UseWebSocketReturn {
  send: (data: WebSocketMessage) => void;
  connectionId: string | null;
  isOwner: boolean;
  status: 'connecting' | 'open' | 'closed' | 'error';
}

export const useWebSocket = (
  roomId: string,
  token: string,
  onMessage: (msg: WebSocketMessage) => void,
  shouldConnect: boolean = true
): UseWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  const [isGuest, setIsGuest] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    if (!shouldConnect) return;

    const ws = new WebSocket(`ws://localhost:8080?roomId=${roomId}&token=${token}`);
    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => {
      setStatus('open');
      console.log('[WebSocket] Connected to room:', roomId);

    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        console.log("[WS MESSAGE RECEIVED]", data);

        if (data.type === WsDataType.CONNECTION_READY) {
          setConnectionId(data.connectionId ?? null);
          setIsOwner(data.isOwner ?? false);

          //.... These are custom fields coming in payload for role info .......
          const roleInfo = data.payload ?? {};

          setIsGuest(roleInfo.isGuest ?? false);
          setIsAuthenticated(roleInfo.isAuthenticated ?? false);

          console.log("[WebSocket] Connection Ready. Role Info:", {
            owner: data.isOwner,
            guest: roleInfo.isGuest,
            auth: roleInfo.isAuthenticated,
          });
        } else {
          onMessage(data);
        }

        
      } catch (err) {
        console.error("[WebSocket] Failed to parse message:", err);
      }
    };

    ws.onerror = (err) => {
      setStatus("error");
      console.error("[WebSocket] Error:", err);
    };


    ws.onclose = () => {
      setStatus('closed');
      console.warn('[WebSocket] Connection closed.');
    };

    return () => {
      ws.close();
    };
  }, [roomId, token, shouldConnect]);

  const send = (data: WebSocketMessage) => {
    
if (!wsRef.current) {
    console.error('WebSocket ref is null');
    return;
  }
  
  if (wsRef.current.readyState === WebSocket.OPEN) {
    const jsonString = JSON.stringify(data);

    try {
      wsRef.current.send(jsonString);
    } catch (error) {
      console.error(' Error sending to WebSocket:', error);
    }
  } else {
    console.warn('WebSocket not open. State:', wsRef.current.readyState);
    console.warn('Connection status:', status);
  }
};
  return { send, connectionId, isOwner, status };
};
