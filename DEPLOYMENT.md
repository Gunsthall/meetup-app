# MeetUp App - Production Deployment Guide

This guide covers deploying the MeetUp app to production with HTTPS support for mobile geolocation.

## Prerequisites

- Google Cloud Platform account (you already have this!)
- gcloud CLI installed
- Domain name (optional, but recommended)

## Option 1: Google Cloud Run (Recommended for MVP)

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
