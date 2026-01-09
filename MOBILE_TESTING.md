# Mobile Testing Guide

## Quick Setup for Real Mobile Devices

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.0.x.x)

**Example output:**
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

### Step 2: Update Backend Configuration

Edit `server/.env`:
```env
PORT=3000
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://192.168.1.100:5173
CORS_ORIGIN=http://192.168.1.100:5173
```

**Replace `192.168.1.100` with YOUR computer's IP address!**

### Step 3: Update Frontend Configuration

Edit `frontend/.env`:
```env
VITE_API_URL=http://192.168.1.100:3000
VITE_WS_URL=ws://192.168.1.100:3000
```

**Replace `192.168.1.100` with YOUR computer's IP address!**

### Step 4: Restart Both Servers

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

### Step 5: Connect Your Mobile Device

1. **Connect your phone to the SAME Wi-Fi network** as your computer
2. **Open browser on your phone** (Safari on iOS, Chrome on Android)
3. **Navigate to:** `http://192.168.1.100:5173`
   - Replace with YOUR IP address from Step 1

### Step 6: Test the App

**On Phone 1 (Driver):**
1. Tap "I'm picking up someone"
2. Enter name "John"
3. Note the session code (e.g., "ABC123")
4. Grant location permissions

**On Phone 2 (Passenger) OR Second Browser:**
1. Enter the session code
2. Grant location permissions
3. You should see distance updating!

**Test Beacon:**
1. Tap "Activate Beacon" on both devices
2. You should see:
   - Large driver name
   - Session code
   - Distance
   - Flashing colored background

## Troubleshooting

### Phone Can't Connect

**Check 1: Same Network**
```bash
# On phone browser, try to ping your computer
http://192.168.1.100:5173
```

If it doesn't load, your phone and computer aren't on the same network.

**Check 2: Firewall**

Windows might block incoming connections. Allow Node.js:
1. Windows Defender Firewall → Allow an app
2. Find Node.js or add manually
3. Allow both Private and Public networks

**Check 3: Verify Server is Accessible**
```bash
# On your computer, test if accessible
curl http://192.168.1.100:3000/v1/health
```

### Location Not Working on Mobile

**iOS (Safari):**
- Settings → Safari → Privacy → Location Services → ON
- Must use HTTPS in production (localhost HTTP is OK for dev)

**Android (Chrome):**
- Settings → Site Settings → Location → Allow
- Grant permission when prompted

### WebSocket Connection Issues

**Check browser console on phone:**
1. Safari: Settings → Safari → Advanced → Web Inspector
2. Chrome: chrome://inspect

**Common issue:** Mixed content (HTTP page trying WSS)
- Solution: Use WS (not WSS) for development

### HTTPS for Production

For production mobile testing, you need HTTPS:

**Option 1: ngrok (Recommended)**
```bash
# Install ngrok
npm install -g ngrok

# Expose backend
ngrok http 3000
# You'll get: https://abc123.ngrok.io

# Expose frontend in another terminal
ngrok http 5173
# You'll get: https://xyz789.ngrok.io
```

Update env files with ngrok URLs.

**Option 2: Local SSL Certificate**
```bash
# Generate self-signed certificate
cd server
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

Update server to use HTTPS (requires code changes).

## Testing Checklist

### Basic Functionality
- [ ] Can access app on mobile browser
- [ ] Driver can create session
- [ ] Passenger can join with code
- [ ] Location permissions granted
- [ ] Distance displays correctly
- [ ] WebSocket connects (check console)

### Movement Testing
- [ ] Walk around with both phones
- [ ] Distance updates in real-time
- [ ] Distance is reasonably accurate

### Beacon Mode
- [ ] Tap "Activate Beacon"
- [ ] See driver name in large text
- [ ] See session code
- [ ] Background flashes with color
- [ ] Blink speed increases as you get closer
- [ ] Screen stays awake

### Sharing
- [ ] Tap "Share Link" (driver)
- [ ] Share via WhatsApp/SMS
- [ ] Passenger can join via shared link

### Performance
- [ ] App loads quickly
- [ ] No lag when updating location
- [ ] Smooth transitions
- [ ] Battery usage is acceptable

## Advanced: Multiple Phones

**Test with 3+ devices:**
1. Phone A: Driver
2. Phone B: Passenger
3. Laptop: Observer (watch both sessions)

**Real-world scenario:**
1. One person stays in one location (passenger)
2. Other person walks around (driver)
3. Watch distance change in real-time
4. Test beacon at different distances:
   - 100m+ (slow blink)
   - 50m (medium blink)
   - 20m (fast blink)
   - 10m (very fast)

## Tips for Better Testing

### GPS Accuracy
- Test outdoors for better GPS accuracy
- Indoor GPS can be 10-50m off
- Wait 30 seconds for GPS to stabilize

### Network Quality
- Good Wi-Fi is crucial
- Test on mobile data (requires HTTPS)
- Check WebSocket stays connected

### Battery Life
- Keep phones plugged in during testing
- Location tracking uses battery
- Screen wake lock uses battery

### Browser Choice
- **iOS:** Safari works best
- **Android:** Chrome works best
- Test PWA installation

## Production Deployment

For real production use with mobile devices:

1. **Deploy Frontend:** Vercel/Netlify (auto HTTPS)
2. **Deploy Backend:** Railway/Render (auto HTTPS)
3. **Use WSS:** WebSocket Secure
4. **Redis Cloud:** Upstash or Redis Cloud

Then access via public URL on any device!

---

**Quick Command Summary:**
```bash
# 1. Get IP
ipconfig

# 2. Update .env files with YOUR IP
# frontend/.env: VITE_API_URL=http://YOUR_IP:3000
# server/.env: FRONTEND_URL=http://YOUR_IP:5173

# 3. Restart servers
cd server && npm run dev
cd frontend && npm run dev

# 4. Open on phone: http://YOUR_IP:5173
```

Good luck testing! 📱🚀
