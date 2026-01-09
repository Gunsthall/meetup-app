#!/bin/bash

echo "========================================"
echo "MeetUp Mobile Testing Setup"
echo "========================================"
echo

echo "Step 1: Finding your IP address..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0)
    if [ -z "$IP" ]; then
        IP=$(ipconfig getifaddr en1)
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    echo "Unsupported OS. Please find your IP manually."
    exit 1
fi

echo "Found IP: $IP"
echo

echo "Step 2: Updating configuration files..."
echo

echo "Creating server/.env..."
cat > server/.env << EOF
# Server Configuration
PORT=3000

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Frontend URL (for share links)
FRONTEND_URL=http://$IP:5173

# CORS Configuration
CORS_ORIGIN=http://$IP:5173
EOF

echo "Creating frontend/.env..."
cat > frontend/.env << EOF
# Backend API URL
VITE_API_URL=http://$IP:3000

# WebSocket URL
VITE_WS_URL=ws://$IP:3000
EOF

echo
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo
echo "Your IP Address: $IP"
echo
echo "Next steps:"
echo "1. Start Redis:     docker run -p 6379:6379 redis:alpine"
echo "2. Start Backend:   cd server && npm run dev"
echo "3. Start Frontend:  cd frontend && npm run dev"
echo "4. On your phone, open: http://$IP:5173"
echo
echo "Make sure your phone is on the SAME Wi-Fi network!"
echo
echo "========================================"
