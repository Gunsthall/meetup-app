# MeetUp Backend API

Backend server for the MeetUp PWA - Airport Driver-Passenger Meeting App.

## Features

- REST API for session management
- WebSocket server for real-time location sharing
- Redis for temporary session storage
- TypeScript for type safety

## Prerequisites

- Node.js 20+
- Redis server (local or remote)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

## Development

```bash
npm run dev
```

Server will start on http://localhost:3000

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## API Endpoints

### REST API

- `POST /v1/sessions` - Create new session
- `GET /v1/sessions/:code` - Get session info
- `POST /v1/sessions/:code/join` - Join session as passenger
- `POST /v1/sessions/:code/end` - End session
- `GET /v1/health` - Health check

### WebSocket

Connect to `ws://localhost:3000/ws?code=ABC123&role=driver`

## Docker

Build:
```bash
docker build -t meetup-backend .
```

Run:
```bash
docker run -p 3000:3000 --env-file .env meetup-backend
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `REDIS_URL` - Redis connection URL
- `FRONTEND_URL` - Frontend URL for share links
- `CORS_ORIGIN` - Allowed CORS origins
