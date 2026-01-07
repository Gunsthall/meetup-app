# Quick Start Guide

Get the MeetUp app running in 5 minutes!

## Prerequisites

Make sure you have installed:
- Node.js 20+ ([Download](https://nodejs.org/))
- Redis ([Docker](https://www.docker.com/) or [Local Install](https://redis.io/download))

## Step 1: Start Redis

### Option A: Use Mock Redis (No Installation)

```bash
cd server/src/services
mv redisService.ts redisService.real.ts
mv redisService.mock.ts redisService.ts
cd ../../..
```

**Skip to Step 2!**

### Option B: Use Real Redis

**Using Docker:**
```bash
docker run -d -p 6379:6379 --name meetup-redis redis:alpine
```

**Or local Redis:**
```bash
redis-server
```

**Or cloud Redis (Upstash):**
1. Sign up at https://upstash.com/
2. Create database
3. Update `server/.env` with Redis URL

## Step 2: Start Backend

Open a new terminal:
```bash
cd server
npm install
npm run dev
```

You should see:
```
Redis connected
Server running on port 3000
```

## Step 3: Start Frontend

Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

You should see:
```
Local: http://localhost:5173
```

## Step 4: Test the App

1. Open http://localhost:5173 in your browser
2. Click "I'm picking up someone"
3. Enter a name (e.g., "John")
4. You'll get a session code like "ABC123"
5. Open a new incognito window and enter that code
6. Grant location permissions on both tabs
7. See the distance update in real-time!

## Troubleshooting

### Redis Connection Error
- Make sure Redis is running: `docker ps` or `redis-cli ping`
- Check REDIS_URL in server/.env

### Location Not Working
- Use HTTPS or localhost (required for geolocation)
- Grant location permissions when prompted
- Check browser console for errors

### WebSocket Not Connecting
- Check that backend is running on port 3000
- Verify VITE_WS_URL in frontend/.env
- Check browser console for connection errors

### Build Errors
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`

## Next Steps

- Read the full [README.md](README.md) for deployment instructions
- Check the technical specification document in the project root
- Customize the app to your needs

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Backend: Changes are auto-detected by tsx
- Frontend: Vite provides instant HMR

### Environment Variables
Create `.env` files (from `.env.example`):
- `server/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

### Testing with Mobile Devices
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update frontend/.env: `VITE_API_URL=http://YOUR_IP:3000`
3. Update server/.env: `CORS_ORIGIN=http://YOUR_IP:5173`
4. Restart both servers
5. Access `http://YOUR_IP:5173` from your phone

**Note:** Your computer and phone must be on the same network!

---

Happy coding! 🚀
