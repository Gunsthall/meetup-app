# Testing Without Redis

If you don't have Redis installed, you can use the mock Redis service for development.

## Quick Setup (No Redis Required)

### Step 1: Enable Mock Redis

```bash
cd server/src/services

# Backup real Redis service
mv redisService.ts redisService.real.ts

# Enable mock Redis
mv redisService.mock.ts redisService.ts
```

### Step 2: Start Backend

```bash
cd server
npm run dev
```

You'll see: `Mock Redis: Connected (in-memory storage)`

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

### Step 4: Test the App

Open http://localhost:5173 and test all features!

## Features

The mock Redis service:
- ✅ Stores sessions in memory
- ✅ Supports TTL (auto-expiration)
- ✅ Works exactly like real Redis
- ✅ No installation needed
- ⚠️ Data is lost when server restarts

## Limitations

- Data doesn't persist (in-memory only)
- Not suitable for production
- No clustering or advanced features

## Switch Back to Real Redis

When you have Redis installed:

```bash
cd server/src/services

# Restore real Redis
mv redisService.ts redisService.mock.ts
mv redisService.real.ts redisService.ts
```

## Alternative: Cloud Redis (Free)

### Upstash (Recommended)

1. Sign up: https://upstash.com/
2. Create database (free tier: 10,000 commands/day)
3. Copy Redis URL
4. Update `server/.env`:
   ```
   REDIS_URL=rediss://default:password@host.upstash.io:6379
   ```
5. Restart server

### Redis Cloud

1. Sign up: https://redis.com/try-free/
2. Create database (free tier: 30MB)
3. Copy connection string
4. Update `server/.env`
5. Restart server

## Install Redis Locally (Windows)

### Option 1: WSL (Recommended)
```bash
wsl --install
wsl
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

### Option 2: Memurai (Windows Native)
1. Download: https://www.memurai.com/
2. Install and start service
3. Use default: `redis://localhost:6379`

### Option 3: Windows Binary
1. Download: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`

## Verify Redis Connection

```bash
# Test connection
redis-cli ping
# Should respond: PONG

# Check if server is using Redis
curl http://localhost:3000/v1/health
# Check backend logs for Redis connection status
```

---

**For Development:** Mock Redis works perfectly!
**For Production:** Use real Redis or cloud service.
