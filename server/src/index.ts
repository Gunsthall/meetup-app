import { config } from 'dotenv';
import { createServer } from 'http';
import app from './app.js';
import { setupWebSocket } from './websocket.js';
import { initRedis, closeRedis } from './services/redisService.js';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3000', 10);

async function start() {
  try {
    // Initialize Redis
    console.log('Connecting to Redis...');
    await initRedis();
    console.log('Redis connected');

    // Create HTTP server
    const server = createServer(app);

    // Setup WebSocket server
    console.log('Setting up WebSocket server...');
    setupWebSocket(server);
    console.log('WebSocket server ready');

    // Start server (listen on 0.0.0.0 for Cloud Run)
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`HTTP: http://localhost:${PORT}`);
      console.log(`WebSocket: ws://localhost:${PORT}/ws`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down gracefully...');
      await closeRedis();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
