import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { sessionService } from './services/sessionService.js';
import { calculateDistance } from './utils/distance.js';
import { validateApiKey } from './services/apiKeyService.js';
import type { Role, WSMessage, WSResponse } from './types/index.js';

interface Client {
  ws: WebSocket;
  sessionCode: string;
  role: Role;
}

// Map of session code to array of clients
const clients = new Map<string, Client[]>();

/**
 * Setup WebSocket server
 */
export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    // Parse query parameters from URL
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');
    const role = url.searchParams.get('role') as Role | null;
    const apiKey = url.searchParams.get('apiKey');

    // Validate API key
    if (!apiKey) {
      ws.close(4001, 'Unauthorized: Missing API key');
      return;
    }

    const keyMetadata = await validateApiKey(apiKey);
    if (!keyMetadata) {
      ws.close(4001, 'Unauthorized: Invalid or expired API key');
      return;
    }

    console.log(`[WebSocket] Connection attempt from: ${keyMetadata.name} (${keyMetadata.type})`);

    // Validate connection params
    if (!code || !role || (role !== 'driver' && role !== 'passenger')) {
      ws.close(4000, 'Missing or invalid code/role parameters');
      return;
    }

    // Check if session exists
    const sessionExists = await sessionService.sessionExists(code);
    if (!sessionExists) {
      ws.close(4004, 'Session not found');
      return;
    }

    // Register client
    const client: Client = { ws, sessionCode: code, role };

    if (!clients.has(code)) {
      clients.set(code, []);
    }
    clients.get(code)!.push(client);

    console.log(`Client connected: ${code} as ${role}`);

    // Update session connection status
    await sessionService.setConnected(code, role, true);

    // Send initial session state to the newly connected client
    const session = await sessionService.getSession(code);
    if (session) {
      let distance: number | null = null;
      if (
        session.driver.latitude !== null &&
        session.driver.longitude !== null &&
        session.passenger.latitude !== null &&
        session.passenger.longitude !== null
      ) {
        distance = calculateDistance(
          session.driver.latitude,
          session.driver.longitude,
          session.passenger.latitude,
          session.passenger.longitude
        );
      }

      // Send to the newly connected client
      ws.send(JSON.stringify({
        type: 'state',
        session,
        distance,
      }));
    }

    // Broadcast connection to other party
    broadcastToSession(code, {
      type: 'connection',
      role,
      connected: true,
    });

    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        const msg: WSMessage = JSON.parse(data.toString());

        // Handle location update
        if (msg.type === 'location' && msg.latitude && msg.longitude) {
          await sessionService.updateLocation(code, role, {
            latitude: msg.latitude,
            longitude: msg.longitude,
          });

          // Get full session and calculate distance
          const session = await sessionService.getSession(code);
          if (!session) return;

          let distance: number | null = null;
          if (
            session.driver.latitude !== null &&
            session.driver.longitude !== null &&
            session.passenger.latitude !== null &&
            session.passenger.longitude !== null
          ) {
            distance = calculateDistance(
              session.driver.latitude,
              session.driver.longitude,
              session.passenger.latitude,
              session.passenger.longitude
            );
          }

          // Broadcast updated state to both parties
          broadcastToSession(code, {
            type: 'state',
            session,
            distance,
          });
        }

        // Handle session met
        if (msg.type === 'met') {
          await sessionService.markAsMet(code);
          broadcastToSession(code, {
            type: 'ended',
            reason: 'met',
          });

          // Clean up clients
          setTimeout(() => {
            const sessionClients = clients.get(code);
            if (sessionClients) {
              sessionClients.forEach((c) => {
                if (c.ws.readyState === WebSocket.OPEN) {
                  c.ws.close(1000, 'Session completed');
                }
              });
              clients.delete(code);
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
          })
        );
      }
    });

    // Handle client disconnect
    ws.on('close', async () => {
      console.log(`Client disconnected: ${code} as ${role}`);

      // Remove client from map
      const sessionClients = clients.get(code);
      if (sessionClients) {
        const filtered = sessionClients.filter((c) => c.ws !== ws);
        if (filtered.length === 0) {
          clients.delete(code);
        } else {
          clients.set(code, filtered);
        }
      }

      // Update session connection status
      await sessionService.setConnected(code, role, false);

      // Notify other party
      broadcastToSession(code, {
        type: 'connection',
        role,
        connected: false,
      });
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

/**
 * Broadcast message to all clients in a session
 */
function broadcastToSession(code: string, message: WSResponse) {
  const sessionClients = clients.get(code);
  if (!sessionClients) return;

  const data = JSON.stringify(message);

  sessionClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}
