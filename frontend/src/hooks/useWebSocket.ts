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
    // Create WebSocket connection
    const url = `${WS_URL}/ws?code=${sessionCode}&role=${role}`;
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const message: WSResponse = JSON.parse(event.data);
        onMessage?.(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    socket.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('Connection error');
    };

    socket.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);

      // Attempt reconnection after 3 seconds if unexpected close
      if (event.code !== 1000 && event.code !== 4000) {
        setTimeout(() => {
          console.log('Attempting to reconnect...');
        }, 3000);
      }
    };

    ws.current = socket;

    // Cleanup on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Component unmounted');
      }
    };
  }, [sessionCode, role, onMessage]);

  return {
    isConnected,
    error,
    sendMessage,
  };
}
