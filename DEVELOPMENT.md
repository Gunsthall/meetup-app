# Development Guide

## Development Workflow

### Initial Setup

1. **Clone and Install**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Backend
   cd server
   cp .env.example .env
   # Edit .env if needed

   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env if needed
   ```

3. **Start Redis**
   ```bash
   docker run -d -p 6379:6379 --name meetup-redis redis:alpine
   ```

### Daily Development

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Redis (if needed):**
```bash
redis-cli
# Useful commands:
# KEYS * - List all keys
# GET session:ABC123 - Get session data
# FLUSHALL - Clear all data
```

## Code Structure

### Backend Architecture

```
server/src/
├── index.ts              # Entry point, server startup
├── app.ts                # Express app configuration
├── websocket.ts          # WebSocket server logic
├── routes/
│   ├── sessions.ts       # Session REST endpoints
│   └── health.ts         # Health check endpoint
├── services/
│   ├── redisService.ts   # Redis connection & helpers
│   └── sessionService.ts # Session business logic
├── types/
│   └── index.ts          # Shared TypeScript interfaces
└── utils/
    ├── codeGenerator.ts  # Generate session codes
    ├── distance.ts       # Haversine distance calc
    └── visualGenerator.ts# Color & vibration patterns
```

### Frontend Architecture

```
frontend/src/
├── main.tsx              # Entry point
├── App.tsx               # Root component with routing
├── pages/
│   ├── Home.tsx          # Landing page
│   ├── Driver.tsx        # Driver session creation
│   ├── Passenger.tsx     # Passenger join
│   ├── Active.tsx        # Active tracking view
│   └── Beacon.tsx        # Full-screen beacon
├── components/
│   └── common/           # Reusable UI components
├── contexts/
│   └── SessionContext.tsx# Global state management
├── hooks/
│   ├── useGeolocation.ts # GPS tracking
│   ├── useWebSocket.ts   # Real-time communication
│   ├── useVibration.ts   # Haptic feedback
│   └── useWakeLock.ts    # Screen wake lock
├── utils/
│   ├── api.ts            # REST API client
│   ├── distance.ts       # Distance calculations
│   ├── blinkSpeed.ts     # Proximity feedback
│   └── vibration.ts      # Vibration helpers
└── types/
    └── index.ts          # TypeScript interfaces
```

## Making Changes

### Adding a New API Endpoint

1. **Define types** in `server/src/types/index.ts`
2. **Add route** in `server/src/routes/sessions.ts`
3. **Add service method** in `server/src/services/sessionService.ts`
4. **Test** with curl or Postman

Example:
```typescript
// In routes/sessions.ts
router.get('/:code/status', async (req, res) => {
  const { code } = req.params;
  const session = await sessionService.getSession(code);
  res.json({ status: session?.status });
});
```

### Adding a New Component

1. **Create component** in appropriate folder
2. **Import in parent** component or page
3. **Style with Tailwind** classes

Example:
```tsx
// frontend/src/components/common/Badge.tsx
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
      {children}
    </span>
  );
}
```

### Adding a New Hook

1. **Create hook** in `frontend/src/hooks/`
2. **Use in component**

Example:
```typescript
// frontend/src/hooks/useSessionTimer.ts
import { useState, useEffect } from 'react';

export function useSessionTimer(expiresAt: number) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, expiresAt - Date.now()));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return timeLeft;
}
```

## Testing

### Manual Testing

**Test Session Flow:**
```bash
# Terminal 1: Create session
curl -X POST http://localhost:3000/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"driverName":"John"}'

# Terminal 2: Get session
curl http://localhost:3000/v1/sessions/ABC123

# Terminal 3: Join session
curl -X POST http://localhost:3000/v1/sessions/ABC123/join
```

**Test WebSocket:**
```javascript
// Browser console
const ws = new WebSocket('ws://localhost:3000/ws?code=ABC123&role=driver');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'location', latitude: 41.2971, longitude: 2.0785 }));
```

### Browser Testing

**Location Testing:**
- Chrome DevTools → Sensors → Override geolocation
- Set custom lat/lng to simulate movement

**Mobile Testing:**
1. Find your IP: `ipconfig` or `ifconfig`
2. Update `.env` files with your IP
3. Access from phone on same network

### Debugging

**Backend:**
```typescript
// Add console.log in services
console.log('Session created:', session);

// Check Redis data
redis-cli
> KEYS *
> GET session:ABC123
```

**Frontend:**
```typescript
// Add console.log in hooks
console.log('Location updated:', latitude, longitude);

// React DevTools
// Components → SessionProvider → hooks
```

## Build & Deploy

### Local Production Build

**Backend:**
```bash
cd server
npm run build      # Compiles to dist/
npm start          # Runs compiled code
```

**Frontend:**
```bash
cd frontend
npm run build      # Builds to dist/
npm run preview    # Preview production build
```

### Docker

**Build Backend Image:**
```bash
cd server
docker build -t meetup-backend .
docker run -p 3000:3000 --env-file .env meetup-backend
```

### Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set CORS_ORIGIN to production frontend URL
- [ ] Configure Redis production instance
- [ ] Test WebSocket connections work over HTTPS/WSS
- [ ] Verify geolocation works on deployed frontend
- [ ] Test PWA installation
- [ ] Check service worker registration

## Common Issues

### Redis Connection Failed
```bash
# Check if Redis is running
docker ps | grep redis

# Start if not running
docker start meetup-redis

# Check connection
redis-cli ping
```

### WebSocket Not Connecting
- Ensure backend is running
- Check VITE_WS_URL in frontend/.env
- Open browser console for errors
- Verify CORS settings

### Location Not Working
- Must use HTTPS or localhost
- Check browser permissions
- Try different browser
- Check browser console

### Build Errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
npm run build
```

## Git Workflow

```bash
# Feature branch
git checkout -b feature/your-feature
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature

# Create PR and merge

# Update main
git checkout main
git pull origin main
```

## Performance Tips

### Backend:
- Use Redis pipelining for bulk operations
- Add request logging middleware
- Implement rate limiting for production
- Monitor WebSocket connections

### Frontend:
- Lazy load pages with React.lazy()
- Memoize expensive calculations
- Debounce location updates
- Optimize images and assets

## Code Style

### TypeScript:
- Use strict mode
- Define interfaces for all data
- Avoid `any` type
- Use optional chaining

### React:
- Functional components only
- Custom hooks for logic
- Props destructuring
- Tailwind for styling

### General:
- Descriptive variable names
- Comments for complex logic
- Keep functions small
- DRY principle

---

Happy coding! 🚀
