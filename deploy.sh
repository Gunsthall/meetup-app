#!/bin/bash
# MeetUp App - Automated Cloud Run Deployment Script

set -e  # Exit on error

echo "🚀 MeetUp App - Cloud Run Deployment"
echo "===================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No GCP project set. Please run:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📦 Project: $PROJECT_ID"
REGION="us-central1"
echo "🌍 Region: $REGION"
echo ""

# Prompt for confirmation
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo "Step 1: Enabling required services..."
gcloud services enable run.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable vpcaccess.googleapis.com
echo "✅ Services enabled"
echo ""

# Check if Redis instance exists
echo "Step 2: Checking Redis instance..."
if gcloud redis instances describe meetup-redis --region=$REGION &>/dev/null; then
    echo "✅ Redis instance already exists"
    REDIS_HOST=$(gcloud redis instances describe meetup-redis --region=$REGION --format="value(host)")
else
    echo "Creating Redis instance (this takes ~5 minutes)..."
    gcloud redis instances create meetup-redis \
        --size=1 \
        --region=$REGION \
        --redis-version=redis_6_x \
        --tier=basic
    REDIS_HOST=$(gcloud redis instances describe meetup-redis --region=$REGION --format="value(host)")
    echo "✅ Redis instance created"
fi
REDIS_URL="redis://$REDIS_HOST:6379"
echo "   Redis URL: $REDIS_URL"
echo ""

# Check if VPC connector exists
echo "Step 3: Checking VPC connector..."
if gcloud compute networks vpc-access connectors describe meetup-connector --region=$REGION &>/dev/null; then
    echo "✅ VPC connector already exists"
else
    echo "Creating VPC connector..."
    gcloud compute networks vpc-access connectors create meetup-connector \
        --region=$REGION \
        --range=10.8.0.0/28
    echo "✅ VPC connector created"
fi
echo ""

# Deploy backend
echo "Step 4: Deploying backend..."
cd server
gcloud run deploy meetup-backend \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --vpc-connector meetup-connector \
    --set-env-vars REDIS_URL=$REDIS_URL \
    --set-env-vars CORS_ORIGIN="*" \
    --quiet

BACKEND_URL=$(gcloud run services describe meetup-backend --region=$REGION --format="value(status.url)")
echo "✅ Backend deployed"
echo "   Backend URL: $BACKEND_URL"
cd ..
echo ""

# Deploy frontend
echo "Step 5: Deploying frontend..."
cd frontend

# Convert HTTPS to WSS for WebSocket
BACKEND_WS_URL=$(echo $BACKEND_URL | sed 's/https:/wss:/')

gcloud run deploy meetup-frontend \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-build-env-vars VITE_API_URL=$BACKEND_URL \
    --set-build-env-vars VITE_WS_URL=$BACKEND_WS_URL \
    --quiet

FRONTEND_URL=$(gcloud run services describe meetup-frontend --region=$REGION --format="value(status.url)")
echo "✅ Frontend deployed"
echo "   Frontend URL: $FRONTEND_URL"
cd ..
echo ""

# Update backend with correct CORS
echo "Step 6: Updating backend CORS..."
gcloud run services update meetup-backend \
    --region $REGION \
    --set-env-vars CORS_ORIGIN=$FRONTEND_URL \
    --set-env-vars FRONTEND_URL=$FRONTEND_URL \
    --quiet
echo "✅ CORS updated"
echo ""

# Summary
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "📱 Frontend: $FRONTEND_URL"
echo "🔧 Backend:  $BACKEND_URL"
echo ""
echo "✨ Your app is now live with HTTPS!"
echo "   Share this link with your drivers: $FRONTEND_URL"
echo ""
echo "💰 Estimated monthly cost: ~$25-30"
echo "   - Cloud Run: ~$0-5 (within free tier)"
echo "   - Redis: ~$25"
echo ""
echo "📊 Monitor your app:"
echo "   https://console.cloud.google.com/run?project=$PROJECT_ID"
echo ""
echo "🔄 To redeploy:"
echo "   ./deploy.sh"
echo ""
