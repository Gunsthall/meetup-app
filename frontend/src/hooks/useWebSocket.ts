import { useEffect, useRef, useState, useCallback } from 'react';
import type { Role, WSMessage, WSResponse } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

interface UseWebSocketOptions {
  sessionCode: string;
  role: Role;
  onMessage?: (message: WSResponse) => void;
}

/**
 * Hook to manage WebSocket connection for real-time updates
 */
export function useWebSocket({ sessionCode, role, onMessage }: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send message through WebSocket
  const sendMessage = useCallback((message: WSMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    let reconnectTimeout: number;
    let isMounted = true;

    const connect = () => {
      // Create WebSocket connection
      const url = `${WS_URL}/ws?code=${sessionCode}&role=${role}`;
      console.log('[WebSocket] Connecting to:', url);
      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const message: WSResponse = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      socket.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        setError('Connection error');
      };

      socket.onclose = (event) => {
        console.log('[WebSocket] Closed:', event.code, event.reason);
        setIsConnected(false);

        // Attempt reconnection after 3 seconds if unexpected close and still mounted
        if (isMounted && event.code !== 1000 && event.code !== 4000) {
          console.log('[WebSocket] Reconnecting in 3 seconds...');
          reconnectTimeout = setTimeout(() => {
            if (isMounted) {
              console.log('[WebSocket] Attempting reconnection...');
              connect();
            }
          }, 3000);
        }
      };

      ws.current = socket;
    };

    connect();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close(1000, 'Component unmounted');
      }
    };
  }, [sessionCode, role]);

  return {
    isConnected,
    error,
    sendMessage,
  };
}
