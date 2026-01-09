# MeetUp App - Production Deployment

## ✅ LIVE IN PRODUCTION

**Deployed:** January 9, 2026
**Region:** europe-west3 (Frankfurt, Germany)
**Status:** Ready for MVP Testing

## Live URLs

### 🌐 Frontend (PWA)
```
https://meetup-frontend-1012349016840.europe-west3.run.app
```
Open this URL on your phone to use the app!

### 🔌 Backend API
```
https://meetup-backend-1012349016840.europe-west3.run.app
```

### 📊 Analytics Dashboard
```
https://meetup-backend-1012349016840.europe-west3.run.app/v1/analytics/dashboard
```
Monitor usage, sessions, and detect viral spread.

---

## Infrastructure Details

### Google Cloud Project
- **Project ID:** `meetup-app-001`
- **Region:** `europe-west3` (Frankfurt)
- **Services:** Cloud Run, Redis (Memorystore), VPC Access

### Redis Instance
- **Name:** `meetup-redis`
- **IP:** `10.189.125.115:6379`
- **Tier:** Basic (1GB)
- **Region:** europe-west3

### VPC Connector
- **Name:** `meetup-connector`
- **Network:** default
- **IP Range:** 10.8.0.0/28

### Cloud Run Services

**Backend:**
- Service: `meetup-backend`
- Revision: `meetup-backend-00003-c8j`
- Environment:
  - `REDIS_URL=redis://10.189.125.115:6379`
  - `CORS_ORIGIN=https://meetup-frontend-1012349016840.europe-west3.run.app`
  - `FRONTEND_URL=https://meetup-frontend-1012349016840.europe-west3.run.app`

**Frontend:**
- Service: `meetup-frontend`
- Revision: `meetup-frontend-00002-sq8`
- Build Variables:
  - `VITE_API_URL=https://meetup-backend-1012349016840.europe-west3.run.app`
  - `VITE_WS_URL=wss://meetup-backend-1012349016840.europe-west3.run.app`

---

## Testing the Deployment

### 1. Quick Health Check
```bash
curl https://meetup-backend-1012349016840.europe-west3.run.app/v1/health
```

### 2. Open the App
Visit on your phone:
```
https://meetup-frontend-1012349016840.europe-west3.run.app
```

### 3. Test Full Flow
1. **Driver:** Create a session
2. **Driver:** Share the link (e.g., `https://meetup-frontend.../ABC123`)
3. **Passenger:** Click the link on their phone
4. **Both:** Grant location permissions
5. **Both:** Watch real-time distance updates
6. **Both:** Click "We Met!" when you meet

### 4. Monitor Analytics
```bash
curl https://meetup-backend-1012349016840.europe-west3.run.app/v1/analytics/stats
```

---

## Deployment Commands

### Redeploy Backend
```bash
cd server
gcloud run deploy meetup-backend \
  --source . \
  --platform managed \
  --region europe-west3 \
  --allow-unauthenticated \
  --vpc-connector meetup-connector \
  --set-env-vars REDIS_URL=redis://10.189.125.115:6379 \
  --set-env-vars CORS_ORIGIN=https://meetup-frontend-1012349016840.europe-west3.run.app \
  --set-env-vars FRONTEND_URL=https://meetup-frontend-1012349016840.europe-west3.run.app \
  --quiet
```

### Redeploy Frontend
```bash
cd frontend
gcloud run deploy meetup-frontend \
  --source . \
  --platform managed \
  --region europe-west3 \
  --allow-unauthenticated \
  --quiet
```

**Note:** Frontend uses `.env.production` file for build-time environment variables.

### View Logs
```bash
# Backend logs
gcloud run services logs read meetup-backend --region europe-west3 --limit 50

# Frontend logs
gcloud run services logs read meetup-frontend --region europe-west3 --limit 50

# Follow logs in real-time
gcloud run services logs tail meetup-backend --region europe-west3
```

---

## Analytics & Monitoring

See [ANALYTICS.md](./ANALYTICS.md) for complete analytics guide.

### Quick Stats
```bash
# Overall statistics
curl https://meetup-backend-1012349016840.europe-west3.run.app/v1/analytics/stats | json_pp

# Check for unusual activity
curl https://meetup-backend-1012349016840.europe-west3.run.app/v1/analytics/anomalies

# Recent events
curl "https://meetup-backend-1012349016840.europe-west3.run.app/v1/analytics/events?limit=50"
```

### Windows PowerShell
```powershell
Invoke-RestMethod https://meetup-backend-1012349016840.europe-west3.run.app/v1/analytics/stats | ConvertTo-Json
```

---

## Cost Estimates

### Current (MVP Testing)
- Cloud Run Backend: ~$5-10/month
- Cloud Run Frontend: ~$5/month
- Redis Basic (1GB): ~$30/month
- VPC Connector: ~$10/month
- **Total: ~$50-55/month**

### After Growth (100+ sessions/day)
- Cloud Run Backend: ~$20-50/month
- Cloud Run Frontend: ~$10/month
- Redis Standard: ~$70/month
- **Total: ~$100-130/month**

---

## Troubleshooting

### Frontend Not Loading
```bash
# Check service status
gcloud run services describe meetup-frontend --region europe-west3

# Check logs
gcloud run services logs read meetup-frontend --region europe-west3 --limit 20
```

### Backend Connection Issues
```bash
# Test health
curl https://meetup-backend-1012349016840.europe-west3.run.app/v1/health

# Check logs
gcloud run services logs read meetup-backend --region europe-west3 --limit 20
```

### WebSocket Not Connecting
- Verify URL uses `wss://` (not `ws://`)
- Check browser console for errors
- Verify CORS settings

### Location Not Working
- Must use HTTPS (✅ already enabled)
- Grant browser location permissions
- Test on Chrome/Safari mobile

---

## Original Deployment Guide

## Option 1: Google Cloud Run (Currently Deployed)

**Best for:** Quick deployment, automatic scaling, low cost for MVP

### Step 1: Setup Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required services
gcloud services enable run.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable vpcaccess.googleapis.com
```

### Step 2: Create Redis Instance (Memorystore)

```bash
# Create a Redis instance (free tier available)
gcloud redis instances create meetup-redis \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_6_x \
    --tier=basic

# Get the Redis host
gcloud redis instances describe meetup-redis --region=us-central1
# Note the 'host' value (e.g., 10.0.0.3)
```

### Step 3: Create VPC Connector (for Redis access)

```bash
gcloud compute networks vpc-access connectors create meetup-connector \
    --region=us-central1 \
    --range=10.8.0.0/28
```

### Step 4: Deploy Backend

```bash
cd server

# Build and deploy to Cloud Run
gcloud run deploy meetup-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --vpc-connector meetup-connector \
    --set-env-vars REDIS_URL=redis://YOUR_REDIS_HOST:6379 \
    --set-env-vars CORS_ORIGIN=https://meetup-frontend-XXXXX.run.app

# Note the backend URL (e.g., https://meetup-backend-XXXXX-uc.a.run.app)
```

### Step 5: Deploy Frontend

```bash
cd ../frontend

# Build and deploy with environment variables
gcloud run deploy meetup-frontend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-build-env-vars VITE_API_URL=https://meetup-backend-XXXXX.run.app \
    --set-build-env-vars VITE_WS_URL=wss://meetup-backend-XXXXX.run.app

# Note the frontend URL (e.g., https://meetup-frontend-XXXXX-uc.a.run.app)
```

### Step 6: Update Backend CORS

```bash
# Update backend with correct frontend URL
gcloud run services update meetup-backend \
    --region us-central1 \
    --set-env-vars CORS_ORIGIN=https://meetup-frontend-XXXXX.run.app \
    --set-env-vars FRONTEND_URL=https://meetup-frontend-XXXXX.run.app
```

### Cost Estimate (MVP)
- Cloud Run: ~$0-5/month (free tier: 2M requests, 360k GB-seconds)
- Redis (Memorystore Basic): ~$25/month (1GB)
- **Total: ~$25-30/month**

---

## Option 2: Firebase Hosting + Cloud Run (Best Integration)

**Best for:** If you're already using Firebase for another project

### Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize in project root
firebase init hosting

# Deploy backend to Cloud Run (same as Option 1)
# Then deploy frontend to Firebase Hosting
```

### Firebase Hosting Config (firebase.json)

```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "meetup-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Deploy

```bash
# Build frontend
cd frontend
npm run build

# Deploy
cd ..
firebase deploy --only hosting
```

### Cost Estimate
- Firebase Hosting: Free (Spark plan: 10GB storage, 360MB/day transfer)
- Cloud Run Backend: ~$0-5/month
- Redis: ~$25/month
- **Total: ~$25-30/month**

---

## Option 3: Single VM with Caddy (Most Cost-Effective)

**Best for:** Predictable low cost, learning experience

### Setup

```bash
# Create a VM
gcloud compute instances create meetup-app \
    --machine-type=e2-micro \
    --zone=us-central1-a \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=10GB \
    --tags=http-server,https-server

# SSH into VM
gcloud compute ssh meetup-app --zone=us-central1-a

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Caddy (automatic HTTPS)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### Caddyfile

```
your-domain.com {
    reverse_proxy localhost:5173

    handle_path /api/* {
        reverse_proxy localhost:3000
    }

    handle_path /ws {
        reverse_proxy localhost:3000
    }
}
```

### Cost Estimate
- e2-micro VM: ~$7/month (free tier available!)
- **Total: $0-7/month** (with free tier)

---

## Quick Start: Testing with Ngrok (Temporary)

For immediate testing with your drivers before full deployment:

```bash
# Install ngrok
# Windows: Download from ngrok.com
# Or use: choco install ngrok

# Start your servers locally
cd server && npm run dev
cd frontend && npm run dev

# In another terminal, expose backend
ngrok http 3000

# Update frontend/.env with ngrok URLs
VITE_API_URL=https://YOUR-ID.ngrok-free.app
VITE_WS_URL=wss://YOUR-ID.ngrok-free.app

# In another terminal, expose frontend
ngrok http 5173
```

**Note:** Free ngrok requires authentication and URLs change on restart. Good for quick testing only.

---

## Recommended Approach for Your Situation

Since you:
1. ✅ Already have Google Cloud Platform
2. ✅ Have a few drivers ready to test
3. ✅ Need HTTPS for mobile geolocation

**I recommend: Option 1 (Cloud Run)**

### Why?
- ✅ Fastest to deploy (5-10 minutes)
- ✅ Automatic HTTPS immediately
- ✅ No server management
- ✅ Scales automatically
- ✅ Pay only for actual usage
- ✅ Easy to update and rollback

### Next Steps

1. Deploy to Cloud Run (10 minutes)
2. Test with your drivers (2-3 days)
3. Gather feedback
4. If costs become an issue, migrate to VM (Option 3)

Would you like me to help you with the Cloud Run deployment? I can create a deployment script that automates the entire process.
